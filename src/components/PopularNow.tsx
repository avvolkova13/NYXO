import { useState } from 'react'

import { products } from '../data/products'
import { formatPrice, ProductCard } from './ProductCard'
import { ProductMedia } from './ProductMedia'
import { PixelHeading } from './PixelHeading'
import { SignalLink } from './SignalLink'

export function PopularNow() {
  const inventory = products.slice(0, 5)
  const [selectedId, setSelectedId] = useState(inventory[0].id)
  const selectedProduct =
    inventory.find((product) => product.id === selectedId) ?? inventory[0]

  return (
    <section className="popular" id="popular" aria-labelledby="popular-title">
      <PixelHeading as="h2" id="popular-title">Популярное сейчас</PixelHeading>
      <div className="inventory-console station-panel">
        <div
          className="inventory-console__active screen-bezel"
          aria-label="Активный предмет каталога"
          aria-live="polite"
        >
          <div className="screen-bezel__topline">
            <span>{selectedProduct.game}</span>
            <span>{selectedProduct.category}</span>
          </div>
          <ProductMedia product={selectedProduct} />
          <div className="inventory-console__summary">
            <div>
              <h3>{selectedProduct.name}</h3>
              <span>{selectedProduct.condition}</span>
            </div>
            <div>
              {selectedProduct.attribute && (
                <span>
                  {selectedProduct.attributeLabel} {selectedProduct.attribute}
                </span>
              )}
              <strong>{formatPrice(selectedProduct.price, selectedProduct.currency)}</strong>
            </div>
          </div>
        </div>

        <div className="inventory-console__slots" aria-label="Выбор предмета">
          {inventory.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              size="compact"
              active={product.id === selectedProduct.id}
              onSelect={() => setSelectedId(product.id)}
            />
          ))}
        </div>

        <SignalLink
          href="/catalog"
          signalLabel="Все предметы"
          variant="compact"
          className="popular-cta"
        >
          Перейти в каталог
        </SignalLink>
      </div>
    </section>
  )
}
