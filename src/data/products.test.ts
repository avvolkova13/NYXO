import { describe, expect, it } from 'vitest'

import { featuredProduct, products } from './products'

describe('mock product catalogue', () => {
  it('provides a featured item and enough supporting inventory', () => {
    expect(products.length).toBeGreaterThanOrEqual(5)
    expect(featuredProduct.featured).toBe(true)
  })

  it('keeps marketplace identity and value fields complete', () => {
    for (const product of products) {
      expect(product.id).toBeTruthy()
      expect(product.slug).toBeTruthy()
      expect(product.name).toBeTruthy()
      expect(product.category).toBeTruthy()
      expect(product.description).toBeTruthy()
      expect(product.searchAliases.length).toBeGreaterThan(0)
      expect(product.price).toBeGreaterThan(0)
      expect(product.delivery).toBeTruthy()
      expect(product.popularity).toBeGreaterThanOrEqual(0)
      expect(product.createdAt).toBeTruthy()
    }
  })

  it('preserves the original LIS-SKINS inventory and artwork', () => {
    const originalSkinIds = [
      'ak47-wild-lotus',
      'm4a4-howl',
      'butterfly-fade',
      'awp-dragon-lore',
      'butterfly-black-pearl',
    ]
    const originalSkins = products.filter((product) => originalSkinIds.includes(product.id))

    expect(products.length).toBeGreaterThanOrEqual(12)
    expect(originalSkins.map((product) => product.id)).toEqual(originalSkinIds)
    expect(products[0]).toMatchObject({
      id: 'ak47-wild-lotus',
      name: 'AK-47 | Дикий лотос',
      price: 15_474.43,
      currency: 'COINS',
      condition: 'Прямо с завода',
      attributeLabel: 'Float',
      attribute: '0,054949',
      imageUrl: 'https://assets.lis-skins.com/market_images/145355_s.png',
    })
    expect(originalSkins.every((product) => product.imageUrl.startsWith('https://assets.lis-skins.com/'))).toBe(true)
  })

  it.each(['steam', 'gpt', 'пистолет', 'автомат'])('contains searchable mock data for %s', (term) => {
    const normalized = term.toLowerCase()
    expect(products.some((product) =>
      [product.name, product.category, product.game, ...product.searchAliases]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    )).toBe(true)
  })

  it('stores all marketplace prices in COINS', () => {
    expect(products.every((product) => product.currency === 'COINS')).toBe(true)
  })
})
