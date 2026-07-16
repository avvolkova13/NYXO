import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import App from '../App'

const legalRoutes = [
  ['/legal/privacy', 'Политика конфиденциальности'],
  ['/legal/terms', 'Пользовательское соглашение (Оферта)'],
  ['/legal/refunds', 'Условия возврата'],
  ['/legal/fair-play', 'Честная игра'],
] as const

afterEach(() => {
  window.history.replaceState({}, '', '/')
})

describe('LegalPage', () => {
  it.each(legalRoutes)('renders production-ready document information at %s', (pathname, title) => {
    window.history.replaceState({}, '', pathname)
    render(<App />)

    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument()
    expect(screen.getByText('Информация о документе')).toBeInTheDocument()
    expect(document.body).not.toHaveTextContent(/готовится|заказчик|до публикации|временно/i)
    expect(
      within(screen.getByLabelText('Контакт по документу')).getByRole('link', {
        name: 'support@nyxo.market',
      }),
    ).toHaveAttribute(
      'href',
      'mailto:support@nyxo.market',
    )
  })

  it.each(legalRoutes)('keeps shared safeguards and navigation at %s', (pathname) => {
    window.history.replaceState({}, '', pathname)
    render(<App />)

    expect(screen.getByText(/Цифровые товары и пополнение доступны совершеннолетним пользователям/)).toBeInTheDocument()
    expect(screen.getByText(/не связан, не аффилирован и не одобрен Valve Corporation или Steam/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'NYXO, на главную' })).toHaveAttribute('href', '/')

    const footer = screen.getByRole('contentinfo')
    for (const [label, href] of legalRoutes.map(([href, label]) => [label.replace(' (Оферта)', ''), href])) {
      expect(within(footer).getByRole('link', { name: label })).toHaveAttribute('href', href)
    }
  })

  it('does not present fabricated legal requisites as document content', () => {
    window.history.replaceState({}, '', '/legal/terms')
    render(<App />)

    expect(document.body).not.toHaveTextContent(/ООО|ОГРН|ИНН\s*\d|юридический адрес\s*:/i)
  })
})
