import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from './App'

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
      expect(link).toHaveAttribute('href', '#popular')
    }

    expect(
      screen.getByRole('link', { name: 'Популярные скины' }),
    ).toHaveAttribute('href', '#popular')
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
