import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { products } from '../data/products'
import { formatPrice } from './ProductCard'
import { PopularNow } from './PopularNow'

describe('Popular inventory console', () => {
  it('loads a selected inventory module into the main display', async () => {
    const user = userEvent.setup()
    render(<PopularNow />)

    const target = products[3]
    const selector = screen.getByRole('button', {
      name: `Выбрать ${target.name}`,
    })

    await user.click(selector)

    expect(selector).toHaveAttribute('aria-pressed', 'true')
    const selectedDisplay = screen.getByLabelText('Активный предмет каталога')
    expect(
      within(selectedDisplay).getByRole('heading', { name: target.name }),
    ).toBeInTheDocument()
    expect(
      within(selectedDisplay).getByText(formatPrice(target.price, target.currency)),
    ).toBeInTheDocument()
  })
})
