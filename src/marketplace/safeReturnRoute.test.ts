import { describe, expect, it } from 'vitest'

import { safeReturnRoute } from './safeReturnRoute'

describe('safeReturnRoute', () => {
  it.each([
    '/',
    '/catalog',
    '/catalog/ak47-wild-lotus',
    '/cart',
    '/balance/top-up?returnTo=%2Fcart&needed=500',
    '/auth?returnTo=%2Fcart&required=steam',
    '/account',
    '/account/purchases',
    '/account/payments',
    '/account/steam',
    '/account/settings',
    '/inventory',
    '/support',
    '/legal/privacy',
    '/legal/terms',
    '/legal/refunds',
    '/legal/fair-play',
  ])('accepts the known internal route %s', (value) => {
    expect(safeReturnRoute(value, '/cart')).toBe(value)
  })

  it.each([
    'https://example.com/cart',
    'javascript:alert(1)',
    '//example.com/cart',
    '/unknown',
    '/catalog/item/extra',
    '',
    null,
    undefined,
  ])('returns the fallback for unsafe or unknown value %s', (value) => {
    expect(safeReturnRoute(value, '/cart')).toBe('/cart')
  })

  it('sanitizes an unsafe fallback to Home', () => {
    expect(safeReturnRoute('//example.com', 'https://example.com')).toBe('/')
  })
})
