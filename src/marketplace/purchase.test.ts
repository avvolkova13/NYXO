import { describe, expect, it } from 'vitest'

import { products } from '../data/products'
import { createDefaultMarketplaceState } from './marketplaceStore'
import { calculateCart, completePurchase } from './purchase'

const skin = products.find((product) => product.kind === 'skin')!
const service = products.find((product) => product.kind === 'steam-topup')!

describe('calculateCart', () => {
  it('uses unique known product ids and exact rounded COINS prices', () => {
    const cart = calculateCart(products, [skin.id, service.id, skin.id, 'missing'])

    expect(cart.items.map((item) => item.id)).toEqual([skin.id, service.id])
    expect(cart.subtotalCoins).toBe(Math.round(skin.price) + Math.round(service.price))
    expect(cart.hasSkin).toBe(true)
  })
})

describe('completePurchase', () => {
  it('reports the exact shortage without changing state', () => {
    const state = {
      ...createDefaultMarketplaceState(),
      balanceCoins: 100,
      cartProductIds: [service.id],
    }

    const result = completePurchase(state, products)

    expect(result).toMatchObject({ status: 'insufficient', subtotalCoins: 500, shortageCoins: 400 })
    expect(result.state).toBe(state)
  })

  it('requires Steam only when the cart contains a skin', () => {
    const base = { ...createDefaultMarketplaceState(), balanceCoins: 20_000 }

    expect(completePurchase({ ...base, cartProductIds: [skin.id] }, products).status)
      .toBe('steam-required')
    expect(completePurchase({ ...base, cartProductIds: [service.id] }, products).status)
      .toBe('success')
  })

  it('deducts COINS and creates one order, payment, and skin inventory item atomically', () => {
    const state = {
      ...createDefaultMarketplaceState(),
      balanceCoins: 20_000,
      cartProductIds: [skin.id, service.id],
      session: {
        method: 'steam' as const,
        displayName: 'Tester',
        createdAt: '2026-07-15T00:00:00.000Z',
      },
    }
    const before = {
      orders: state.orders.length,
      payments: state.payments.length,
      inventory: state.inventory.length,
    }

    const result = completePurchase(state, products, {
      now: () => '2026-07-16T09:30:00.000Z',
      createId: (kind) => `fixed-${kind}`,
    })

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error('Expected success')
    expect(result.state.balanceCoins).toBe(20_000 - result.subtotalCoins)
    expect(result.state.cartProductIds).toEqual([])
    expect(result.state.orders).toHaveLength(before.orders + 1)
    expect(result.state.payments).toHaveLength(before.payments + 1)
    expect(result.state.inventory).toHaveLength(before.inventory + 1)
    expect(result.order).toMatchObject({
      id: 'fixed-order',
      number: 'NYXO-260716-0002',
      createdAt: '2026-07-16T09:30:00.000Z',
      totalCoins: result.subtotalCoins,
    })
    expect(result.state.payments.at(-1)).toMatchObject({
      id: 'fixed-payment',
      orderId: 'fixed-order',
      amountCoins: result.subtotalCoins,
    })
    expect(result.state.inventory.at(-1)).toMatchObject({
      id: 'fixed-inventory-0',
      productId: skin.id,
    })
  })

  it('protects a repeated purchase from creating duplicates', () => {
    const state = {
      ...createDefaultMarketplaceState(),
      balanceCoins: 1_000,
      cartProductIds: [service.id],
    }
    const first = completePurchase(state, products)
    expect(first.status).toBe('success')

    const repeated = completePurchase(first.state, products)
    expect(repeated.status).toBe('empty')
    expect(repeated.state.orders).toHaveLength(first.state.orders.length)
    expect(repeated.state.payments).toHaveLength(first.state.payments.length)
  })
})
