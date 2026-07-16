import type { Product } from '../types/product'
import { ProductMedia } from '../components/ProductMedia'
import { formatPrice } from '../components/ProductCard'
import { useMarketplaceState } from '../marketplace/useMarketplaceState'
import { addCartProductId } from './cartStorage'

interface CatalogProductCardProps {
  product: Product
  onAdded: (message: string) => void
}

const availabilityLabels: Record<Product['availability'], string> = {
  available: 'В наличии',
  instant: 'Моментально',
  limited: 'Осталось мало',
}

export function CatalogProductCard({ product, onAdded }: CatalogProductCardProps) {
  const marketplaceState = useMarketplaceState()
  const isInCart = marketplaceState.cartProductIds.includes(product.id)

  return (
    <article className="catalog-product-card product-card-shell" data-testid="catalog-product">
      <div className="product-card product-card--standard">
        <div className="product-card__module-top">
          <span className="status-lamp" aria-hidden="true" />
          <span>{product.category}</span>
        </div>
        <ProductMedia product={product} />
        <div className="product-card__body">
          <p className="product-card__context">
            <span>{product.game ?? product.category}</span>
            <span>{availabilityLabels[product.availability]}</span>
          </p>
          <h2>{product.name}</h2>
          <p>{product.description}</p>
          <p className="catalog-product-card__delivery">{product.delivery}</p>
          <strong className="product-card__price">
            {formatPrice(product.price, product.currency)}
          </strong>
          <div className="catalog-product-card__actions">
            <a className="nyxo-action" href={`/catalog/${product.slug}`}>
              Подробнее
            </a>
            <button
              className="nyxo-action"
              type="button"
              disabled={isInCart}
              aria-label={
                isInCart
                  ? `${product.name} уже в корзине`
                  : `Добавить ${product.name} в корзину`
              }
              onClick={() => {
                const result = addCartProductId(product.id)
                onAdded(
                  result.ok
                    ? `${product.name} — добавлено в корзину`
                    : 'Не удалось сохранить корзину. Товар останется в ней до перезагрузки.',
                )
              }}
            >
              {isInCart ? 'В корзине' : 'Добавить в корзину'}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
