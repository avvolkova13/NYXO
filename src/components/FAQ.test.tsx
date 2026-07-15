import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { FAQ } from './FAQ'

describe('FAQ', () => {
  it('renders the four practical questions and answers', () => {
    render(<FAQ />)

    expect(screen.getAllByText(/Как быстро приходит предмет|Как происходит передача скина|Можно ли рассмотреть предмет до покупки|Что делать, если возникла проблема с заказом/)).toHaveLength(4)
    expect(
      screen.getByText(
        'После оформления заказ проходит обработку, затем скин передаётся на указанный аккаунт.',
      ),
    ).toBeInTheDocument()
  })

  it('uses native disclosure behavior for keyboard and touch access', async () => {
    const user = userEvent.setup()
    render(<FAQ />)
    const question = screen.getByText('Как быстро приходит предмет?')
    const disclosure = question.closest('details')

    expect(disclosure).not.toHaveAttribute('open')
    await user.click(question)
    expect(disclosure).toHaveAttribute('open')
  })
})
