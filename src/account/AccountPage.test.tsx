import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import App from '../App'
import {
  createDefaultMarketplaceState,
  MARKETPLACE_STORAGE_KEY,
  readMarketplaceState,
  replaceMarketplaceState,
} from '../marketplace/marketplaceStore'
import styles from '../styles.css?raw'

function renderRoute(pathname: string) {
  window.history.replaceState({}, '', pathname)
  return render(<App />)
}

function mediaBlockContaining(query: string, selector: string) {
  const marker = `@media (${query})`
  let searchFrom = 0

  while (searchFrom < styles.length) {
    const mediaStart = styles.indexOf(marker, searchFrom)
    if (mediaStart === -1) break
    const blockStart = styles.indexOf('{', mediaStart + marker.length)
    let depth = 0

    for (let index = blockStart; index < styles.length; index += 1) {
      if (styles[index] === '{') depth += 1
      if (styles[index] === '}') depth -= 1
      if (depth === 0) {
        const block = styles.slice(blockStart + 1, index)
        if (block.includes(selector)) return block
        searchFrom = index + 1
        break
      }
    }
  }

  throw new Error(`No @media (${query}) block contains ${selector}`)
}

describe('AccountPage', () => {
  beforeEach(() => {
    localStorage.clear()
    replaceMarketplaceState(createDefaultMarketplaceState())
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
  })

  afterEach(() => {
    window.history.replaceState({}, '', '/')
    vi.restoreAllMocks()
  })

  it('exposes all seven account destinations and a COINS-only overview', () => {
    renderRoute('/account')

    const navigation = screen.getByRole('navigation', { name: 'Личный кабинет' })
    for (const [label, href] of [
      ['Обзор', '/account'],
      ['Покупки', '/account/purchases'],
      ['Платежи', '/account/payments'],
      ['Инвентарь', '/inventory'],
      ['Steam', '/account/steam'],
      ['Настройки', '/account/settings'],
      ['Поддержка', '/support'],
    ]) {
      expect(within(navigation).getByRole('link', { name: label })).toHaveAttribute('href', href)
    }

    expect(within(navigation).getByRole('link', { name: 'Обзор' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Личный кабинет' })).toBeInTheDocument()
    expect(screen.getByText('2 500 COINS')).toBeInTheDocument()
    expect(screen.queryByText(/₽|руб/i)).not.toBeInTheDocument()
    expect(screen.getByText('AK-47 | Wild Lotus')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Все покупки' })).toHaveAttribute(
      'href',
      '/account/purchases',
    )
    expect(screen.getByRole('link', { name: 'Пополнить баланс' })).toHaveAttribute(
      'href',
      '/balance/top-up?returnTo=%2Faccount',
    )
  })

  it('shows seeded and locally completed purchases with complete order details and actions', () => {
    const state = createDefaultMarketplaceState()
    replaceMarketplaceState({
      ...state,
      orders: [
        ...state.orders,
        {
          id: 'local-order-002',
          number: 'NYXO-260716-0002',
          createdAt: '2026-07-16T10:30:00.000Z',
          items: [
            {
              productId: 'local-item',
              name: 'M4A4 | Howl',
              priceCoins: 4_200,
              category: 'CS2',
            },
          ],
          totalCoins: 4_200,
          status: 'completed',
        },
      ],
    })

    renderRoute('/account/purchases')

    expect(screen.getByRole('heading', { level: 1, name: 'Покупки' })).toBeInTheDocument()
    const seededOrder = screen.getByRole('article', { name: 'Заказ NYXO-240601' })
    expect(seededOrder).toHaveTextContent('01.06.2026')
    expect(seededOrder).toHaveTextContent('AK-47 | Wild Lotus')
    expect(seededOrder).toHaveTextContent('1 850 COINS')
    expect(seededOrder).toHaveTextContent('Выполнен')
    expect(within(seededOrder).getByRole('link', { name: 'Найти в каталоге' })).toHaveAttribute(
      'href',
      '/catalog/ak47-wild-lotus',
    )
    expect(screen.getByRole('article', { name: 'Заказ NYXO-260716-0002' })).toHaveTextContent(
      'M4A4 | Howl',
    )
  })

  it('shows purchase and top-up entries in the COINS payment history', () => {
    const state = createDefaultMarketplaceState()
    replaceMarketplaceState({
      ...state,
      payments: [
        ...state.payments,
        {
          id: 'top-up-002',
          createdAt: '2026-07-16T09:00:00.000Z',
          kind: 'top-up',
          amountCoins: 3_000,
          status: 'completed',
        },
      ],
    })

    renderRoute('/account/payments')

    expect(screen.getByRole('heading', { level: 1, name: 'История платежей' })).toBeInTheDocument()
    expect(screen.getByText('Покупка')).toBeInTheDocument()
    expect(screen.getByText('−1 850 COINS')).toBeInTheDocument()
    expect(screen.getByText('Пополнение')).toBeInTheDocument()
    expect(screen.getByText('+3 000 COINS')).toBeInTheDocument()
    expect(screen.getAllByText('Выполнен')).toHaveLength(2)
  })

  it.each([
    ['/account/purchases', 'Покупки'],
    ['/account/payments', 'История платежей'],
  ])('keeps %s usable when persisted history dates are malformed', (route, heading) => {
    const malformed = createDefaultMarketplaceState()
    malformed.orders[0].createdAt = 'not-a-date'
    malformed.payments[0].createdAt = 'also-not-a-date'
    localStorage.setItem(MARKETPLACE_STORAGE_KEY, JSON.stringify(malformed))

    expect(() => renderRoute(route)).not.toThrow()
    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument()
    expect(screen.getByText('Дата недоступна')).not.toHaveAttribute('datetime')
  })

  it('shows Steam state and persists an edited Trade URL', async () => {
    replaceMarketplaceState({
      ...createDefaultMarketplaceState(),
      session: {
        method: 'steam',
        displayName: 'Игрок NYXO',
        createdAt: '2026-07-16T08:00:00.000Z',
      },
    })
    const user = userEvent.setup()
    renderRoute('/account/steam')

    expect(screen.getByRole('heading', { level: 1, name: 'Steam' })).toBeInTheDocument()
    expect(screen.getByText('Steam подключён')).toBeInTheDocument()
    expect(screen.getByText('Игрок NYXO')).toBeInTheDocument()

    const input = screen.getByRole('textbox', { name: 'Steam Trade URL' })
    await user.type(
      input,
      'https://steamcommunity.com/tradeoffer/new/?partner=123&token=abc',
    )
    await user.click(screen.getByRole('button', { name: 'Сохранить Trade URL' }))

    expect(readMarketplaceState().steamTradeUrl).toBe(
      'https://steamcommunity.com/tradeoffer/new/?partner=123&token=abc',
    )
    expect(screen.getByRole('status')).toHaveTextContent('Trade URL сохранён')
    expect(document.body).not.toHaveTextContent(/демонстрац|локальн|не выполняется|не подключ/i)
  })

  it('persists settings, confirms the change, and logs out', async () => {
    replaceMarketplaceState({
      ...createDefaultMarketplaceState(),
      session: {
        method: 'email',
        displayName: 'player@example.com',
        email: 'player@example.com',
        createdAt: '2026-07-16T08:00:00.000Z',
      },
    })
    const user = userEvent.setup()
    renderRoute('/account/settings')

    const notifications = screen.getByRole('checkbox', { name: 'Получать уведомления по email' })
    await user.click(notifications)
    await user.click(screen.getByRole('button', { name: 'Сохранить настройки' }))

    expect(readMarketplaceState().preferences.emailNotifications).toBe(true)
    expect(screen.getByRole('status')).toHaveTextContent('Настройки сохранены')

    await user.click(screen.getByRole('button', { name: 'Выйти из аккаунта' }))
    expect(readMarketplaceState().session).toBeNull()
    expect(screen.getByRole('status')).toHaveTextContent('Вы вышли из аккаунта')
  })

  it('adds an Account header destination and constrains horizontal account scrolling to narrow screens', () => {
    renderRoute('/account')

    const header = document.querySelector('.site-header') as HTMLElement
    expect(within(header).getByRole('link', { name: 'Аккаунт' })).toHaveAttribute('href', '/account')
    expect(within(header).getByRole('link', { name: 'Аккаунт' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(styles).toMatch(/\.account-page\s*{[^}]*overflow-x:\s*clip;/)
    expect(styles).toMatch(/\.account-nav\s*{[^}]*overflow-x:\s*visible;/)
    expect(mediaBlockContaining('max-width: 760px', '.account-nav')).toMatch(
      /\.account-nav\s*{[^}]*overflow-x:\s*auto;/,
    )
  })
})
