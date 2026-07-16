import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import App from '../App'
import {
  createDefaultMarketplaceState,
  readMarketplaceState,
  replaceMarketplaceState,
} from '../marketplace/marketplaceStore'
import { SUPPORT_CATEGORIES } from '../marketplace/support'
import { SupportPage } from './SupportPage'

describe('SupportPage', () => {
  beforeEach(() => {
    localStorage.clear()
    replaceMarketplaceState(createDefaultMarketplaceState())
    window.history.replaceState({}, '', '/support')
  })

  it('renders on the /support application route with all request categories', () => {
    render(<App />)

    expect(screen.getByRole('heading', { level: 1, name: 'Поддержка' })).toBeInTheDocument()
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(
      SUPPORT_CATEGORIES,
    )
  })

  it('shows accessible validation feedback for required fields', () => {
    render(<SupportPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Создать обращение' }))

    expect(screen.getByText('Укажите корректный email.')).toHaveAttribute('role', 'alert')
    expect(screen.getByText('Укажите тему обращения.')).toHaveAttribute('role', 'alert')
    expect(screen.getByText('Опишите проблему.')).toHaveAttribute('role', 'alert')
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
  })

  it('conditionally requests an order number for refund requests', async () => {
    const user = userEvent.setup()
    render(<SupportPage />)

    expect(screen.queryByLabelText('Номер заказа')).not.toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Категория'), 'Возврат')

    expect(screen.getByLabelText('Номер заказа')).toBeRequired()
  })

  it('stores a ticket and gives a production-ready confirmation', async () => {
    const user = userEvent.setup()
    render(<SupportPage />)

    await user.selectOptions(screen.getByLabelText('Категория'), 'Возврат')
    await user.type(screen.getByLabelText('Номер заказа'), 'NYXO-240601')
    await user.type(screen.getByLabelText('Email'), 'buyer@example.com')
    await user.type(screen.getByLabelText('Тема'), 'Возврат по заказу')
    await user.type(screen.getByLabelText('Сообщение'), 'Хочу уточнить статус возврата.')
    await user.click(screen.getByRole('button', { name: 'Создать обращение' }))

    expect(screen.getByRole('status')).toHaveTextContent('Обращение принято')
    expect(screen.getByRole('status')).toHaveTextContent('Сохраните номер обращения для проверки статуса')
    expect(document.body).not.toHaveTextContent(/чернов|локальн|не отправ|не подключ/i)
    expect(screen.getByText(/NYXO-SUP-/)).toBeInTheDocument()
    expect(readMarketplaceState().supportTickets).toHaveLength(1)
    expect(readMarketplaceState().supportTickets[0]).toMatchObject({
      category: 'Возврат',
      orderNumber: 'NYXO-240601',
      status: 'local-draft',
    })
  })
})
