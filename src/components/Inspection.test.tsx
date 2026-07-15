import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { featuredProduct } from '../data/products'
import { Inspection } from './Inspection'

describe('Inspection console', () => {
  it('switches the active product screen between full and detail views', async () => {
    const user = userEvent.setup()
    render(<Inspection />)

    const fullControl = screen.getByRole('button', { name: 'Полный вид' })
    const detailControl = screen.getByRole('button', {
      name: 'Детали покрытия',
    })

    expect(fullControl).toHaveAttribute('aria-pressed', 'true')
    expect(detailControl).toHaveAttribute('aria-pressed', 'false')
    expect(
      screen.getByRole('img', {
        name: `Изображение предмета: ${featuredProduct.name}`,
      }),
    ).toBeInTheDocument()

    await user.click(detailControl)

    expect(fullControl).toHaveAttribute('aria-pressed', 'false')
    expect(detailControl).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByRole('img', {
        name: `Детали предмета: ${featuredProduct.name}`,
      }),
    ).toBeInTheDocument()
  })
})

