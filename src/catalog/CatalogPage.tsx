import { useEffect, useMemo, useState } from 'react'

import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { products } from '../data/products'
import type { AvailabilityStatus, ProductKind } from '../types/product'
import {
  defaultCatalogFilters,
  filterProducts,
  parseCatalogState,
  serializeCatalogState,
  type CatalogFilters,
  type CatalogSort,
} from './catalogModel'
import { CatalogProductCard } from './CatalogProductCard'

const kindOptions: { label: string; value: ProductKind | 'all' }[] = [
  { label: 'Все', value: 'all' },
  { label: 'Скины', value: 'skin' },
  { label: 'Steam', value: 'steam-topup' },
  { label: 'GPT', value: 'gpt-topup' },
]

const availabilityOptions: { label: string; value: AvailabilityStatus }[] = [
  { label: 'В наличии', value: 'available' },
  { label: 'Моментально', value: 'instant' },
  { label: 'Осталось мало', value: 'limited' },
]

const serviceOptions: { label: string; kind: ProductKind }[] = [
  { label: 'Counter-Strike 2', kind: 'skin' },
  { label: 'Steam', kind: 'steam-topup' },
  { label: 'GPT', kind: 'gpt-topup' },
]

const categoryOptions = [...new Set(products.map((product) => product.category))]
const conditionOptions = [
  ...new Set(products.flatMap((product) => (product.condition ? [product.condition] : []))),
]

function toggleValue<T>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value]
}

export function CatalogPage() {
  const initialState = useMemo(() => parseCatalogState(window.location.search), [])
  const [filters, setFilters] = useState<CatalogFilters>(initialState.filters)
  const [sort, setSort] = useState<CatalogSort>(initialState.sort)
  const [isLoading, setIsLoading] = useState(
    () => new URLSearchParams(window.location.search).get('loading') === '1',
  )
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [notice, setNotice] = useState('')

  const results = useMemo(() => filterProducts(products, filters, sort), [filters, sort])

  useEffect(() => {
    if (isLoading) return

    const query = serializeCatalogState(filters, sort)
    window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}`)
  }, [filters, isLoading, sort])

  useEffect(() => {
    if (!isLoading) return

    const timer = window.setTimeout(() => setIsLoading(false), 350)
    return () => window.clearTimeout(timer)
  }, [isLoading])

  useEffect(() => {
    const syncFromLocation = () => {
      if (window.location.pathname !== '/catalog') return

      const nextState = parseCatalogState(window.location.search)
      setFilters(nextState.filters)
      setSort(nextState.sort)
    }

    window.addEventListener('popstate', syncFromLocation)
    return () => window.removeEventListener('popstate', syncFromLocation)
  }, [])

  const updateFilters = (patch: Partial<CatalogFilters>) => {
    setFilters((current) => ({ ...current, ...patch }))
  }

  const selectKind = (kind: ProductKind | 'all') => {
    updateFilters({ kinds: kind === 'all' ? [] : [kind] })
  }

  const reset = () => {
    setFilters({ ...defaultCatalogFilters })
    setSort('popular')
  }

  if (isLoading) {
    return (
      <div className="catalog-page">
        <Header />
        <main className="catalog-page__main" id="catalog">
          <header className="catalog-page__intro">
            <p className="eyebrow">NYXO / MARKETPLACE</p>
            <h1>Каталог</h1>
            <p>Скины и цифровые пополнения с понятной ценой в COINS.</p>
          </header>
          <section
            className="catalog-loading"
            role="status"
            aria-label="Загружаем каталог"
            aria-busy="true"
          >
            <p>Загружаем каталог…</p>
            <div className="catalog-loading__grid" aria-hidden="true">
              {Array.from({ length: 6 }, (_, index) => (
                <span key={index} className="catalog-loading__card" />
              ))}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    )
  }

  const chips = [
    ...(filters.query
      ? [{ key: 'query', label: `Поиск: ${filters.query}`, remove: () => updateFilters({ query: '' }) }]
      : []),
    ...filters.kinds.map((kind) => ({
      key: `kind-${kind}`,
      label: kindOptions.find((option) => option.value === kind)?.label ?? kind,
      remove: () => updateFilters({ kinds: filters.kinds.filter((item) => item !== kind) }),
    })),
    ...filters.categories.map((category) => ({
      key: `category-${category}`,
      label: category,
      remove: () =>
        updateFilters({ categories: filters.categories.filter((item) => item !== category) }),
    })),
    ...filters.availability.map((availability) => ({
      key: `availability-${availability}`,
      label:
        availabilityOptions.find((option) => option.value === availability)?.label ?? availability,
      remove: () =>
        updateFilters({
          availability: filters.availability.filter((item) => item !== availability),
        }),
    })),
    ...filters.conditions.map((condition) => ({
      key: `condition-${condition}`,
      label: condition,
      remove: () =>
        updateFilters({ conditions: filters.conditions.filter((item) => item !== condition) }),
    })),
    ...(filters.maxPrice !== defaultCatalogFilters.maxPrice
      ? [
          {
            key: 'max-price',
            label: `До ${filters.maxPrice} COINS`,
            remove: () => updateFilters({ maxPrice: defaultCatalogFilters.maxPrice }),
          },
        ]
      : []),
  ]

  return (
    <div className="catalog-page">
      <Header />
      <main className="catalog-page__main" id="catalog">
        <header className="catalog-page__intro">
          <p className="eyebrow">NYXO / MARKETPLACE</p>
          <h1>Каталог</h1>
          <p>Скины и цифровые пополнения с понятной ценой в COINS.</p>
        </header>

        <section className="catalog-page__toolbar" aria-label="Поиск и разделы каталога">
          <label>
            <span>Поиск по каталогу</span>
            <input
              type="search"
              value={filters.query}
              onChange={(event) => updateFilters({ query: event.target.value })}
            />
          </label>
          <div className="catalog-page__kind-controls" aria-label="Раздел каталога">
            {kindOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={
                  option.value === 'all'
                    ? filters.kinds.length === 0
                    : filters.kinds.includes(option.value)
                }
                onClick={() => selectKind(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            className="catalog-page__filter-disclosure"
            type="button"
            aria-expanded={filtersOpen}
            aria-controls="catalog-filters"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            {filtersOpen ? 'Скрыть фильтры' : 'Показать фильтры'}
          </button>
        </section>

        <div className="catalog-page__layout">
          <aside
            className={`catalog-filters ${filtersOpen ? 'catalog-filters--open' : ''}`}
            id="catalog-filters"
          >
            <fieldset>
              <legend>Тип / категория</legend>
              {categoryOptions.map((category) => (
                <label key={category}>
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={() =>
                      updateFilters({ categories: toggleValue(filters.categories, category) })
                    }
                  />
                  {category}
                </label>
              ))}
            </fieldset>

            <fieldset>
              <legend>Игра / сервис</legend>
              {serviceOptions.map((option) => {
                const selected = filters.kinds.includes(option.kind)
                return (
                  <label key={option.label}>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() =>
                        updateFilters({ kinds: toggleValue(filters.kinds, option.kind) })
                      }
                    />
                    {option.label}
                  </label>
                )
              })}
            </fieldset>

            <fieldset>
              <legend>Доступность</legend>
              {availabilityOptions.map((option) => (
                <label key={option.value}>
                  <input
                    type="checkbox"
                    checked={filters.availability.includes(option.value)}
                    onChange={() =>
                      updateFilters({
                        availability: toggleValue(filters.availability, option.value),
                      })
                    }
                  />
                  {option.label}
                </label>
              ))}
            </fieldset>

            <fieldset>
              <legend>Состояние</legend>
              {conditionOptions.map((condition) => (
                <label key={condition}>
                  <input
                    type="checkbox"
                    checked={filters.conditions.includes(condition)}
                    onChange={() =>
                      updateFilters({ conditions: toggleValue(filters.conditions, condition) })
                    }
                  />
                  {condition}
                </label>
              ))}
            </fieldset>

            <fieldset>
              <legend>Максимум COINS</legend>
              <label>
                <span>Цена до</span>
                <input
                  type="number"
                  min="0"
                  max={defaultCatalogFilters.maxPrice}
                  step="100"
                  value={filters.maxPrice}
                  onChange={(event) =>
                    updateFilters({ maxPrice: Math.max(0, Number(event.target.value) || 0) })
                  }
                />
              </label>
            </fieldset>
            <button type="button" onClick={reset}>
              Очистить фильтры
            </button>
          </aside>

          <section className="catalog-results" aria-label="Товары">
            <div className="catalog-results__head">
              <p aria-live="polite">
                {results.length} {results.length === 1 ? 'товар' : 'товаров'}
              </p>
              <label>
                <span>Сортировка</span>
                <select value={sort} onChange={(event) => setSort(event.target.value as CatalogSort)}>
                  <option value="popular">По популярности</option>
                  <option value="newest">Сначала новые</option>
                  <option value="price-asc">Сначала дешевле</option>
                  <option value="price-desc">Сначала дороже</option>
                </select>
              </label>
            </div>

            {chips.length > 0 && (
              <div className="catalog-results__chips" aria-label="Активные фильтры">
                {chips.map((chip) => (
                  <button key={chip.key} type="button" onClick={chip.remove}>
                    {chip.label} <span aria-hidden="true">×</span>
                    <span className="sr-only"> — убрать фильтр</span>
                  </button>
                ))}
              </div>
            )}

            {results.length > 0 ? (
              <div className="catalog-results__grid">
                {results.map((product) => (
                  <CatalogProductCard key={product.id} product={product} onAdded={setNotice} />
                ))}
              </div>
            ) : (
              <div className="catalog-results__empty">
                <h2>Ничего не найдено</h2>
                <p>Попробуйте изменить запрос или убрать часть фильтров.</p>
                <button type="button" onClick={reset}>
                  Сбросить фильтры
                </button>
              </div>
            )}
          </section>
        </div>
        {notice && <p role="status" className="catalog-page__notice">{notice}</p>}
      </main>
      <Footer />
    </div>
  )
}
