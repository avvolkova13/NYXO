import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from './App'
import { products } from './data/products'

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

  it('uses same-document navigation for ordinary internal catalog clicks', () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
    render(<App />)
    fireEvent.click(
      within(document.querySelector('.site-header')!).getByRole('link', { name: 'Каталог' }),
    )

    expect(window.location.pathname).toBe('/catalog')
    expect(screen.getByRole('heading', { level: 1, name: 'Каталог' })).toBeInTheDocument()
  })

  it('leaves modified, targeted, download, hash, mail, and external links native', () => {
    render(<App />)
    const pushState = vi.spyOn(window.history, 'pushState')
    const preventJsdomNavigation = (event: MouseEvent) => event.preventDefault()
    document.addEventListener('click', preventJsdomNavigation)
    const catalogLink = within(document.querySelector('.site-header')!).getByRole('link', {
      name: 'Каталог',
    })

    fireEvent.click(catalogLink, { ctrlKey: true })
    const targeted = document.createElement('a')
    targeted.href = '/catalog'
    targeted.target = '_blank'
    document.body.append(targeted)
    fireEvent.click(targeted)
    const download = document.createElement('a')
    download.href = '/catalog'
    download.download = 'catalog.html'
    document.body.append(download)
    fireEvent.click(download)
    fireEvent.click(
      within(document.querySelector('.site-header')!).getByRole('link', { name: 'Популярное' }),
    )
    fireEvent.click(screen.getByRole('link', { name: 'Поддержка' }))
    const external = document.createElement('a')
    external.href = 'https://example.com/catalog'
    document.body.append(external)
    fireEvent.click(external)

    expect(pushState).not.toHaveBeenCalled()
    document.removeEventListener('click', preventJsdomNavigation)
    targeted.remove()
    download.remove()
    external.remove()
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
