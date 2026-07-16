import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { products } from '../data/products'
import { CatalogPage } from './CatalogPage'
import { ProductPreviewPage } from './ProductPreviewPage'

describe('CatalogPage', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/catalog')
    window.localStorage.clear()
  })

  it('searches for Steam and shows only matching products', async () => {
    const user = userEvent.setup()
    render(<CatalogPage />)

    await user.type(screen.getByRole('searchbox', { name: 'Поиск по каталогу' }), 'Steam')

    expect(
      screen
        .getAllByTestId('catalog-product')
        .every((card) => card.textContent?.includes('Steam')),
    ).toBe(true)
    expect(window.location.search).toContain('query=Steam')
  })

  it('clears filters from the empty state', async () => {
    const user = userEvent.setup()
    render(<CatalogPage />)

    await user.type(
      screen.getByRole('searchbox', { name: 'Поиск по каталогу' }),
      'несуществующий товар',
    )
    await user.click(screen.getByRole('button', { name: 'Сбросить фильтры' }))

    expect(screen.getAllByTestId('catalog-product').length).toBeGreaterThan(0)
    expect(window.location.search).toBe('')
  })

  it('adds a product to the mock cart with confirmation and no duplicate ids', async () => {
    const user = userEvent.setup()
    render(<CatalogPage />)
    const buttons = screen.getAllByRole('button', { name: 'Добавить в корзину' })

    await user.click(buttons[0])
    await user.click(buttons[0])

    expect(screen.getByRole('status')).toHaveTextContent('добавлено в корзину')
    expect(JSON.parse(window.localStorage.getItem('nyxo:cart') ?? '[]')).toEqual([
      products[3].id,
    ])
  })

  it('recovers from malformed cart storage', async () => {
    window.localStorage.setItem('nyxo:cart', '{broken')
    const user = userEvent.setup()
    render(<CatalogPage />)

    await user.click(screen.getAllByRole('button', { name: 'Добавить в корзину' })[0])

    expect(JSON.parse(window.localStorage.getItem('nyxo:cart') ?? '[]')).toHaveLength(1)
  })

  it('restores URL state and exposes an accessible filter disclosure', async () => {
    window.history.replaceState(null, '', '/catalog?kinds=steam-topup&sort=price-asc')
    const user = userEvent.setup()
    render(<CatalogPage />)

    expect(screen.getByRole('button', { name: 'Steam' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('combobox', { name: 'Сортировка' })).toHaveValue('price-asc')

    const disclosure = screen.getByRole('button', { name: 'Показать фильтры' })
    expect(disclosure).toHaveAttribute('aria-expanded', 'false')
    await user.click(disclosure)
    expect(screen.getByRole('button', { name: 'Скрыть фильтры' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })
})

describe('ProductPreviewPage', () => {
  beforeEach(() => window.localStorage.clear())

  it('shows every available attribute and adds the item to the cart', async () => {
    const product = products[0]
    const user = userEvent.setup()
    render(<ProductPreviewPage slug={product.slug} />)

    expect(screen.getByRole('heading', { name: product.name })).toBeInTheDocument()
    expect(screen.getByText(product.condition!)).toBeInTheDocument()
    expect(screen.getByText(product.rarity!)).toBeInTheDocument()
    expect(screen.getByText(product.weaponType!)).toBeInTheDocument()
    expect(screen.getByText(product.attribute!)).toBeInTheDocument()
    expect(screen.getByText(product.delivery)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Добавить в корзину' }))
    expect(screen.getByRole('status')).toHaveTextContent('добавлено в корзину')
    expect(JSON.parse(window.localStorage.getItem('nyxo:cart') ?? '[]')).toEqual([product.id])
  })

  it('shows an unknown-product state with a working catalog link', () => {
    render(<ProductPreviewPage slug="missing-product" />)

    expect(screen.getByRole('heading', { name: 'Товар не найден' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Вернуться в каталог' })).toHaveAttribute(
      'href',
      '/catalog',
    )
  })
})
