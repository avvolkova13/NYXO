import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  MARKETPLACE_STATE_EVENT,
  MARKETPLACE_STORAGE_KEY,
  createDefaultMarketplaceState,
  readMarketplaceState,
  replaceMarketplaceState,
  subscribeMarketplaceState,
  updateMarketplaceState,
} from './marketplaceStore'

describe('marketplaceStore', () => {
  beforeEach(() => {
    localStorage.clear()
    replaceMarketplaceState(createDefaultMarketplaceState())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('starts with 2,500 COINS and a complete seeded purchase history', () => {
    const state = readMarketplaceState()

    expect(state.version).toBe(1)
    expect(state.balanceCoins).toBe(2_500)
    expect(state.cartProductIds).toEqual([])
    expect(state.orders).toHaveLength(1)
    expect(state.orders[0]).toMatchObject({
      number: expect.any(String),
      createdAt: expect.any(String),
      totalCoins: expect.any(Number),
      status: 'completed',
      items: [
        {
          productId: expect.any(String),
          name: expect.any(String),
          priceCoins: expect.any(Number),
        },
      ],
    })
    expect(state.payments).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        createdAt: expect.any(String),
        kind: 'purchase',
        amountCoins: expect.any(Number),
        status: 'completed',
        orderId: state.orders[0].id,
      }),
    ])
  })

  it('falls back when stored data is malformed or only partially valid', () => {
    localStorage.setItem(MARKETPLACE_STORAGE_KEY, '{not-json')
    expect(readMarketplaceState()).toEqual(createDefaultMarketplaceState())

    localStorage.setItem(
      MARKETPLACE_STORAGE_KEY,
      JSON.stringify({ version: 1, balanceCoins: 99 }),
    )
    expect(readMarketplaceState()).toEqual(createDefaultMarketplaceState())
  })

  it('falls back safely when storage reads throw', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked')
    })

    expect(readMarketplaceState()).toEqual(createDefaultMarketplaceState())
  })

  it('normalizes duplicate cart ids when replacing and updating state', () => {
    const initial = createDefaultMarketplaceState()
    replaceMarketplaceState({ ...initial, cartProductIds: ['one', 'one', 'two'] })

    const result = updateMarketplaceState((state) => ({
      ...state,
      cartProductIds: [...state.cartProductIds, 'two', 'three', 'three'],
    }))

    expect(result.state.cartProductIds).toEqual(['one', 'two', 'three'])
    expect(readMarketplaceState().cartProductIds).toEqual(['one', 'two', 'three'])
  })

  it('updates the latest valid persisted snapshot before the store has been read', () => {
    const persisted = { ...createDefaultMarketplaceState(), balanceCoins: 9_000 }
    localStorage.setItem(MARKETPLACE_STORAGE_KEY, JSON.stringify(persisted))

    const result = updateMarketplaceState((state) => ({
      ...state,
      balanceCoins: state.balanceCoins + 1,
    }))

    expect(result.state.balanceCoins).toBe(9_001)
  })

  it('updates memory, notifies subscribers, and reports failed persistence', () => {
    const listener = vi.fn()
    const eventListener = vi.fn()
    const unsubscribe = subscribeMarketplaceState(listener)
    window.addEventListener(MARKETPLACE_STATE_EVENT, eventListener)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota exceeded')
    })

    const result = updateMarketplaceState((state) => ({ ...state, balanceCoins: 3_000 }))

    expect(result.persisted).toBe(false)
    expect(result.error).toBeInstanceOf(Error)
    expect(result.state.balanceCoins).toBe(3_000)
    expect(readMarketplaceState().balanceCoins).toBe(3_000)
    expect(listener).toHaveBeenCalledTimes(1)
    expect(eventListener).toHaveBeenCalledTimes(1)

    unsubscribe()
    window.dispatchEvent(new Event(MARKETPLACE_STATE_EVENT))
    expect(listener).toHaveBeenCalledTimes(1)
    window.removeEventListener(MARKETPLACE_STATE_EVENT, eventListener)
  })
})
