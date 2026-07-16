import {
  readMarketplaceState,
  replaceMarketplaceState,
  updateMarketplaceState,
  type MarketplaceState,
} from './marketplaceStore'

export type InventoryActionFailure =
  | 'invalid-trade-url'
  | 'missing-trade-url'
  | 'item-not-found'
  | 'item-unavailable'
  | 'storage-error'

export type InventoryActionResult =
  | { ok: true; state: MarketplaceState }
  | { ok: false; reason: InventoryActionFailure; state: MarketplaceState }

export function isValidSteamTradeUrl(value: string) {
  try {
    const url = new URL(value.trim())
    return (
      url.protocol === 'https:' &&
      url.hostname === 'steamcommunity.com' &&
      url.pathname === '/tradeoffer/new/' &&
      /^\d+$/.test(url.searchParams.get('partner') ?? '') &&
      (url.searchParams.get('token')?.trim().length ?? 0) > 0 &&
      url.username === '' &&
      url.password === ''
    )
  } catch {
    return false
  }
}

function storageFailure(previous: MarketplaceState): InventoryActionResult {
  const rollback = replaceMarketplaceState(previous)
  return { ok: false, reason: 'storage-error', state: rollback.state }
}

export function saveSteamTradeUrl(value: string): InventoryActionResult {
  const tradeUrl = value.trim()
  const current = readMarketplaceState()
  if (!isValidSteamTradeUrl(tradeUrl)) {
    return { ok: false, reason: 'invalid-trade-url', state: current }
  }

  const result = updateMarketplaceState((state) => ({ ...state, steamTradeUrl: tradeUrl }))
  if (!result.persisted) return storageFailure(current)
  return { ok: true, state: result.state }
}

export function requestInventoryWithdrawal(itemId: string): InventoryActionResult {
  const current = readMarketplaceState()
  if (!current.steamTradeUrl) {
    return { ok: false, reason: 'missing-trade-url', state: current }
  }
  if (!isValidSteamTradeUrl(current.steamTradeUrl)) {
    return { ok: false, reason: 'invalid-trade-url', state: current }
  }

  const item = current.inventory.find((candidate) => candidate.id === itemId)
  if (!item) return { ok: false, reason: 'item-not-found', state: current }
  if (item.status !== 'available') {
    return { ok: false, reason: 'item-unavailable', state: current }
  }

  const result = updateMarketplaceState((state) => ({
    ...state,
    inventory: state.inventory.map((candidate) =>
      candidate.id === itemId
        ? { ...candidate, status: 'withdrawal-pending' as const }
        : candidate,
    ),
  }))
  if (!result.persisted) return storageFailure(current)
  return { ok: true, state: result.state }
}
