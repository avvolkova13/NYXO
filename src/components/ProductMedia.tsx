import { useEffect, useState } from 'react'

import type { Product } from '../types/product'

interface ProductMediaProps {
  product: Product
  view?: 'full' | 'detail'
}

export function ProductMedia({ product, view = 'full' }: ProductMediaProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const label =
    view === 'detail'
      ? `Детали предмета: ${product.name}`
      : `Изображение предмета: ${product.name}`
  const fallbackLabel = product.kind === 'skin'
    ? 'SKIN ARCHIVE'
    : product.kind === 'steam-topup'
      ? 'STEAM BALANCE'
      : 'GPT BALANCE'

  useEffect(() => {
    setImageFailed(false)
  }, [product.id, product.imageUrl])

  return (
    <div
      className={`product-media product-media--${view} product-media--${product.tone}`}
      role="img"
      aria-label={label}
    >
      <div className="product-media__viewport" aria-hidden="true">
        <span className="product-media__category">{product.category}</span>
        {imageFailed ? (
          <div className="product-media__fallback">
            <strong>{fallbackLabel}</strong>
            <span>{product.category}</span>
          </div>
        ) : (
          <img
            className="product-media__image"
            src={product.imageUrl}
            alt=""
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
          />
        )}
      </div>
      <div className="product-media__hardware" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  )
}
