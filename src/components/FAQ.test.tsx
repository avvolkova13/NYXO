import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { FAQ } from './FAQ'

describe('FAQ', () => {
  it('renders the practical questions and answers', () => {
    render(<FAQ />)

    expect(screen.getAllByText(/Безопасно ли оплачивать заказ|Что делать, если деньги списались|Как работает конвертация|Сколько времени занимает отправка/)).toHaveLength(4)
    expect(
      screen.getByText(
        'После покупки предмет передаётся через Steam-трейд. Статус операции и возможная задержка отображаются в личном кабинете.',
      ),
    ).toBeInTheDocument()
  })

  it('uses native disclosure behavior for keyboard and touch access', async () => {
    const user = userEvent.setup()
    render(<FAQ />)
    const question = screen.getByText('Сколько времени занимает отправка трейда?')
    const disclosure = question.closest('details')

    expect(disclosure).not.toHaveAttribute('open')
    await user.click(question)
    expect(disclosure).toHaveAttribute('open')
  })
})
