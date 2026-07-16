import { useMemo, useState } from 'react'

import { products } from '../data/products'
import { PixelHeading } from './PixelHeading'

const categories = [
  { label: 'Все товары', value: 'all' },
  { label: 'Скины', value: 'skins' },
  { label: 'Пополнение Steam', value: 'steam' },
  { label: 'Пополнение GPT', value: 'gpt' },
]

export function MarketplaceTools() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [rubles, setRubles] = useState('1000')
  const coins = Math.round((Number(rubles) || 0) * 1.5)
  const resultCount = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (category === 'steam' || category === 'gpt') return 0
    return products.filter((product) => {
      const matchesQuery = !normalized || `${product.name} ${product.category} ${product.game}`.toLowerCase().includes(normalized)
      return matchesQuery
    }).length
  }, [category, query])

  return (
    <section className="catalog-tools content-section" id="catalog-tools" aria-labelledby="catalog-tools-title">
      <div className="catalog-tools__intro">
        <PixelHeading as="h2" id="catalog-tools-title">Каталог товаров</PixelHeading>
        <p>Скины, пополнение Steam и цифровые сервисы в одном счёте COINS.</p>
      </div>
      <div className="catalog-tools__panel station-panel">
        <div className="catalog-tools__categories" aria-label="Разделы каталога">
          {categories.map((item) => (
            <button
              className="nyxo-action"
              type="button"
              key={item.value}
              aria-pressed={category === item.value}
              onClick={() => setCategory(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="catalog-tools__search">
          <span>Поиск по каталогу</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Пистолет, автомат, нож"
          />
          <small>{resultCount ? `Найдено позиций: ${resultCount}` : 'По вашему запросу ничего не найдено'}</small>
        </label>
        <div className="coin-converter" aria-label="Конвертер COINS">
          <div>
            <span>Конвертер COINS</span>
            <strong>1 ₽ = 1,5 COINS</strong>
          </div>
          <label>
            <span>Сумма в рублях</span>
            <input inputMode="decimal" value={rubles} onChange={(event) => setRubles(event.target.value)} />
          </label>
          <output>{coins.toLocaleString('ru-RU')} COINS</output>
        </div>
      </div>
    </section>
  )
}
