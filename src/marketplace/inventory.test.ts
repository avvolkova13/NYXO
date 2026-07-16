import { beforeEach, describe, expect, it } from 'vitest'

import {
  createDefaultMarketplaceState,
  readMarketplaceState,
  replaceMarketplaceState,
} from './marketplaceStore'
import {
  isValidSteamTradeUrl,
  requestInventoryWithdrawal,
  saveSteamTradeUrl,
} from './inventory'

const validTradeUrl =
  'https://steamcommunity.com/tradeoffer/new/?partner=12345678&token=AbC_123'

describe('inventory marketplace actions', () => {
  beforeEach(() => {
    localStorage.clear()
    replaceMarketplaceState({
      ...createDefaultMarketplaceState(),
      balanceCoins: 4_200,
      inventory: [
        {
          id: 'inventory-howl',
          productId: 'm4a4-howl',
          name: 'M4A4 | Вой',
          valueCoins: 15_042,
          acquiredAt: '2026-07-16T10:30:00.000Z',
          status: 'available',
          imageSrc: '/inventory-howl.png',
        },
      ],
    })
  })

  it('accepts only a complete Steam trade-offer URL', () => {
    expect(isValidSteamTradeUrl(validTradeUrl)).toBe(true)
    expect(isValidSteamTradeUrl('')).toBe(false)
    expect(isValidSteamTradeUrl('https://example.com/tradeoffer/new/?partner=1&token=x')).toBe(false)
    expect(isValidSteamTradeUrl('http://steamcommunity.com/tradeoffer/new/?partner=1&token=x')).toBe(false)
    expect(isValidSteamTradeUrl('https://steamcommunity.com/tradeoffer/new/?partner=1')).toBe(false)
    expect(isValidSteamTradeUrl('https://steamcommunity.com/tradeoffer/new/?token=x')).toBe(false)
  })

  it('persists a valid trimmed Trade URL and rejects an invalid one', () => {
    expect(saveSteamTradeUrl(`  ${validTradeUrl}  `)).toMatchObject({ ok: true })
    expect(readMarketplaceState().steamTradeUrl).toBe(validTradeUrl)

    expect(saveSteamTradeUrl('https://steamcommunity.com/id/not-a-trade-url')).toMatchObject({
      ok: false,
      reason: 'invalid-trade-url',
    })
    expect(readMarketplaceState().steamTradeUrl).toBe(validTradeUrl)
  })

  it('requires a Trade URL before requesting withdrawal', () => {
    expect(requestInventoryWithdrawal('inventory-howl')).toMatchObject({
      ok: false,
      reason: 'missing-trade-url',
    })
    expect(readMarketplaceState().inventory[0].status).toBe('available')
  })

  it('moves an available item to withdrawal-pending without changing balance', () => {
    saveSteamTradeUrl(validTradeUrl)

    expect(requestInventoryWithdrawal('inventory-howl')).toMatchObject({ ok: true })
    const state = readMarketplaceState()
    expect(state.inventory[0].status).toBe('withdrawal-pending')
    expect(state.balanceCoins).toBe(4_200)
  })
})
