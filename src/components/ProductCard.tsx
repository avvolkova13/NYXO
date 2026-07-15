import type { ElementType } from 'react'

import type { Product } from '../types/product'
import { ProductMedia } from './ProductMedia'

interface ProductCardProps {
  product: Product
  size?: 'featured' | 'standard' | 'compact'
  active?: boolean
  headingLevel?: 2 | 3
  onSelect?: () => void
}

export const formatPrice = (price: number, _currency: 'COINS') =>
  `${new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(price)).replaceAll('\u00a0', ' ')} COINS`

export function ProductCard({
  product,
  size = 'standard',
  active = false,
  headingLevel = 3,
  onSelect,
}: ProductCardProps) {
  const Heading = `h${headingLevel}` as ElementType

  return (
    <div
      className={`product-card-shell ${active ? 'product-card-shell--active' : ''}`}
    >
      {active && (
        <div className="product-card-signal" aria-hidden="true">
          Выбрано
        </div>
      )}
      <article className={`product-card product-card--${size}`}>
        <div className="product-card__module-top" aria-hidden="true">
          <span className="status-lamp" />
          <span>{product.category}</span>
        </div>
        <ProductMedia product={product} />
        <div className="product-card__body">
          <div className="product-card__context">
            <span>{product.game}</span>
            <span>{product.category}</span>
          </div>
          <Heading>{product.name}</Heading>
          <div className="product-card__data">
            <span>{product.condition}</span>
            {product.attribute && (
              <span className="product-card__attribute">
                <span>{product.attributeLabel}</span>
                <strong>{product.attribute}</strong>
              </span>
            )}
          </div>
          <strong className="product-card__price">
            {formatPrice(product.price, product.currency)}
          </strong>
          {onSelect && (
            <button
              className="product-card__select nyxo-action"
              type="button"
              aria-label={`Выбрать ${product.name}`}
              aria-pressed={active}
              onClick={onSelect}
            >
              <span aria-hidden="true" className="status-lamp" />
              {active ? 'Выбрано' : 'Выбрать'}
            </button>
          )}
        </div>
      </article>
    </div>
  )
}
