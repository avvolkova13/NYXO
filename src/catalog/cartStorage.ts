import { products } from '../data/products'
import {
  updateMarketplaceState,
  type MarketplaceState,
} from '../marketplace/marketplaceStore'

const LEGACY_CART_STORAGE_KEY = 'nyxo:cart'
const validProductIds = new Set(products.map((product) => product.id))

export type CartStorageResult = {
  ok: boolean
  state: MarketplaceState
}

export function addCartProductId(productId: string): CartStorageResult {
  const result = updateMarketplaceState((state) => ({
    ...state,
    cartProductIds: [...new Set([...state.cartProductIds, productId])],
  }))

  return { ok: result.persisted, state: result.state }
}

export interface LegacyCartMigrationResult {
  ok: boolean
  migratedIds: string[]
}

export function migrateLegacyCartIds(): LegacyCartMigrationResult {
  let rawLegacyCart: string | null

  try {
    rawLegacyCart = window.localStorage.getItem(LEGACY_CART_STORAGE_KEY)
  } catch {
    return { ok: false, migratedIds: [] }
  }

  if (rawLegacyCart === null) return { ok: true, migratedIds: [] }

  let legacyValues: unknown = []
  try {
    legacyValues = JSON.parse(rawLegacyCart)
  } catch {
    // Malformed legacy data is not safe to migrate and can be retired.
  }

  const migratedIds = Array.isArray(legacyValues)
    ? [...new Set(legacyValues.filter(
        (id): id is string => typeof id === 'string' && validProductIds.has(id),
      ))]
    : []

  if (migratedIds.length > 0) {
    const result = updateMarketplaceState((state) => ({
      ...state,
      cartProductIds: [...new Set([...state.cartProductIds, ...migratedIds])],
    }))
    if (!result.persisted) return { ok: false, migratedIds }
  }

  try {
    window.localStorage.removeItem(LEGACY_CART_STORAGE_KEY)
  } catch {
    // The shared store is already authoritative; legacy cleanup is best effort.
  }

  return { ok: true, migratedIds }
}
