import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { products } from '../data/products'
import { readMarketplaceState } from '../marketplace/marketplaceStore'
import styles from '../styles.css?raw'
import { CatalogPage } from './CatalogPage'

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

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

describe('catalog responsive styles', () => {
  it('uses only live catalog selectors for its desktop structure', () => {
    expect(styles).not.toContain('.catalog-page__workspace')
    expect(styles).not.toContain('.catalog-page__grid')
    expect(styles).not.toContain('.catalog-page__filters')
    expect(styles).toMatch(
      /\.catalog-page__layout\s*{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*minmax\(220px, 280px\) minmax\(0, 1fr\);/,
    )
    expect(styles).toMatch(
      /\.catalog-results__grid\s*{[^}]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\);/,
    )
  })

  it('keeps the two-column grid and filter disclosure inside the 860px block', () => {
    const tablet = mediaBlockContaining('max-width: 860px', '.catalog-results__grid')

    expect(tablet).toMatch(
      /\.catalog-results__grid\s*{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/,
    )
    expect(tablet).toMatch(/\.catalog-filters\s*{[^}]*display:\s*none;/)
    expect(tablet).toMatch(/\.catalog-filters--open\s*{[^}]*display:\s*grid;/)
  })

  it('keeps the one-column grid and mobile touch targets inside the 600px block', () => {
    const mobile = mediaBlockContaining('max-width: 600px', '.catalog-results__grid')

    expect(mobile).toMatch(
      /\.catalog-results__grid\s*{[^}]*grid-template-columns:\s*1fr;/,
    )
    expect(mobile).toMatch(/\.catalog-filters\s*{[^}]*width:\s*100%;/)
    expect(mobile).toMatch(
      /\.product-preview-page__breadcrumbs a\s*{[^}]*min-height:\s*44px;/,
    )
  })
})

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

  it('shows deterministic accessible loading only when requested', () => {
    vi.useFakeTimers()
    window.history.replaceState(null, '', '/catalog?loading=1')
    render(<CatalogPage />)

    expect(screen.getByRole('status', { name: 'Загружаем каталог' })).toHaveAttribute(
      'aria-busy',
      'true',
    )
    expect(screen.queryByTestId('catalog-product')).not.toBeInTheDocument()
    expect(window.location.search).toBe('?loading=1')

    act(() => vi.advanceTimersByTime(349))
    expect(screen.getByRole('status', { name: 'Загружаем каталог' })).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(1))
    expect(screen.queryByRole('status', { name: 'Загружаем каталог' })).not.toBeInTheDocument()
    expect(screen.getAllByTestId('catalog-product')).toHaveLength(products.length)
    expect(screen.getAllByText(/COINS/).length).toBeGreaterThan(0)
    expect(window.location.search).toBe('')
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
    const product = products[3]
    const button = screen.getByRole('button', {
      name: `Добавить ${product.name} в корзину`,
    })
    expect(button).toHaveTextContent(/^Добавить в корзину$/)

    await user.click(button)
    await user.click(button)

    expect(screen.getByRole('status')).toHaveTextContent('добавлено в корзину')
    expect(readMarketplaceState().cartProductIds).toEqual([product.id])
    expect(button).toHaveTextContent('В корзине')
  })

  it('recovers from malformed cart storage', async () => {
    window.localStorage.setItem('nyxo:cart', '{broken')
    const user = userEvent.setup()
    render(<CatalogPage />)

    await user.click(
      screen.getByRole('button', { name: `Добавить ${products[3].name} в корзину` }),
    )

    expect(readMarketplaceState().cartProductIds).toEqual([products[3].id])
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

  it('synchronizes controls and results across query-only popstate navigation', () => {
    window.history.replaceState(null, '', '/catalog?query=Steam&sort=price-asc')
    render(<CatalogPage />)

    const search = screen.getByRole('searchbox', { name: 'Поиск по каталогу' })
    const sorting = screen.getByRole('combobox', { name: 'Сортировка' })
    expect(search).toHaveValue('Steam')
    expect(sorting).toHaveValue('price-asc')
    expect(
      screen.getAllByTestId('catalog-product').every((card) => card.textContent?.includes('Steam')),
    ).toBe(true)

    act(() => {
      window.history.pushState(null, '', '/catalog?query=GPT&sort=price-desc')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    expect(search).toHaveValue('GPT')
    expect(sorting).toHaveValue('price-desc')
    expect(
      screen.getAllByTestId('catalog-product').every((card) => card.textContent?.includes('GPT')),
    ).toBe(true)
    expect(window.location.search).toBe('?query=GPT&sort=price-desc')

    act(() => {
      window.history.replaceState(null, '', '/catalog?query=Steam&sort=price-asc')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    expect(search).toHaveValue('Steam')
    expect(sorting).toHaveValue('price-asc')
    expect(
      screen.getAllByTestId('catalog-product').every((card) => card.textContent?.includes('Steam')),
    ).toBe(true)
    expect(window.location.search).toBe('?query=Steam&sort=price-asc')
  })

  it('restores and toggles game or service kinds independently', async () => {
    window.history.replaceState(null, '', '/catalog?kinds=skin,steam-topup')
    const user = userEvent.setup()
    render(<CatalogPage />)

    const counterStrike = screen.getByRole('checkbox', { name: 'Counter-Strike 2' })
    const steam = screen.getByRole('checkbox', { name: 'Steam' })
    expect(counterStrike).toBeChecked()
    expect(steam).toBeChecked()

    await user.click(steam)

    expect(counterStrike).toBeChecked()
    expect(steam).not.toBeChecked()
    expect(new URLSearchParams(window.location.search).get('kinds')).toBe('skin')
  })

  it('applies a secondary availability filter and removes its chip', async () => {
    const user = userEvent.setup()
    render(<CatalogPage />)

    await user.click(screen.getByRole('checkbox', { name: 'Осталось мало' }))
    expect(new URLSearchParams(window.location.search).get('availability')).toBe('limited')
    expect(screen.getAllByTestId('catalog-product')).toHaveLength(
      products.filter((product) => product.availability === 'limited').length,
    )

    await user.click(screen.getByRole('button', { name: /Осталось мало.*убрать фильтр/ }))
    expect(new URLSearchParams(window.location.search).has('availability')).toBe(false)
    expect(screen.getAllByTestId('catalog-product')).toHaveLength(products.length)
  })

  it('shows failure feedback when cart storage cannot be written', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })
    const user = userEvent.setup()
    render(<CatalogPage />)

    await user.click(
      screen.getByRole('button', { name: `Добавить ${products[3].name} в корзину` }),
    )

    expect(screen.getByRole('status')).toHaveTextContent('Не удалось сохранить')
    expect(
      screen.getByRole('button', { name: `${products[3].name} уже в корзине` }),
    ).toHaveTextContent('В корзине')
  })
})
