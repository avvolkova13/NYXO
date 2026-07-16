import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { products } from '../data/products'
import {
  createDefaultMarketplaceState,
  readMarketplaceState,
  replaceMarketplaceState,
} from '../marketplace/marketplaceStore'
import { CartPage } from './CartPage'

const skin = products.find((product) => product.kind === 'skin')!
const service = products.find((product) => product.kind === 'steam-topup')!

describe('CartPage', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.replaceState({}, '', '/cart')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders an empty state with a working catalog action', () => {
    replaceMarketplaceState(createDefaultMarketplaceState())
    render(<CartPage />)

    expect(screen.getByRole('heading', { level: 1, name: 'Корзина' })).toBeInTheDocument()
    expect(screen.getByText('Корзина пуста')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Вернуться в каталог' })).toHaveAttribute(
      'href',
      '/catalog',
    )
  })

  it('cleans an unknown-only cart so it cannot strand shared state', async () => {
    replaceMarketplaceState({
      ...createDefaultMarketplaceState(),
      cartProductIds: ['retired-product'],
    })
    render(<CartPage />)

    expect(screen.getByText('Корзина пуста')).toBeInTheDocument()
    expect(await screen.findByText('Корзина пуста')).toBeInTheDocument()
    expect(readMarketplaceState().cartProductIds).toEqual([])
  })

  it('removes unknown ids while preserving known cart products', async () => {
    replaceMarketplaceState({
      ...createDefaultMarketplaceState(),
      cartProductIds: ['retired-product', service.id, 'another-retired-product'],
    })
    render(<CartPage />)

    expect(screen.getByText(service.name)).toBeInTheDocument()
    await screen.findByText(service.name)
    expect(readMarketplaceState().cartProductIds).toEqual([service.id])
  })

  it('exposes a retry when unknown-id cleanup cannot be persisted', async () => {
    replaceMarketplaceState({
      ...createDefaultMarketplaceState(),
      cartProductIds: ['retired-product'],
    })
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota exceeded')
    })
    const user = userEvent.setup()
    render(<CartPage />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось очистить корзину')
    expect(readMarketplaceState().cartProductIds).toEqual(['retired-product'])

    setItem.mockRestore()
    await user.click(screen.getByRole('button', { name: 'Повторить очистку' }))
    expect(readMarketplaceState().cartProductIds).toEqual([])
    expect(screen.queryByRole('button', { name: 'Повторить очистку' })).not.toBeInTheDocument()
  })

  it('removes a shared product row and persists the cart', async () => {
    replaceMarketplaceState({
      ...createDefaultMarketplaceState(),
      cartProductIds: [service.id, skin.id],
    })
    const user = userEvent.setup()
    render(<CartPage />)

    expect(screen.getByText(service.name)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: `Удалить ${service.name}` }))

    expect(screen.queryByText(service.name)).not.toBeInTheDocument()
    expect(readMarketplaceState().cartProductIds).toEqual([skin.id])
  })

  it('shows exact COINS shortage and integer top-up destination', () => {
    replaceMarketplaceState({
      ...createDefaultMarketplaceState(),
      balanceCoins: 100,
      cartProductIds: [service.id],
    })
    render(<CartPage />)

    expect(screen.getByText('Не хватает 400 COINS')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Пополнить на 400 COINS' })).toHaveAttribute(
      'href',
      '/balance/top-up?returnTo=%2Fcart&needed=400',
    )
  })

  it('routes a funded skin purchase to Steam authorization', () => {
    replaceMarketplaceState({
      ...createDefaultMarketplaceState(),
      balanceCoins: 20_000,
      cartProductIds: [skin.id],
    })
    render(<CartPage />)

    expect(screen.getByRole('link', { name: 'Войти через Steam' })).toHaveAttribute(
      'href',
      '/auth?returnTo=%2Fcart&required=steam',
    )
  })

  it('shows one receipt after a successful persisted purchase', async () => {
    replaceMarketplaceState({
      ...createDefaultMarketplaceState(),
      balanceCoins: 1_000,
      cartProductIds: [service.id],
    })
    const user = userEvent.setup()
    render(<CartPage />)

    await user.dblClick(screen.getByRole('button', { name: 'Оплатить заказ' }))

    expect(screen.getByRole('status')).toHaveAccessibleName('Покупка завершена')
    expect(screen.getByRole('heading', { name: 'Покупка завершена' })).toBeInTheDocument()
    expect(screen.getByText(/NYXO-/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Мои покупки' })).toHaveAttribute(
      'href',
      '/account/purchases',
    )
    expect(screen.getByRole('link', { name: 'Открыть инвентарь' })).toHaveAttribute(
      'href',
      '/inventory',
    )
    expect(readMarketplaceState().orders).toHaveLength(2)
    expect(readMarketplaceState().payments).toHaveLength(2)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByText('Условия покупки изменились')).not.toBeInTheDocument()
  })

  it('shows a storage error and no false receipt when persistence fails', async () => {
    replaceMarketplaceState({
      ...createDefaultMarketplaceState(),
      balanceCoins: 1_000,
      cartProductIds: [service.id],
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota exceeded')
    })
    const user = userEvent.setup()
    render(<CartPage />)

    await user.click(screen.getByRole('button', { name: 'Оплатить заказ' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Не удалось сохранить покупку')
    expect(screen.queryByRole('heading', { name: 'Покупка завершена' })).not.toBeInTheDocument()
    expect(readMarketplaceState().cartProductIds).toEqual([service.id])
    expect(readMarketplaceState().balanceCoins).toBe(1_000)
  })
})
