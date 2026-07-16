import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { products } from '../data/products'
import {
  createDefaultMarketplaceState,
  replaceMarketplaceState,
} from '../marketplace/marketplaceStore'
import styles from '../styles.css?raw'
import { Header } from './Header'

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

describe('Header cart controls', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.replaceState({}, '', '/')
  })

  it('counts only unique known shared products in both cart controls', () => {
    replaceMarketplaceState({
      ...createDefaultMarketplaceState(),
      cartProductIds: [products[0].id, 'retired-product', products[0].id, products[1].id],
    })
    render(<Header />)

    const header = screen.getByRole('banner')
    expect(within(header).getAllByText('2')).toHaveLength(2)
    expect(header.querySelector('.site-header__cart-link--desktop')).toHaveTextContent('Корзина 2')
    expect(header.querySelector('.site-header__cart-link--mobile')).toHaveAccessibleName(
      'Корзина, 2 товара',
    )
  })

  it('marks both responsive variants current only on the cart route', () => {
    window.history.replaceState({}, '', '/cart')
    const { unmount } = render(<Header />)

    const cartLinks = screen.getAllByRole('link', { name: /Корзина/ })
    expect(cartLinks).toHaveLength(2)
    expect(cartLinks.every((link) => link.getAttribute('aria-current') === 'page')).toBe(true)

    unmount()
    window.history.replaceState({}, '', '/')
    render(<Header />)
    expect(
      screen.getAllByRole('link', { name: /Корзина/ }).every(
        (link) => !link.hasAttribute('aria-current'),
      ),
    ).toBe(true)
  })

  it('keeps exactly one responsive cart control visible at each breakpoint with a mobile touch target', () => {
    expect(styles).toMatch(
      /\.site-header__cart-link--mobile\s*{[^}]*display:\s*none;/,
    )
    expect(styles).toMatch(
      /\.site-header__cart-link--desktop\s*{[^}]*display:\s*inline-flex;/,
    )

    const mobileBlock = mediaBlockContaining(
      'max-width: 860px',
      '.site-header__cart-link--mobile',
    )
    expect(mobileBlock).toMatch(
      /\.site-header__cart-link--mobile\s*{[^}]*display:\s*inline-flex;[^}]*min-height:\s*44px;/,
    )
    expect(mobileBlock).toMatch(
      /\.site-header__cart-link--desktop\s*{[^}]*display:\s*none;/,
    )
  })
})
