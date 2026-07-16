import { useState } from 'react'

import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { ProductMedia } from '../components/ProductMedia'
import { formatPrice } from '../components/ProductCard'
import { products } from '../data/products'
import type { Product } from '../types/product'
import { addCartProductId } from './cartStorage'

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
  const product = products.find((item) => item.slug === slug)

  if (!product) {
    return (
      <div className="product-preview-page product-preview-page--missing">
        <Header />
        <main className="product-preview-page__missing">
          <p className="eyebrow">NYXO / 404</p>
          <h1>Товар не найден</h1>
          <p>Возможно, он был продан или ссылка устарела.</p>
          <a className="nyxo-action" href="/catalog">Вернуться в каталог</a>
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

  return (
    <div className="product-preview-page">
      <Header />
      <main className="product-preview-page__main">
        <nav aria-label="Хлебные крошки" className="product-preview-page__breadcrumbs">
          <a href="/catalog">Каталог</a>
          <span aria-hidden="true">/</span>
          <span>{product.name}</span>
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
            <button
              className="nyxo-action"
              type="button"
              aria-label={`Добавить ${product.name} в корзину`}
              onClick={() => {
                const result = addCartProductId(product.id)
                setNotice(
                  result.ok
                    ? `${product.name} — добавлено в корзину`
                    : `Не удалось добавить в корзину: ${product.name}`,
                )
              }}
            >
              Добавить в корзину
            </button>
            {notice && <p role="status">{notice}</p>}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
