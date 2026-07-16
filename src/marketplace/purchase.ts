import type { Product } from '../types/product'
import type { MarketplaceOrder, MarketplaceState } from './marketplaceStore'

export interface CalculatedCart {
  items: Product[]
  subtotalCoins: number
  hasSkin: boolean
}

export type PurchaseResult =
  | {
      status: 'empty' | 'steam-required'
      state: MarketplaceState
      subtotalCoins: number
    }
  | {
      status: 'insufficient'
      state: MarketplaceState
      subtotalCoins: number
      shortageCoins: number
    }
  | {
      status: 'success'
      state: MarketplaceState
      subtotalCoins: number
      order: MarketplaceOrder
    }

export interface PurchaseOptions {
  now?: () => string
  createId?: (kind: string) => string
}

export function calculateCart(products: Product[], ids: string[]): CalculatedCart {
  const productsById = new Map(products.map((product) => [product.id, product]))
  const items = [...new Set(ids)].flatMap((id) => {
    const product = productsById.get(id)
    return product ? [product] : []
  })

  return {
    items,
    subtotalCoins: items.reduce((total, product) => total + Math.round(product.price), 0),
    hasSkin: items.some((product) => product.kind === 'skin'),
  }
}

function defaultId(kind: string, createdAt: string, sequence: number) {
  const timestamp = createdAt.replace(/\D/g, '').slice(0, 17)
  return `${kind}-${timestamp}-${sequence}`
}

function orderNumber(createdAt: string, sequence: number) {
  const date = new Date(createdAt)
  const year = String(date.getUTCFullYear()).slice(-2)
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `NYXO-${year}${month}${day}-${String(sequence).padStart(4, '0')}`
}

export function completePurchase(
  state: MarketplaceState,
  products: Product[],
  options: PurchaseOptions = {},
): PurchaseResult {
  const cart = calculateCart(products, state.cartProductIds)
  if (cart.items.length === 0) {
    return { status: 'empty', state, subtotalCoins: 0 }
  }

  if (state.balanceCoins < cart.subtotalCoins) {
    return {
      status: 'insufficient',
      state,
      subtotalCoins: cart.subtotalCoins,
      shortageCoins: cart.subtotalCoins - state.balanceCoins,
    }
  }

  if (cart.hasSkin && state.session?.method !== 'steam') {
    return { status: 'steam-required', state, subtotalCoins: cart.subtotalCoins }
  }

  const createdAt = options.now?.() ?? new Date().toISOString()
  const sequence = state.orders.length + 1
  const createId = options.createId
    ?? ((kind: string) => defaultId(kind, createdAt, sequence))
  const order: MarketplaceOrder = {
    id: createId('order'),
    number: orderNumber(createdAt, sequence),
    createdAt,
    items: cart.items.map((product) => ({
      productId: product.id,
      name: product.name,
      priceCoins: Math.round(product.price),
      imageSrc: product.imageUrl,
      category: product.category,
    })),
    totalCoins: cart.subtotalCoins,
    status: 'completed',
  }
  const inventory = cart.items
    .filter((product) => product.kind === 'skin')
    .map((product, index) => ({
      id: createId(`inventory-${index}`),
      productId: product.id,
      name: product.name,
      valueCoins: Math.round(product.price),
      acquiredAt: createdAt,
      status: 'available' as const,
      imageSrc: product.imageUrl,
    }))
  const nextState: MarketplaceState = {
    ...state,
    balanceCoins: state.balanceCoins - cart.subtotalCoins,
    cartProductIds: [],
    orders: [...state.orders, order],
    payments: [
      ...state.payments,
      {
        id: createId('payment'),
        createdAt,
        kind: 'purchase',
        amountCoins: cart.subtotalCoins,
        status: 'completed',
        orderId: order.id,
      },
    ],
    inventory: [...state.inventory, ...inventory],
  }

  return { status: 'success', state: nextState, subtotalCoins: cart.subtotalCoins, order }
}
