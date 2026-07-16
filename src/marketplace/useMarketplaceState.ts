import { useEffect, useState } from 'react'

import {
  readMarketplaceState,
  subscribeMarketplaceState,
  type MarketplaceState,
} from './marketplaceStore'

export function useMarketplaceState(): MarketplaceState {
  const [state, setState] = useState(readMarketplaceState)

  useEffect(
    () => subscribeMarketplaceState(() => setState(readMarketplaceState())),
    [],
  )

  return state
}
