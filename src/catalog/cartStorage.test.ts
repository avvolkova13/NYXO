import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { products } from '../data/products'
import {
  createDefaultMarketplaceState,
  readMarketplaceState,
  replaceMarketplaceState,
} from '../marketplace/marketplaceStore'
import { addCartProductId, migrateLegacyCartIds } from './cartStorage'

describe('addCartProductId', () => {
  beforeEach(() => {
    window.localStorage.clear()
    replaceMarketplaceState(createDefaultMarketplaceState())
  })
  afterEach(() => vi.restoreAllMocks())

  it('deduplicates product ids', () => {
    expect(addCartProductId(products[0].id).ok).toBe(true)
    expect(addCartProductId(products[0].id).ok).toBe(true)
    expect(readMarketplaceState().cartProductIds).toEqual([products[0].id])
  })

  it('recovers from malformed stored data', () => {
    window.localStorage.setItem('nyxo:cart', '{broken')
    expect(migrateLegacyCartIds()).toEqual({ ok: true, migratedIds: [] })
    expect(window.localStorage.getItem('nyxo:cart')).toBeNull()
  })

  it('recovers when reading storage throws and still attempts a clean write', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const setItem = vi.spyOn(Storage.prototype, 'setItem')

    expect(addCartProductId(products[0].id).ok).toBe(true)
    expect(setItem).toHaveBeenCalled()
  })

  it('returns a failure instead of throwing when writing storage fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })

    const result = addCartProductId(products[0].id)
    expect(result.ok).toBe(false)
    expect(result.state.cartProductIds).toEqual([products[0].id])
  })

  it('migrates only known product ids, deduplicates them, and removes the legacy key', () => {
    window.localStorage.setItem(
      'nyxo:cart',
      JSON.stringify([products[0].id, products[0].id, products[1].id, 'unknown']),
    )

    expect(migrateLegacyCartIds()).toEqual({
      ok: true,
      migratedIds: [products[0].id, products[1].id],
    })
    expect(readMarketplaceState().cartProductIds).toEqual([products[0].id, products[1].id])
    expect(window.localStorage.getItem('nyxo:cart')).toBeNull()
  })
})
