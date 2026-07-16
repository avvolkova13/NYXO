import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import App from '../App'
import { products } from '../data/products'
import styles from '../styles.css?raw'
import {
  createDefaultMarketplaceState,
  readMarketplaceState,
  replaceMarketplaceState,
} from './marketplaceStore'

const skin = products.find((product) => product.id === 'ak47-neon-rider')!
const consentSentence =
  'Я принимаю условия Пользовательского соглашения (Оферты) и даю согласие на обработку персональных данных в соответствии с Политикой конфиденциальности.'
const validTradeUrl =
  'https://steamcommunity.com/tradeoffer/new/?partner=12345678&token=AbC_123'

describe('complete marketplace flow', () => {
  beforeEach(() => {
    localStorage.clear()
    replaceMarketplaceState(createDefaultMarketplaceState())
    window.history.replaceState({}, '', '/catalog')
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
  })

  it('hands one skin from catalog through funding, Steam, purchase, inventory, and withdrawal', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(
      screen.getByRole('button', { name: `Добавить ${skin.name} в корзину` }),
    )
    expect(readMarketplaceState().cartProductIds).toEqual([skin.id])

    await user.click(
      within(screen.getByRole('navigation', { name: 'Основная навигация' })).getByRole(
        'link',
        { name: 'Корзина, 1 товар' },
      ),
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Корзина' })).toBeInTheDocument()
    expect(screen.getByText('Не хватает 4 420 COINS')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /Пополнить на 4\s420 COINS/ }))
    const topUp = screen.getByRole('button', { name: 'Пополнить баланс' })
    expect(topUp).toBeDisabled()

    await user.click(screen.getByRole('radio', { name: '5 000 COINS' }))
    expect(topUp).toBeDisabled()
    await user.click(screen.getByRole('checkbox', { name: consentSentence }))
    expect(topUp).toBeEnabled()
    await user.click(topUp)

    expect(screen.getByRole('heading', { name: 'Баланс COINS обновлён' })).toBeInTheDocument()
    expect(readMarketplaceState().balanceCoins).toBe(7_500)
    await user.click(screen.getByRole('link', { name: 'Вернуться' }))

    expect(screen.getByText('Для передачи скина нужна активная Steam-сессия.')).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Продолжить со Steam' }))
    expect(screen.getByRole('status')).toHaveTextContent('Для передачи скина нужен вход через Steam')
    await user.click(screen.getByRole('button', { name: 'Продолжить со Steam' }))

    expect(window.location.pathname).toBe('/cart')
    await user.click(screen.getByRole('button', { name: 'Оплатить заказ' }))
    expect(screen.getByRole('heading', { name: 'Покупка завершена' })).toBeInTheDocument()

    const purchasedState = readMarketplaceState()
    const order = purchasedState.orders.at(-1)!
    expect(order.items).toEqual([
      expect.objectContaining({ productId: skin.id, name: skin.name }),
    ])
    expect(purchasedState.cartProductIds).toEqual([])
    expect(purchasedState.balanceCoins).toBe(580)

    await user.click(screen.getByRole('link', { name: 'Мои покупки' }))
    const orderCard = screen.getByRole('article', { name: `Заказ ${order.number}` })
    expect(within(orderCard).getByText(skin.name)).toBeInTheDocument()

    await user.click(document.querySelector<HTMLAnchorElement>('.inventory-link')!)
    const inventoryCard = screen.getByTestId('inventory-item')
    expect(within(inventoryCard).getByRole('heading', { name: skin.name })).toBeInTheDocument()

    await user.click(within(inventoryCard).getByRole('button', { name: `Вывести ${skin.name}` }))
    expect(screen.getByRole('alert')).toHaveTextContent('Укажите Steam Trade URL')

    await user.type(screen.getByRole('textbox', { name: 'Steam Trade URL' }), validTradeUrl)
    await user.click(screen.getByRole('button', { name: 'Сохранить Trade URL' }))
    await user.click(within(inventoryCard).getByRole('button', { name: `Вывести ${skin.name}` }))

    expect(within(inventoryCard).getByText('Вывод ожидает подтверждения')).toBeInTheDocument()
    expect(readMarketplaceState().inventory).toEqual([
      expect.objectContaining({ productId: skin.id, status: 'withdrawal-pending' }),
    ])
  })

  it('keeps the live mobile action surfaces at least 44px tall', () => {
    const mobileTargetRule = styles.lastIndexOf(
      '/* Preserve a full mobile hit area after every late workstation/header cascade resolves. */',
    )
    expect(mobileTargetRule).toBeGreaterThan(
      styles.slice(0, mobileTargetRule).lastIndexOf('.site-header .inventory-link'),
    )
    expect(styles).toMatch(
      /@media \(max-width: 600px\)\s*{[^@]*\.site-header \.inventory-link,[^@]*\.hero button,[^@]*\.catalog-tools button,[^@]*\.account button,[^@]*\.checkout \.nyxo-action,[^@]*\.support-page \.nyxo-action\s*{[^}]*min-height:\s*44px;/,
    )
  })
})
