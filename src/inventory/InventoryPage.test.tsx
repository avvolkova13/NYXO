import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import App from '../App'
import {
  createDefaultMarketplaceState,
  readMarketplaceState,
  replaceMarketplaceState,
} from '../marketplace/marketplaceStore'
import styles from '../styles.css?raw'

const validTradeUrl =
  'https://steamcommunity.com/tradeoffer/new/?partner=12345678&token=AbC_123'

function renderInventory(inventory = createDefaultMarketplaceState().inventory) {
  replaceMarketplaceState({
    ...createDefaultMarketplaceState(),
    balanceCoins: 4_200,
    inventory,
  })
  window.history.replaceState({}, '', '/inventory')
  return render(<App />)
}

describe('InventoryPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
  })

  it('renders an inventory card with image, name, status, COINS value, and disabled resale', () => {
    renderInventory([
      {
        id: 'inventory-howl',
        productId: 'm4a4-howl',
        name: 'M4A4 | Вой',
        valueCoins: 15_042,
        acquiredAt: '2026-07-16T10:30:00.000Z',
        status: 'available',
        imageSrc: '/inventory-howl.png',
      },
    ])

    const card = screen.getByTestId('inventory-item')
    expect(within(card).getByRole('img', { name: 'M4A4 | Вой' })).toHaveAttribute(
      'src',
      '/inventory-howl.png',
    )
    expect(within(card).getByRole('heading', { name: 'M4A4 | Вой' })).toBeInTheDocument()
    expect(within(card).getByText('Доступен')).toBeInTheDocument()
    expect(within(card).getByText('15 042 COINS')).toBeInTheDocument()
    expect(within(card).getByRole('button', { name: 'Продать M4A4 | Вой' })).toBeDisabled()
    expect(within(card).getByText(/перепродажа пока недоступна/i)).toBeInTheDocument()
    expect(screen.queryByText(/₽|руб/i)).not.toBeInTheDocument()
  })

  it('shows required and invalid Trade URL errors, then persists a valid URL', async () => {
    const user = userEvent.setup()
    renderInventory([
      {
        id: 'inventory-howl',
        productId: 'm4a4-howl',
        name: 'M4A4 | Вой',
        valueCoins: 15_042,
        acquiredAt: '2026-07-16T10:30:00.000Z',
        status: 'available',
      },
    ])

    await user.click(screen.getByRole('button', { name: 'Вывести M4A4 | Вой' }))
    expect(screen.getByRole('alert')).toHaveTextContent(/укажите Steam Trade URL/i)

    const input = screen.getByRole('textbox', { name: 'Steam Trade URL' })
    await user.type(input, 'https://steamcommunity.com/id/not-a-trade-url')
    await user.click(screen.getByRole('button', { name: 'Сохранить Trade URL' }))
    expect(screen.getByRole('alert')).toHaveTextContent(/корректный Steam Trade URL/i)

    await user.clear(input)
    await user.type(input, validTradeUrl)
    await user.click(screen.getByRole('button', { name: 'Сохранить Trade URL' }))
    expect(screen.getByRole('status')).toHaveTextContent(/Trade URL сохранён/i)
    expect(readMarketplaceState().steamTradeUrl).toBe(validTradeUrl)
  })

  it('marks withdrawal pending while keeping the COINS balance unchanged', async () => {
    const user = userEvent.setup()
    renderInventory([
      {
        id: 'inventory-howl',
        productId: 'm4a4-howl',
        name: 'M4A4 | Вой',
        valueCoins: 15_042,
        acquiredAt: '2026-07-16T10:30:00.000Z',
        status: 'available',
      },
    ])

    await user.type(screen.getByRole('textbox', { name: 'Steam Trade URL' }), validTradeUrl)
    await user.click(screen.getByRole('button', { name: 'Сохранить Trade URL' }))
    await user.click(screen.getByRole('button', { name: 'Вывести M4A4 | Вой' }))

    expect(screen.getByText('Вывод ожидает подтверждения')).toBeInTheDocument()
    expect(readMarketplaceState().inventory[0].status).toBe('withdrawal-pending')
    expect(readMarketplaceState().balanceCoins).toBe(4_200)
    expect(screen.getByRole('button', { name: 'Вывод M4A4 | Вой ожидает подтверждения' })).toBeDisabled()
  })

  it('renders a useful empty inventory and marks the header destination current', () => {
    renderInventory([])

    const emptyState = screen.getByRole('heading', { name: 'Инвентарь пуст' }).closest('section')
    expect(emptyState).not.toBeNull()
    expect(within(emptyState!).getByRole('link', { name: 'Перейти в каталог' })).toHaveAttribute(
      'href',
      '/catalog',
    )
    expect(screen.getByRole('link', { name: 'Инвентарь' })).toHaveAttribute('href', '/inventory')
    expect(screen.getByRole('link', { name: 'Инвентарь' })).toHaveAttribute('aria-current', 'page')
  })

  it('keeps comparable desktop cards and a single mobile column', () => {
    expect(styles).toMatch(
      /\.inventory-page__grid\s*{[^}]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\);/,
    )
    const mobileStart = styles.indexOf('@media (max-width: 600px)')
    expect(styles.slice(mobileStart)).toMatch(
      /\.inventory-page__grid\s*{[^}]*grid-template-columns:\s*1fr;/,
    )
  })
})
