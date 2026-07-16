import { describe, expect, it } from 'vitest'

import { createDefaultMarketplaceState } from './marketplaceStore'
import {
  createSupportTicket,
  SUPPORT_CATEGORIES,
  validateSupportTicket,
} from './support'

describe('support tickets', () => {
  it('exposes the five supported request categories in their product order', () => {
    expect(SUPPORT_CATEGORIES).toEqual([
      'Оплата',
      'Steam',
      'Игровые предметы',
      'Возврат',
      'Другая проблема',
    ])
  })

  it('requires an email, subject, message, and a valid email address', () => {
    expect(validateSupportTicket({
      category: 'Steam',
      email: '',
      subject: '',
      message: '',
    })).toEqual({
      email: 'Укажите корректный email.',
      subject: 'Укажите тему обращения.',
      message: 'Опишите проблему.',
    })

    expect(validateSupportTicket({
      category: 'Steam',
      email: 'not-an-email',
      subject: 'Не входит в Steam',
      message: 'Код подтверждения не приходит.',
    })).toEqual({ email: 'Укажите корректный email.' })
  })

  it.each(['Оплата', 'Возврат'] as const)('requires an order number for %s requests', (category) => {
    expect(validateSupportTicket({
      category,
      email: 'buyer@example.com',
      subject: 'Нужна проверка заказа',
      message: 'Пожалуйста, проверьте операцию.',
      orderNumber: '   ',
    })).toEqual({ orderNumber: 'Укажите номер заказа.' })
  })

  it('creates locally accepted tickets with unique public numbers', () => {
    const initial = createDefaultMarketplaceState()
    const first = createSupportTicket(initial, {
      category: 'Steam',
      email: ' buyer@example.com ',
      subject: ' Не приходит код ',
      message: ' Не могу завершить вход. ',
    }, {
      now: () => '2026-07-16T10:20:30.000Z',
      createId: () => 'support-1',
    })
    const second = createSupportTicket(first.state, {
      category: 'Другая проблема',
      email: 'buyer@example.com',
      subject: 'Другой вопрос',
      message: 'Описание другого вопроса.',
    }, {
      now: () => '2026-07-16T10:20:30.000Z',
      createId: () => 'support-2',
    })

    expect(first.ticket).toMatchObject({
      id: 'support-1',
      number: 'NYXO-SUP-260716-0001',
      category: 'Steam',
      email: 'buyer@example.com',
      subject: 'Не приходит код',
      message: 'Не могу завершить вход.',
      status: 'local-draft',
    })
    expect(second.ticket.number).toBe('NYXO-SUP-260716-0002')
    expect(second.state.supportTickets).toHaveLength(2)
    expect(second.ticket.number).not.toBe(first.ticket.number)
  })
})
