import type { AvailabilityStatus, Product, ProductKind } from '../types/product'

export type CatalogSort = 'popular' | 'newest' | 'price-asc' | 'price-desc'

export interface CatalogFilters {
  query: string
  kinds: ProductKind[]
  categories: string[]
  availability: AvailabilityStatus[]
  conditions: string[]
  maxPrice: number
}

export interface CatalogState {
  filters: CatalogFilters
  sort: CatalogSort
}

export const defaultCatalogFilters: CatalogFilters = {
  query: '',
  kinds: [],
  categories: [],
  availability: [],
  conditions: [],
  maxPrice: 50_000,
}

const productKinds: ProductKind[] = ['skin', 'steam-topup', 'gpt-topup']
const availabilityStatuses: AvailabilityStatus[] = ['available', 'instant', 'limited']
const catalogSorts: CatalogSort[] = ['popular', 'newest', 'price-asc', 'price-desc']

const searchableText = (product: Product) =>
  [
    product.name,
    product.category,
    product.game,
    product.weaponType,
    product.description,
    ...product.searchAliases,
  ]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase('ru-RU')

const sorters: Record<CatalogSort, (left: Product, right: Product) => number> = {
  popular: (left, right) => right.popularity - left.popularity,
  newest: (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
  'price-asc': (left, right) => left.price - right.price,
  'price-desc': (left, right) => right.price - left.price,
}

export function filterProducts(items: Product[], filters: CatalogFilters, sort: CatalogSort): Product[] {
  const query = filters.query.trim().toLocaleLowerCase('ru-RU')
  const filtered = items.filter(
    (product) =>
      (!query || searchableText(product).includes(query)) &&
      (!filters.kinds.length || filters.kinds.includes(product.kind)) &&
      (!filters.categories.length || filters.categories.includes(product.category)) &&
      (!filters.availability.length || filters.availability.includes(product.availability)) &&
      (!filters.conditions.length ||
        Boolean(product.condition && filters.conditions.includes(product.condition))) &&
      product.price <= filters.maxPrice,
  )

  return [...filtered].sort(sorters[sort])
}

function readArray(params: URLSearchParams, key: string): string[] {
  return params
    .getAll(key)
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(Boolean)
}

function isProductKind(value: string): value is ProductKind {
  return productKinds.includes(value as ProductKind)
}

function isAvailabilityStatus(value: string): value is AvailabilityStatus {
  return availabilityStatuses.includes(value as AvailabilityStatus)
}

function isCatalogSort(value: string | null): value is CatalogSort {
  return value !== null && catalogSorts.includes(value as CatalogSort)
}

export function parseCatalogState(value: string | URLSearchParams): CatalogState {
  const params = typeof value === 'string' ? new URLSearchParams(value) : value
  const rawMaxPrice = params.get('maxPrice')
  const parsedMaxPrice =
    rawMaxPrice === null || rawMaxPrice.trim() === '' ? Number.NaN : Number(rawMaxPrice)
  const rawSort = params.get('sort')

  return {
    filters: {
      query: params.get('query') ?? defaultCatalogFilters.query,
      kinds: readArray(params, 'kinds').filter(isProductKind),
      categories: readArray(params, 'categories'),
      availability: readArray(params, 'availability').filter(isAvailabilityStatus),
      conditions: readArray(params, 'conditions'),
      maxPrice:
        Number.isFinite(parsedMaxPrice) && parsedMaxPrice >= 0
          ? parsedMaxPrice
          : defaultCatalogFilters.maxPrice,
    },
    sort: isCatalogSort(rawSort) ? rawSort : 'popular',
  }
}

export function serializeCatalogState(filters: CatalogFilters, sort: CatalogSort): string {
  const params = new URLSearchParams()

  if (filters.query) params.set('query', filters.query)
  if (filters.kinds.length) params.set('kinds', filters.kinds.join(','))
  if (filters.categories.length) params.set('categories', filters.categories.join(','))
  if (filters.availability.length) params.set('availability', filters.availability.join(','))
  if (filters.conditions.length) params.set('conditions', filters.conditions.join(','))
  if (filters.maxPrice !== defaultCatalogFilters.maxPrice) {
    params.set('maxPrice', String(filters.maxPrice))
  }
  if (sort !== 'popular') params.set('sort', sort)

  return params.toString()
}
