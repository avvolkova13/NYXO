import type { Product } from '../types/product'

interface ProductMediaProps {
  product: Product
  view?: 'full' | 'detail'
}

export function ProductMedia({ product, view = 'full' }: ProductMediaProps) {
  const label =
    view === 'detail'
      ? `Детали предмета: ${product.name}`
      : `Изображение предмета: ${product.name}`

  return (
    <div
      className={`product-media product-media--${view} product-media--${product.tone}`}
      role="img"
      aria-label={label}
    >
      <div className="product-media__viewport" aria-hidden="true">
        <span className="product-media__category">{product.category}</span>
        <img
          className="product-media__image"
          src={product.imageUrl}
          alt=""
          decoding="async"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="product-media__hardware" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  )
}
