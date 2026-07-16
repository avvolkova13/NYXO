export const MARKETPLACE_STORAGE_KEY = 'nyxo:marketplace:v1'
export const MARKETPLACE_STATE_EVENT = 'nyxo:marketplace-state'

export type Session =
  | {
      method: 'steam'
      displayName: string
      createdAt: string
      steamId?: string
    }
  | {
      method: 'email'
      displayName: string
      email: string
      createdAt: string
    }

export interface MarketplaceOrderItem {
  productId: string
  name: string
  priceCoins: number
  imageSrc?: string
  category?: string
}

export interface MarketplaceOrder {
  id: string
  number: string
  createdAt: string
  items: MarketplaceOrderItem[]
  totalCoins: number
  status: 'completed'
}

export interface MarketplacePayment {
  id: string
  createdAt: string
  kind: 'purchase' | 'top-up'
  amountCoins: number
  status: 'completed'
  orderId?: string
}

export interface InventoryItem {
  id: string
  productId: string
  name: string
  valueCoins: number
  acquiredAt: string
  status: 'available' | 'withdrawal-pending'
  imageSrc?: string
}

export type SupportCategory =
  | 'Оплата'
  | 'Steam'
  | 'Игровые предметы'
  | 'Возврат'
  | 'Другая проблема'

export interface SupportTicket {
  id: string
  number: string
  createdAt: string
  category: SupportCategory
  email: string
  subject: string
  message: string
  status: 'local-draft'
  orderNumber?: string
}

export interface MarketplaceState {
  version: 1
  balanceCoins: number
  cartProductIds: string[]
  session: Session | null
  steamTradeUrl: string
  orders: MarketplaceOrder[]
  payments: MarketplacePayment[]
  inventory: InventoryItem[]
  supportTickets: SupportTicket[]
  preferences: {
    emailNotifications: boolean
  }
}

export interface MarketplaceUpdateResult {
  state: MarketplaceState
  persisted: boolean
  error?: Error
}

const SEEDED_ORDER: MarketplaceOrder = {
  id: 'seed-order-001',
  number: 'NYXO-240601',
  createdAt: '2026-06-01T12:00:00.000Z',
  items: [
    {
      productId: 'ak47-wild-lotus',
      name: 'AK-47 | Wild Lotus',
      priceCoins: 1_850,
      category: 'CS2',
    },
  ],
  totalCoins: 1_850,
  status: 'completed',
}

const SEEDED_PAYMENT: MarketplacePayment = {
  id: 'seed-payment-001',
  createdAt: SEEDED_ORDER.createdAt,
  kind: 'purchase',
  amountCoins: 1_850,
  status: 'completed',
  orderId: SEEDED_ORDER.id,
}

export function createDefaultMarketplaceState(): MarketplaceState {
  return {
    version: 1,
    balanceCoins: 2_500,
    cartProductIds: [],
    session: null,
    steamTradeUrl: '',
    orders: [{ ...SEEDED_ORDER, items: SEEDED_ORDER.items.map((item) => ({ ...item })) }],
    payments: [{ ...SEEDED_PAYMENT }],
    inventory: [],
    supportTickets: [],
    preferences: { emailNotifications: false },
  }
}

let memoryState = createDefaultMarketplaceState()
let preferMemoryAfterWriteFailure = false

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
}

function hasOptionalString(value: Record<string, unknown>, key: string) {
  return value[key] === undefined || isString(value[key])
}

function isSession(value: unknown): value is Session {
  if (!isRecord(value) || !isString(value.displayName) || !isString(value.createdAt)) return false
  if (value.method === 'steam') return hasOptionalString(value, 'steamId')
  return value.method === 'email' && isString(value.email)
}

function isOrderItem(value: unknown): value is MarketplaceOrderItem {
  return (
    isRecord(value) &&
    isString(value.productId) &&
    isString(value.name) &&
    isNonNegativeInteger(value.priceCoins) &&
    hasOptionalString(value, 'imageSrc') &&
    hasOptionalString(value, 'category')
  )
}

function isOrder(value: unknown): value is MarketplaceOrder {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.number) &&
    isString(value.createdAt) &&
    Array.isArray(value.items) &&
    value.items.length > 0 &&
    value.items.every(isOrderItem) &&
    isNonNegativeInteger(value.totalCoins) &&
    value.status === 'completed'
  )
}

function isPayment(value: unknown): value is MarketplacePayment {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.createdAt) &&
    (value.kind === 'purchase' || value.kind === 'top-up') &&
    isNonNegativeInteger(value.amountCoins) &&
    value.status === 'completed' &&
    hasOptionalString(value, 'orderId')
  )
}

function isInventoryItem(value: unknown): value is InventoryItem {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.productId) &&
    isString(value.name) &&
    isNonNegativeInteger(value.valueCoins) &&
    isString(value.acquiredAt) &&
    (value.status === 'available' || value.status === 'withdrawal-pending') &&
    hasOptionalString(value, 'imageSrc')
  )
}

const SUPPORT_CATEGORIES: SupportCategory[] = [
  'Оплата',
  'Steam',
  'Игровые предметы',
  'Возврат',
  'Другая проблема',
]

function isSupportTicket(value: unknown): value is SupportTicket {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.number) &&
    isString(value.createdAt) &&
    SUPPORT_CATEGORIES.includes(value.category as SupportCategory) &&
    isString(value.email) &&
    isString(value.subject) &&
    isString(value.message) &&
    value.status === 'local-draft' &&
    hasOptionalString(value, 'orderNumber')
  )
}

function validateState(value: unknown): MarketplaceState | null {
  if (!isRecord(value)) return null
  if (
    value.version !== 1 ||
    !isNonNegativeInteger(value.balanceCoins) ||
    !Array.isArray(value.cartProductIds) ||
    !value.cartProductIds.every(isString) ||
    !(value.session === null || isSession(value.session)) ||
    !isString(value.steamTradeUrl) ||
    !Array.isArray(value.orders) ||
    !value.orders.every(isOrder) ||
    !Array.isArray(value.payments) ||
    !value.payments.every(isPayment) ||
    !Array.isArray(value.inventory) ||
    !value.inventory.every(isInventoryItem) ||
    !Array.isArray(value.supportTickets) ||
    !value.supportTickets.every(isSupportTicket) ||
    !isRecord(value.preferences) ||
    typeof value.preferences.emailNotifications !== 'boolean'
  ) {
    return null
  }

  const state = value as unknown as MarketplaceState
  return {
    version: 1,
    balanceCoins: state.balanceCoins,
    cartProductIds: [...new Set(value.cartProductIds)],
    session:
      state.session === null
        ? null
        : state.session.method === 'steam'
          ? {
              method: 'steam',
              displayName: state.session.displayName,
              createdAt: state.session.createdAt,
              ...(state.session.steamId === undefined ? {} : { steamId: state.session.steamId }),
            }
          : {
              method: 'email',
              displayName: state.session.displayName,
              email: state.session.email,
              createdAt: state.session.createdAt,
            },
    steamTradeUrl: state.steamTradeUrl,
    orders: state.orders.map((order) => ({
      id: order.id,
      number: order.number,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        priceCoins: item.priceCoins,
        ...(item.imageSrc === undefined ? {} : { imageSrc: item.imageSrc }),
        ...(item.category === undefined ? {} : { category: item.category }),
      })),
      totalCoins: order.totalCoins,
      status: order.status,
    })),
    payments: state.payments.map((payment) => ({
      id: payment.id,
      createdAt: payment.createdAt,
      kind: payment.kind,
      amountCoins: payment.amountCoins,
      status: payment.status,
      ...(payment.orderId === undefined ? {} : { orderId: payment.orderId }),
    })),
    inventory: state.inventory.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.name,
      valueCoins: item.valueCoins,
      acquiredAt: item.acquiredAt,
      status: item.status,
      ...(item.imageSrc === undefined ? {} : { imageSrc: item.imageSrc }),
    })),
    supportTickets: state.supportTickets.map((ticket) => ({
      id: ticket.id,
      number: ticket.number,
      createdAt: ticket.createdAt,
      category: ticket.category,
      email: ticket.email,
      subject: ticket.subject,
      message: ticket.message,
      status: ticket.status,
      ...(ticket.orderNumber === undefined ? {} : { orderNumber: ticket.orderNumber }),
    })),
    preferences: {
      emailNotifications: state.preferences.emailNotifications,
    },
  }
}

function normalizeState(value: MarketplaceState): MarketplaceState {
  return validateState(value) ?? createDefaultMarketplaceState()
}

function asError(error: unknown) {
  return error instanceof Error ? error : new Error(String(error))
}

export function readMarketplaceState(): MarketplaceState {
  if (preferMemoryAfterWriteFailure) return memoryState

  try {
    const stored = window.localStorage.getItem(MARKETPLACE_STORAGE_KEY)
    if (stored === null) {
      memoryState = createDefaultMarketplaceState()
      return memoryState
    }

    memoryState = validateState(JSON.parse(stored)) ?? createDefaultMarketplaceState()
    return memoryState
  } catch {
    memoryState = createDefaultMarketplaceState()
    return memoryState
  }
}

function persistState(state: MarketplaceState): MarketplaceUpdateResult {
  memoryState = normalizeState(state)

  try {
    const serialized = JSON.stringify(memoryState)
    window.localStorage.setItem(MARKETPLACE_STORAGE_KEY, serialized)
    preferMemoryAfterWriteFailure = false
    return { state: memoryState, persisted: true }
  } catch (error) {
    preferMemoryAfterWriteFailure = true
    return { state: memoryState, persisted: false, error: asError(error) }
  }
}

export function replaceMarketplaceState(state: MarketplaceState): MarketplaceUpdateResult {
  const result = persistState(state)
  window.dispatchEvent(new Event(MARKETPLACE_STATE_EVENT))
  return result
}

export function updateMarketplaceState(
  updater: (state: MarketplaceState) => MarketplaceState,
): MarketplaceUpdateResult {
  const nextState = updater(readMarketplaceState())
  const result = persistState(nextState)
  window.dispatchEvent(new Event(MARKETPLACE_STATE_EVENT))
  return result
}

export function subscribeMarketplaceState(listener: () => void): () => void {
  window.addEventListener(MARKETPLACE_STATE_EVENT, listener)
  return () => window.removeEventListener(MARKETPLACE_STATE_EVENT, listener)
}
