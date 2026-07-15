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
      expect(product.name).toBeTruthy()
      expect(product.game).toBeTruthy()
      expect(product.price).toBeGreaterThan(0)
      expect(product.condition).toBeTruthy()
    }
  })

  it('uses LIS-SKINS source data and images instead of synthetic catalogue entries', () => {
    expect(products).toHaveLength(5)
    expect(products[0]).toMatchObject({
      id: 'ak47-wild-lotus',
      name: 'AK-47 | Дикий лотос',
      price: 15_474.43,
      currency: '$',
      condition: 'Прямо с завода',
      attributeLabel: 'Float',
      attribute: '0,054949',
      imageUrl: 'https://assets.lis-skins.com/market_images/145355_s.png',
    })
    expect(products.every((product) => product.imageUrl.startsWith('https://assets.lis-skins.com/'))).toBe(true)
  })
})
