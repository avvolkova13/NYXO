import { describe, expect, it } from 'vitest'
import { products } from '../data/products'
import type { AvailabilityStatus, ProductKind } from '../types/product'
import {
  defaultCatalogFilters,
  filterProducts,
  parseCatalogState,
  serializeCatalogState,
} from './catalogModel'
import { createCatalogOffers, resolveCatalogProduct } from './catalogOffers'

describe('filterProducts', () => {
  it.each(['Steam', 'GPT', 'Пистолет', 'Автомат'])('finds %s', (query) => {
    const result = filterProducts(products, { ...defaultCatalogFilters, query }, 'popular')

    expect(result.length).toBeGreaterThan(0)
  })

  it('searches the product category', () => {
    const item = {
      ...products[0],
      name: 'Товар без совпадения',
      category: 'Коллекционная категория',
      game: undefined,
      weaponType: undefined,
      description: '',
      searchAliases: [],
    }

    expect(
      filterProducts(
        [item],
        { ...defaultCatalogFilters, query: 'Коллекционная категория' },
        'popular',
      ),
    ).toEqual([item])
  })

  it('searches the product name', () => {
    const item = {
      ...products[0],
      name: 'Именной артефакт',
      category: 'Категория без совпадения',
      game: undefined,
      weaponType: undefined,
      description: '',
      searchAliases: [],
    }

    expect(
      filterProducts(
        [item],
        { ...defaultCatalogFilters, query: 'Именной артефакт' },
        'popular',
      ),
    ).toEqual([item])
  })

  it('combines category, availability, and maximum price', () => {
    const result = filterProducts(
      products,
      {
        ...defaultCatalogFilters,
        kinds: ['skin'],
        categories: ['Пистолет'],
        availability: ['available'],
        maxPrice: 10_000,
      },
      'price-asc',
    )

    expect(result.length).toBeGreaterThan(0)
    expect(
      result.every(
        (item) =>
          item.kind === 'skin' &&
          item.category === 'Пистолет' &&
          item.availability === 'available' &&
          item.price <= 10_000,
      ),
    ).toBe(true)
  })

  it('sorts every product by ascending and descending price', () => {
    const ascending = filterProducts(products, defaultCatalogFilters, 'price-asc')
    const descending = filterProducts(products, defaultCatalogFilters, 'price-desc')

    expect(
      ascending.every((item, index) => index === 0 || ascending[index - 1].price <= item.price),
    ).toBe(true)
    expect(
      descending.every((item, index) => index === 0 || descending[index - 1].price >= item.price),
    ).toBe(true)
  })

  it('sorts every product by popularity and newest date', () => {
    const popular = filterProducts(products, defaultCatalogFilters, 'popular')
    const newest = filterProducts(products, defaultCatalogFilters, 'newest')

    expect(
      popular.every(
        (item, index) => index === 0 || popular[index - 1].popularity >= item.popularity,
      ),
    ).toBe(true)
    expect(
      newest.every(
        (item, index) =>
          index === 0 || Date.parse(newest[index - 1].createdAt) >= Date.parse(item.createdAt),
      ),
    ).toBe(true)
  })

  it('filters by condition', () => {
    const result = filterProducts(
      products,
      { ...defaultCatalogFilters, conditions: ['После полевых испытаний'] },
      'popular',
    )

    expect(result.length).toBeGreaterThan(0)
    expect(result.every((item) => item.condition === 'После полевых испытаний')).toBe(true)
  })
})

describe('catalog URL state', () => {
  it('round-trips filters through URL parameters', () => {
    const filters = {
      ...defaultCatalogFilters,
      query: 'Steam',
      kinds: ['steam-topup'] as ProductKind[],
      maxPrice: 9_000,
    }

    const restored = parseCatalogState(serializeCatalogState(filters, 'price-asc'))

    expect(restored).toEqual({ filters, sort: 'price-asc' })
  })

  it('serializes state in a stable parameter order', () => {
    const filters = {
      ...defaultCatalogFilters,
      query: 'AK-47',
      kinds: ['skin'] as ProductKind[],
      categories: ['Автомат', 'Винтовка'],
      availability: ['available', 'limited'] as AvailabilityStatus[],
      conditions: ['Прямо с завода'],
      maxPrice: 15_000,
    }

    expect(serializeCatalogState(filters, 'newest')).toBe(
      'query=AK-47&kinds=skin&categories=%D0%90%D0%B2%D1%82%D0%BE%D0%BC%D0%B0%D1%82%2C%D0%92%D0%B8%D0%BD%D1%82%D0%BE%D0%B2%D0%BA%D0%B0&availability=available%2Climited&conditions=%D0%9F%D1%80%D1%8F%D0%BC%D0%BE+%D1%81+%D0%B7%D0%B0%D0%B2%D0%BE%D0%B4%D0%B0&maxPrice=15000&sort=newest',
    )
  })

  it('falls back from an unknown sort', () => {
    expect(parseCatalogState('sort=surprise').sort).toBe('popular')
  })

  it.each([
    ['malformed', '12oops'],
    ['empty', ''],
    ['non-finite', 'Infinity'],
    ['negative', '-1'],
  ])('falls back from a %s maximum price', (_case, maxPrice) => {
    expect(parseCatalogState(`maxPrice=${maxPrice}`).filters.maxPrice).toBe(
      defaultCatalogFilters.maxPrice,
    )
  })

  it('accepts repeated array parameters', () => {
    const restored = parseCatalogState(
      'kinds=skin&kinds=gpt-topup&categories=%D0%9D%D0%BE%D0%B6&categories=%D0%90%D0%B2%D1%82%D0%BE%D0%BC%D0%B0%D1%82',
    )

    expect(restored.filters.kinds).toEqual(['skin', 'gpt-topup'])
    expect(restored.filters.categories).toEqual(['Нож', 'Автомат'])
  })

  it('ignores unknown product kinds and availability values', () => {
    const restored = parseCatalogState(
      'kinds=skin%2Cunknown%2Cgpt-topup&availability=available%2Cgone%2Cinstant',
    )

    expect(restored.filters.kinds).toEqual(['skin', 'gpt-topup'])
    expect(restored.filters.availability).toEqual(['available', 'instant'])
  })
})

describe('catalog offer pages', () => {
  it('creates stable, visibly different records for the first and second feed pages', () => {
    const firstPage = createCatalogOffers(products, 0)
    const secondPage = createCatalogOffers(products, 1)

    expect(firstPage.map((offer) => offer.id)).not.toEqual(secondPage.map((offer) => offer.id))
    expect(new Set([...firstPage, ...secondPage].map((offer) => offer.id)).size).toBe(
      products.length * 2,
    )
    expect(secondPage.every((offer) => offer.label !== firstPage.find(
      (candidate) => candidate.baseProductId === offer.baseProductId,
    )?.label)).toBe(true)

    const firstSkin = firstPage.find((offer) => offer.product.kind === 'skin')!
    const secondSkin = secondPage.find(
      (offer) => offer.baseProductId === firstSkin.baseProductId,
    )!
    expect(secondSkin.product.attribute).not.toBe(firstSkin.product.attribute)
    expect(secondSkin.product.price).not.toBe(firstSkin.product.price)
  })

  it('resolves an appended offer id back to the exact cart product', () => {
    const offer = createCatalogOffers(products, 2)[0]

    expect(resolveCatalogProduct(offer.id)).toEqual(offer.product)
  })

  it('keeps service denominations factual while giving each offer a unique presentation', () => {
    const service = products.find((product) => product.kind === 'steam-topup')!
    const [first] = createCatalogOffers([service], 0)
    const [second] = createCatalogOffers([service], 1)

    expect(second.product.name).toBe(first.product.name)
    expect(second.product.price).toBe(first.product.price)
    expect(second.product.attribute).not.toBe(first.product.attribute)
    expect(second.label).not.toBe(first.label)
  })
})
