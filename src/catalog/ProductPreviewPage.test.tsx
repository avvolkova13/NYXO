import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { products } from '../data/products'
import {
  MARKETPLACE_STORAGE_KEY,
  createDefaultMarketplaceState,
  readMarketplaceState,
  replaceMarketplaceState,
} from '../marketplace/marketplaceStore'
import { ProductPreviewPage } from './ProductPreviewPage'

describe('ProductPreviewPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    replaceMarketplaceState(createDefaultMarketplaceState())
  })

  afterEach(() => vi.restoreAllMocks())

  it('renders the complete product inspection in COINS and keeps its image fallback', () => {
    const product = products[0]
    const { container } = render(<ProductPreviewPage slug={product.slug} />)

    expect(screen.getByRole('heading', { level: 1, name: product.name })).toBeInTheDocument()
    expect(screen.getAllByText(product.category).length).toBeGreaterThan(0)
    expect(screen.getByText(product.description)).toBeInTheDocument()
    expect(screen.getByText(product.game!)).toBeInTheDocument()
    expect(screen.getByText(product.condition!)).toBeInTheDocument()
    expect(screen.getByText(product.rarity!)).toBeInTheDocument()
    expect(screen.getByText(product.weaponType!)).toBeInTheDocument()
    expect(screen.getByText(product.attribute!)).toBeInTheDocument()
    expect(screen.getByText('В наличии')).toBeInTheDocument()
    expect(screen.getByText(product.delivery)).toBeInTheDocument()
    expect(screen.getByText(/15\s*474 COINS/)).toBeInTheDocument()

    fireEvent.error(container.querySelector('.product-media__image')!)
    expect(container.querySelector('.product-media__fallback')).toHaveTextContent('SKIN ARCHIVE')
  })

  it('adds through shared state, changes the CTA, and exposes real cart and catalog links', async () => {
    const product = products[0]
    const user = userEvent.setup()
    render(<ProductPreviewPage slug={product.slug} />)

    expect(
      screen.getAllByRole('link', { name: 'Каталог' }).every((link) => link.getAttribute('href') === '/catalog'),
    ).toBe(true)
    expect(screen.getByRole('link', { name: 'Корзина' })).toHaveAttribute('href', '/cart')

    await user.click(screen.getByRole('button', { name: `Добавить ${product.name} в корзину` }))

    expect(readMarketplaceState().cartProductIds).toEqual([product.id])
    expect(screen.getByRole('button', { name: `${product.name} уже в корзине` })).toHaveTextContent(
      'В корзине',
    )
    expect(screen.getByRole('link', { name: 'Перейти в корзину' })).toHaveAttribute('href', '/cart')
    expect(screen.getByRole('status')).toHaveTextContent('добавлено в корзину')
  })

  it('reflects an item already present in shared cart state', () => {
    const product = products[0]
    replaceMarketplaceState({
      ...createDefaultMarketplaceState(),
      cartProductIds: [product.id],
    })

    render(<ProductPreviewPage slug={product.slug} />)

    expect(screen.getByRole('button', { name: `${product.name} уже в корзине` })).toBeDisabled()
    expect(screen.getByRole('link', { name: 'Перейти в корзину' })).toHaveAttribute('href', '/cart')
  })

  it('keeps the added state in memory and reports recoverable persistence failure', async () => {
    const product = products[0]
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota exceeded')
    })
    const user = userEvent.setup()
    render(<ProductPreviewPage slug={product.slug} />)

    await expect(
      user.click(screen.getByRole('button', { name: `Добавить ${product.name} в корзину` })),
    ).resolves.toBeUndefined()

    expect(screen.getByRole('button', { name: `${product.name} уже в корзине` })).toHaveTextContent(
      'В корзине',
    )
    expect(screen.getByRole('status')).toHaveTextContent('Не удалось сохранить')
  })

  it('clears product-specific feedback when the mounted route changes slug', async () => {
    const firstProduct = products[0]
    const nextProduct = products[1]
    const user = userEvent.setup()
    const { rerender } = render(<ProductPreviewPage slug={firstProduct.slug} />)

    await user.click(
      screen.getByRole('button', { name: `Добавить ${firstProduct.name} в корзину` }),
    )
    expect(screen.getByRole('status')).toHaveTextContent(firstProduct.name)

    rerender(<ProductPreviewPage slug={nextProduct.slug} />)

    expect(screen.getByRole('heading', { level: 1, name: nextProduct.name })).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(readMarketplaceState().cartProductIds).toEqual([firstProduct.id])
  })

  it('migrates valid legacy ids once without duplicates and removes the retired key', () => {
    const product = products[0]
    const secondProduct = products[1]
    window.localStorage.setItem(
      'nyxo:cart',
      JSON.stringify([product.id, product.id, secondProduct.id, 'unknown-product', 42]),
    )
    replaceMarketplaceState({
      ...createDefaultMarketplaceState(),
      cartProductIds: [product.id],
    })

    render(<ProductPreviewPage slug={product.slug} />)

    expect(readMarketplaceState().cartProductIds).toEqual([product.id, secondProduct.id])
    expect(window.localStorage.getItem('nyxo:cart')).toBeNull()
    expect(window.localStorage.getItem(MARKETPLACE_STORAGE_KEY)).not.toBeNull()
  })

  it('renders a complete unknown-product state with Home and Catalog actions', () => {
    render(<ProductPreviewPage slug="missing-product" />)

    expect(screen.getByRole('heading', { name: 'Товар не найден' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'На главную' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Вернуться в каталог' })).toHaveAttribute(
      'href',
      '/catalog',
    )
  })
})
