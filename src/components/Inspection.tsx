import { useState } from 'react'

import { featuredProduct } from '../data/products'
import { ProductMedia } from './ProductMedia'
import { PixelHeading } from './PixelHeading'

export function Inspection() {
  const [view, setView] = useState<'full' | 'detail'>('full')

  return (
    <section
      className="inspection"
      id="inspection"
      aria-labelledby="inspection-title"
    >
      <div className="inspection-console station-panel">
        <div className="inspection-copy">
          <PixelHeading as="h2" id="inspection-title">Рассмотрите каждый предмет</PixelHeading>
          <p>
            Перед покупкой можно внимательно изучить внешний вид, качество и
            особенности скина.
          </p>
          <div className="inspection-controls" aria-label="Режим осмотра">
            <button
              className="nyxo-action"
              type="button"
              aria-pressed={view === 'full'}
              onClick={() => setView('full')}
            >
              <span className="status-lamp" aria-hidden="true" />
              Полный вид
            </button>
            <button
              className="nyxo-action"
              type="button"
              aria-pressed={view === 'detail'}
              onClick={() => setView('detail')}
            >
              <span className="status-lamp" aria-hidden="true" />
              Детали покрытия
            </button>
          </div>
        </div>
        <div className="inspection-preview screen-bezel">
          <div className="screen-bezel__topline">
            <span>{view === 'full' ? 'Полный вид' : 'Детали покрытия'}</span>
            <span>{featuredProduct.name}</span>
          </div>
          <ProductMedia product={featuredProduct} view={view} />
        </div>
        <dl className="inspection-readouts">
          <div>
            <dt>Редкость</dt>
            <dd>Тайное</dd>
          </div>
          <div>
            <dt>Состояние</dt>
            <dd>{featuredProduct.condition}</dd>
          </div>
          <div>
            <dt>{featuredProduct.attributeLabel}</dt>
            <dd>{featuredProduct.attribute}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
