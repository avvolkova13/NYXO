import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  MARKETPLACE_STATE_EVENT,
  createDefaultMarketplaceState,
  replaceMarketplaceState,
} from './marketplaceStore'
import { useMarketplaceState } from './useMarketplaceState'

describe('useMarketplaceState', () => {
  beforeEach(() => {
    localStorage.clear()
    replaceMarketplaceState(createDefaultMarketplaceState())
  })

  it('updates on marketplace events and removes its listener on unmount', () => {
    const removeListener = vi.spyOn(window, 'removeEventListener')
    const { result, unmount } = renderHook(() => useMarketplaceState())

    act(() => {
      replaceMarketplaceState({
        ...createDefaultMarketplaceState(),
        balanceCoins: 3_500,
      })
    })
    expect(result.current.balanceCoins).toBe(3_500)

    unmount()
    expect(removeListener).toHaveBeenCalledWith(
      MARKETPLACE_STATE_EVENT,
      expect.any(Function),
    )

    act(() => {
      replaceMarketplaceState({
        ...createDefaultMarketplaceState(),
        balanceCoins: 4_500,
      })
    })
    expect(result.current.balanceCoins).toBe(3_500)
  })
})
