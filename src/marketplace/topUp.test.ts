import { describe, expect, it, vi } from 'vitest'

import { createDefaultMarketplaceState } from './marketplaceStore'
import { applyTopUp, isValidTopUpAmount, TopUpBalanceOverflowError } from './topUp'

describe('applyTopUp', () => {
  it.each([100, 1_000, 3_000, 5_000, 10_000, 100_000])(
    'accepts the valid integer amount %i',
    (amountCoins) => {
      expect(isValidTopUpAmount(amountCoins)).toBe(true)
    },
  )

  it.each([99, 100_001, 1_000.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects the invalid amount %s',
    (amountCoins) => {
      expect(isValidTopUpAmount(amountCoins)).toBe(false)
    },
  )

  it('adds COINS and creates a linked completed top-up payment without fiat data', () => {
    const state = createDefaultMarketplaceState()

    const result = applyTopUp(state, 3_000, {
      now: () => '2026-07-16T10:20:30.000Z',
      createId: () => 'top-up-payment-001',
    })

    expect(result.state).not.toBe(state)
    expect(result.state.balanceCoins).toBe(state.balanceCoins + 3_000)
    expect(result.state.payments).toHaveLength(state.payments.length + 1)
    expect(result.payment).toEqual({
      id: 'top-up-payment-001',
      createdAt: '2026-07-16T10:20:30.000Z',
      kind: 'top-up',
      amountCoins: 3_000,
      status: 'completed',
    })
    expect(result.state.payments.at(-1)).toBe(result.payment)
    expect(JSON.stringify(result.payment)).not.toMatch(/rub|rouble|ruble|fiat|price|currency/i)
  })

  it('rejects an invalid amount without mutating the source state', () => {
    const state = createDefaultMarketplaceState()

    expect(() => applyTopUp(state, 99)).toThrow('100 до 100 000')
    expect(state).toEqual(createDefaultMarketplaceState())
  })

  it('rejects an unsafe resulting balance before creating a payment or mutating state', () => {
    const state = {
      ...createDefaultMarketplaceState(),
      balanceCoins: Number.MAX_SAFE_INTEGER,
    }
    const snapshot = structuredClone(state)
    const createId = vi.fn(() => 'must-not-be-created')

    expect(() => applyTopUp(state, 100, { createId })).toThrow(TopUpBalanceOverflowError)
    expect(createId).not.toHaveBeenCalled()
    expect(state).toEqual(snapshot)
  })
})
