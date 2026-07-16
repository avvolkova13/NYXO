import { describe, expect, it } from 'vitest'

import { createDefaultMarketplaceState } from './marketplaceStore'
import {
  createEmailSession,
  createSteamSession,
  hasSteamSession,
  isValidEmailAddress,
  logoutSession,
} from './session'

const createdAt = '2026-07-16T10:00:00.000Z'

describe('marketplace session actions', () => {
  it('creates the honest local Steam session required for skin delivery', () => {
    const next = createSteamSession(createDefaultMarketplaceState(), createdAt)

    expect(next.session).toEqual({
      method: 'steam',
      displayName: 'Игрок NYXO',
      createdAt,
    })
    expect(hasSteamSession(next.session)).toBe(true)
  })

  it.each(['player@example.com', ' PLAYER+NYXO@Example.COM '])(
    'accepts and normalizes the syntactically valid address %s',
    (email) => {
      expect(isValidEmailAddress(email)).toBe(true)
      const next = createEmailSession(createDefaultMarketplaceState(), email, createdAt)
      const normalizedEmail = email.trim().toLowerCase()

      expect(next.session).toEqual({
        method: 'email',
        displayName: normalizedEmail,
        email: normalizedEmail,
        createdAt,
      })
      expect(hasSteamSession(next.session)).toBe(false)
    },
  )

  it.each(['', 'player', 'player@', '@example.com', 'player @example.com']) (
    'rejects the invalid email address %s',
    (email) => {
      expect(isValidEmailAddress(email)).toBe(false)
      expect(() => createEmailSession(createDefaultMarketplaceState(), email, createdAt)).toThrow(
        'Введите корректный email',
      )
    },
  )

  it('logs out without changing the rest of marketplace state', () => {
    const signedIn = createSteamSession(
      { ...createDefaultMarketplaceState(), balanceCoins: 9_000, cartProductIds: ['skin'] },
      createdAt,
    )

    expect(logoutSession(signedIn)).toEqual({ ...signedIn, session: null })
  })
})
