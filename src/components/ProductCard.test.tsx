import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { products } from '../data/products'
import { formatPrice, ProductCard } from './ProductCard'

describe('ProductCard', () => {
  it('keeps identity, value and optional attributes readable', () => {
    render(<ProductCard product={products[0]} size="featured" active />)

    expect(
      screen.getByRole('heading', { name: products[0].name }),
    ).toBeInTheDocument()
    expect(screen.getByText(formatPrice(products[0].price, products[0].currency))).toBeInTheDocument()
    expect(screen.getByText('Float')).toBeInTheDocument()
    expect(screen.getByText('0,054949')).toBeInTheDocument()
  })

  it('labels source-backed product media', () => {
    render(<ProductCard product={products[3]} />)

    expect(
      screen.getByRole('img', {
        name: `Изображение предмета: ${products[3].name}`,
      }),
    ).toBeInTheDocument()
  })
})
