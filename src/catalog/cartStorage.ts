const CART_STORAGE_KEY = 'nyxo:cart'

export type CartStorageResult = { ok: true } | { ok: false }

function readCartIds(): string[] {
  try {
    const stored = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? '[]')
    return Array.isArray(stored) ? stored.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

export function addCartProductId(productId: string): CartStorageResult {
  const ids = readCartIds()

  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([...new Set([...ids, productId])]))
    return { ok: true }
  } catch {
    return { ok: false }
  }
}
