import type {
  MarketplaceState,
  SupportCategory,
  SupportTicket,
} from './marketplaceStore'

export const SUPPORT_CATEGORIES = [
  'Оплата',
  'Steam',
  'Игровые предметы',
  'Возврат',
  'Другая проблема',
] as const satisfies readonly SupportCategory[]

const ORDER_NUMBER_CATEGORIES: readonly SupportCategory[] = ['Оплата', 'Возврат']

export interface SupportTicketInput {
  category: SupportCategory
  email: string
  subject: string
  message: string
  orderNumber?: string
}

export type SupportTicketErrors = Partial<Record<keyof SupportTicketInput, string>>

export interface CreateSupportTicketOptions {
  now?: () => string
  createId?: () => string
}

export interface CreateSupportTicketResult {
  state: MarketplaceState
  ticket: SupportTicket
}

export class SupportTicketValidationError extends Error {
  readonly errors: SupportTicketErrors

  constructor(errors: SupportTicketErrors) {
    super('Проверьте обязательные поля обращения.')
    this.name = 'SupportTicketValidationError'
    this.errors = errors
  }
}

export function categoryRequiresOrderNumber(category: SupportCategory) {
  return ORDER_NUMBER_CATEGORIES.includes(category)
}

export function validateSupportTicket(input: SupportTicketInput): SupportTicketErrors {
  const errors: SupportTicketErrors = {}
  const email = input.email.trim()

  if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Укажите корректный email.'
  if (input.subject.trim() === '') errors.subject = 'Укажите тему обращения.'
  if (input.message.trim() === '') errors.message = 'Опишите проблему.'
  if (categoryRequiresOrderNumber(input.category) && !input.orderNumber?.trim()) {
    errors.orderNumber = 'Укажите номер заказа.'
  }

  return errors
}

function ticketNumber(createdAt: string, sequence: number) {
  const date = new Date(createdAt)
  const year = String(date.getUTCFullYear()).slice(-2)
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `NYXO-SUP-${year}${month}${day}-${String(sequence).padStart(4, '0')}`
}

export function createSupportTicket(
  state: MarketplaceState,
  input: SupportTicketInput,
  options: CreateSupportTicketOptions = {},
): CreateSupportTicketResult {
  const errors = validateSupportTicket(input)
  if (Object.keys(errors).length > 0) throw new SupportTicketValidationError(errors)

  const createdAt = options.now?.() ?? new Date().toISOString()
  const sequence = state.supportTickets.length + 1
  const compactTimestamp = createdAt.replace(/\D/g, '').slice(0, 17)
  const orderNumber = input.orderNumber?.trim()
  const ticket: SupportTicket = {
    id: options.createId?.() ?? `support-${compactTimestamp}-${sequence}`,
    number: ticketNumber(createdAt, sequence),
    createdAt,
    category: input.category,
    email: input.email.trim(),
    subject: input.subject.trim(),
    message: input.message.trim(),
    status: 'local-draft',
    ...(orderNumber ? { orderNumber } : {}),
  }

  return {
    ticket,
    state: {
      ...state,
      supportTickets: [...state.supportTickets, ticket],
    },
  }
}
