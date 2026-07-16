import { fireEvent, render, screen } from '@testing-library/react'
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

  it('removes a failed image and shows the branded category fallback', () => {
    const product = products[0]
    const { container } = render(<ProductMedia product={product} />)

    fireEvent.error(container.querySelector('.product-media__image')!)

    expect(container.querySelector('.product-media__image')).not.toBeInTheDocument()
    expect(container.querySelector('.product-media__fallback')).toHaveTextContent(product.category)
    expect(container.querySelector('.product-media__fallback')).toHaveTextContent('SKIN ARCHIVE')
  })

  it('tries the new image when the product changes after an error', () => {
    const { container, rerender } = render(<ProductMedia product={products[0]} />)
    fireEvent.error(container.querySelector('.product-media__image')!)

    rerender(<ProductMedia product={products[1]} />)

    expect(container.querySelector('.product-media__fallback')).not.toBeInTheDocument()
    expect(container.querySelector('.product-media__image')).toHaveAttribute(
      'src',
      products[1].imageUrl,
    )
  })
})
