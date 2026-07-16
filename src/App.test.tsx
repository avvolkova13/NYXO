import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from './App'
import { products } from './data/products'
import {
  createDefaultMarketplaceState,
  replaceMarketplaceState,
} from './marketplace/marketplaceStore'
import { handleInternalLinkClick } from './router/useAppRoute'

afterEach(() => {
  window.history.replaceState({}, '', '/')
  vi.restoreAllMocks()
})

describe('NYXO landing page', () => {
  it('presents the marketplace proposition and required sections in Russian', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Редкие скины. Без лишнего шума.',
      }),
    ).toBeInTheDocument()

    for (const heading of [
      'Популярное сейчас',
      'Как это работает',
      'Рассмотрите каждый предмет',
      'Остались вопросы?',
    ]) {
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument()
    }
  })

  it('routes every primary display heading through the pixel reveal system', () => {
    render(<App />)

    for (const heading of [
      'Редкие скины. Без лишнего шума.',
      'Популярное сейчас',
      'Как это работает',
      'Рассмотрите каждый предмет',
      'Остались вопросы?',
    ]) {
      expect(screen.getByRole('heading', { name: heading })).toHaveClass('pixel-heading')
    }
  })

  it('keeps catalog exploration connected to a real landing destination', () => {
    render(<App />)

    for (const link of screen.getAllByRole('link', {
      name: 'Перейти в каталог',
    })) {
      expect(link).toHaveAttribute('href', '/catalog')
    }

    expect(
      screen.getByRole('link', { name: 'Популярные скины' }),
    ).toHaveAttribute('href', '#popular')
  })

  it('renders catalog and canonical product routes on direct load', () => {
    window.history.replaceState({}, '', '/catalog')
    const { unmount } = render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: 'Каталог' })).toBeInTheDocument()

    unmount()
    window.history.replaceState({}, '', '/catalog/ak47-wild-lotus')
    render(<App />)
    expect(
      screen.getByRole('heading', { level: 1, name: products[0].name }),
    ).toBeInTheDocument()
  })

  it('renders the cart route and synchronizes the active Header count', () => {
    const cartIds = [products[0].id, products[1].id]
    replaceMarketplaceState({
      ...createDefaultMarketplaceState(),
      balanceCoins: 50_000,
      cartProductIds: cartIds,
    })
    window.history.replaceState({}, '', '/cart')

    render(<App />)

    expect(screen.getByRole('heading', { level: 1, name: 'Корзина' })).toBeInTheDocument()
    const cartLink = document.querySelector('.site-header__cart-link--desktop')
    expect(cartLink).toHaveAttribute('href', '/cart')
    expect(cartLink).toHaveAttribute('aria-current', 'page')
    expect(cartLink).toHaveAccessibleName(`Корзина, ${cartIds.length} товара`)
  })

  it.each([
    ['/catalog', 'catalog'],
    [`/catalog/${products[0].slug}`, 'product'],
  ])('keeps shared navigation route-safe on the %s route', (pathname) => {
    window.history.replaceState({}, '', pathname)
    render(<App />)

    const header = document.querySelector('.site-header') as HTMLElement
    const footer = screen.getByRole('contentinfo')

    expect(within(header).getByRole('link', { name: 'NYXO, на главную' })).toHaveAttribute(
      'href',
      '/',
    )
    expect(within(header).getByRole('link', { name: 'Каталог' })).toHaveAttribute(
      'aria-current',
      'page',
    )

    for (const [label, href] of [
      ['Популярное', '/#popular'],
      ['Как это работает', '/#how'],
      ['FAQ', '/#faq'],
    ]) {
      expect(within(header).getByRole('link', { name: label })).toHaveAttribute('href', href)
      expect(within(footer).getByRole('link', { name: label })).toHaveAttribute('href', href)
    }

    expect(within(header).getByRole('link', { name: 'Инвентарь' })).toHaveAttribute(
      'href',
      '/#account-inventory',
    )
    expect(within(footer).getByRole('link', { name: 'Личный кабинет' })).toHaveAttribute(
      'href',
      '/#account-inventory',
    )
  })

  it('does not mark Catalog as current on Home', () => {
    render(<App />)

    expect(
      within(document.querySelector('.site-header')!).getByRole('link', { name: 'Каталог' }),
    ).not.toHaveAttribute('aria-current')
  })

  it('uses same-document navigation for ordinary internal catalog clicks', () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
    render(<App />)
    fireEvent.click(
      within(document.querySelector('.site-header')!).getByRole('link', { name: 'Каталог' }),
    )

    expect(window.location.pathname).toBe('/catalog')
    expect(screen.getByRole('heading', { level: 1, name: 'Каталог' })).toBeInTheDocument()
  })

  it('does not prevent native link behaviors', () => {
    const pushState = vi.spyOn(window.history, 'pushState')
    const catalogLink = Object.assign(document.createElement('a'), { href: '/catalog' })

    const cases: Array<{
      name: string
      link: HTMLAnchorElement
      event?: MouseEventInit
    }> = [
      { name: 'Control click', link: catalogLink, event: { ctrlKey: true } },
      { name: 'Command click', link: catalogLink, event: { metaKey: true } },
      { name: 'Shift click', link: catalogLink, event: { shiftKey: true } },
      { name: 'Alt click', link: catalogLink, event: { altKey: true } },
      { name: 'non-left click', link: catalogLink, event: { button: 1 } },
      {
        name: 'targeted link',
        link: Object.assign(document.createElement('a'), { href: '/catalog', target: '_blank' }),
      },
      {
        name: 'download link',
        link: Object.assign(document.createElement('a'), {
          href: '/catalog',
          download: 'catalog.html',
        }),
      },
      { name: 'hash link', link: Object.assign(document.createElement('a'), { href: '#popular' }) },
      {
        name: 'empty fragment link',
        link: Object.assign(document.createElement('a'), { href: '/catalog#' }),
      },
      {
        name: 'mail link',
        link: Object.assign(document.createElement('a'), { href: 'mailto:support@nyxo.market' }),
      },
      {
        name: 'external link',
        link: Object.assign(document.createElement('a'), { href: 'https://example.com/catalog' }),
      },
    ]

    for (const testCase of cases) {
      const event = new MouseEvent('click', {
        bubbles: true,
        button: 0,
        cancelable: true,
        ...testCase.event,
      })
      Object.defineProperty(event, 'target', { value: testCase.link })

      handleInternalLinkClick(event)

      expect(event.defaultPrevented, testCase.name).toBe(false)
    }

    expect(pushState).not.toHaveBeenCalled()
  })

  it('renders the four supplied acquisition steps as one ordered flow', () => {
    render(<App />)
    const flow = screen.getByLabelText('Этапы покупки')

    for (const step of [
      'Выберите скин',
      'Подтвердите покупку',
      'Получите предмет',
      'Пополните коллекцию',
    ]) {
      expect(within(flow).getByText(step)).toBeInTheDocument()
    }
  })

  it('includes every required footer destination', () => {
    render(<App />)
    const footer = screen.getByRole('contentinfo')

    for (const label of [
      'Каталог',
      'Популярное',
      'Как это работает',
      'FAQ',
      'Поддержка',
      'Пользовательское соглашение',
      'Политика конфиденциальности',
      'Условия возврата',
      'Честная игра',
    ]) {
      expect(within(footer).getByRole('link', { name: label })).toBeInTheDocument()
    }
  })
})
