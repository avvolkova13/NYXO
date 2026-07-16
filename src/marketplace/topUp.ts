import type { MarketplacePayment, MarketplaceState } from './marketplaceStore'

export const TOP_UP_PACKAGES = [1_000, 3_000, 5_000, 10_000] as const
export const MIN_TOP_UP_COINS = 100
export const MAX_TOP_UP_COINS = 100_000

export interface TopUpOptions {
  now?: () => string
  createId?: () => string
}

export interface TopUpResult {
  state: MarketplaceState
  payment: MarketplacePayment
}

export class TopUpBalanceOverflowError extends RangeError {
  constructor() {
    super('Итоговый баланс COINS должен быть неотрицательным безопасным целым числом.')
    this.name = 'TopUpBalanceOverflowError'
  }
}

export function isValidTopUpAmount(value: unknown): value is number {
  return (
    typeof value === 'number'
    && Number.isSafeInteger(value)
    && value >= MIN_TOP_UP_COINS
    && value <= MAX_TOP_UP_COINS
  )
}

export function applyTopUp(
  state: MarketplaceState,
  amountCoins: number,
  options: TopUpOptions = {},
): TopUpResult {
  if (!isValidTopUpAmount(amountCoins)) {
    throw new RangeError('Сумма пополнения должна быть целым числом от 100 до 100 000 COINS.')
  }

  const nextBalanceCoins = state.balanceCoins + amountCoins
  if (!Number.isSafeInteger(nextBalanceCoins) || nextBalanceCoins < 0) {
    throw new TopUpBalanceOverflowError()
  }

  const createdAt = options.now?.() ?? new Date().toISOString()
  const payment: MarketplacePayment = {
    id: options.createId?.() ?? `top-up-${createdAt.replace(/\D/g, '').slice(0, 17)}-${state.payments.length + 1}`,
    createdAt,
    kind: 'top-up',
    amountCoins,
    status: 'completed',
  }
  const nextState: MarketplaceState = {
    ...state,
    balanceCoins: nextBalanceCoins,
    payments: [...state.payments, payment],
  }

  return { state: nextState, payment }
}
