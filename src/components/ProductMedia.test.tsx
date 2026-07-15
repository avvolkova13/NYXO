import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { products } from '../data/products'
import { ProductMedia } from './ProductMedia'

describe('ProductMedia', () => {
  it('renders the supplied donor image instead of a synthetic specimen', () => {
    const product = products[0]
    const { container } = render(<ProductMedia product={product} />)

    expect(
      screen.getByRole('img', { name: `Изображение предмета: ${product.name}` }),
    ).toBeInTheDocument()
    expect(container.querySelector('.product-media__image')).toHaveAttribute(
      'src',
      product.imageUrl,
    )
    expect(container.querySelector('.product-media__specimen')).not.toBeInTheDocument()
    expect(container.querySelector('.product-media__name')).not.toBeInTheDocument()
  })
})
