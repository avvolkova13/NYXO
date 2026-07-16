import { useEffect, useState } from 'react'

import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { ProductMedia } from '../components/ProductMedia'
import { formatPrice } from '../components/ProductCard'
import { products } from '../data/products'
import { useMarketplaceState } from '../marketplace/useMarketplaceState'
import type { Product } from '../types/product'
import { addCartProductId, migrateLegacyCartIds } from './cartStorage'

interface ProductPreviewPageProps {
  slug: string
}

const availabilityLabels: Record<Product['availability'], string> = {
  available: 'В наличии',
  instant: 'Моментальная доставка',
  limited: 'Осталось мало',
}

export function ProductPreviewPage({ slug }: ProductPreviewPageProps) {
  const [notice, setNotice] = useState('')
  const marketplaceState = useMarketplaceState()
  const product = products.find((item) => item.slug === slug)

  useEffect(() => {
    migrateLegacyCartIds()
  }, [])

  if (!product) {
    return (
      <div className="product-preview-page product-preview-page--missing">
        <Header />
        <main className="product-preview-page__missing">
          <p className="eyebrow">NYXO / 404</p>
          <h1>Товар не найден</h1>
          <p>Возможно, он был продан или ссылка устарела.</p>
          <div className="product-preview-page__missing-actions">
            <a className="nyxo-action" href="/catalog">Вернуться в каталог</a>
            <a className="nyxo-action product-preview-page__secondary-action" href="/">
              На главную
            </a>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const attributes = [
    product.game && ['Игра', product.game],
    ['Категория', product.category],
    product.weaponType && ['Тип', product.weaponType],
    product.condition && ['Состояние', product.condition],
    product.rarity && ['Редкость', product.rarity],
    product.attribute && [product.attributeLabel ?? 'Характеристика', product.attribute],
    ['Статус', availabilityLabels[product.availability]],
    ['Доставка', product.delivery],
  ].filter(Boolean) as [string, string][]
  const isInCart = marketplaceState.cartProductIds.includes(product.id)

  return (
    <div className="product-preview-page">
      <Header />
      <main className="product-preview-page__main">
        <nav aria-label="Хлебные крошки" className="product-preview-page__breadcrumbs">
          <a href="/catalog">Каталог</a>
          <span aria-hidden="true">/</span>
          <span>{product.name}</span>
          <a className="product-preview-page__cart-link" href="/cart">Корзина</a>
        </nav>
        <article className="product-preview-page__product">
          <div className="product-preview-page__media">
            <ProductMedia product={product} view="detail" />
          </div>
          <div className="product-preview-page__content">
            <p className="eyebrow">{product.category}</p>
            <h1>{product.name}</h1>
            <p>{product.description}</p>
            <dl className="product-preview-page__attributes">
              {attributes.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <strong className="product-preview-page__price">
              {formatPrice(product.price, product.currency)}
            </strong>
            <div className="product-preview-page__actions">
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
                  setNotice(
                    result.ok
                      ? `${product.name} — добавлено в корзину`
                      : 'Не удалось сохранить корзину. Товар останется в ней до перезагрузки.',
                  )
                }}
              >
                {isInCart ? 'В корзине' : 'Добавить в корзину'}
              </button>
              {isInCart && (
                <a className="nyxo-action product-preview-page__secondary-action" href="/cart">
                  Перейти в корзину
                </a>
              )}
            </div>
            {notice && <p role="status">{notice}</p>}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
