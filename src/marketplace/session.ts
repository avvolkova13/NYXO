import type { MarketplaceState, Session } from './marketplaceStore'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function isValidEmailAddress(email: string): boolean {
  return EMAIL_PATTERN.test(normalizeEmail(email))
}

export function createSteamSession(
  state: MarketplaceState,
  createdAt = new Date().toISOString(),
): MarketplaceState {
  return {
    ...state,
    session: {
      method: 'steam',
      displayName: 'Игрок NYXO',
      createdAt,
    },
  }
}

export function createEmailSession(
  state: MarketplaceState,
  email: string,
  createdAt = new Date().toISOString(),
): MarketplaceState {
  const normalizedEmail = normalizeEmail(email)
  if (!isValidEmailAddress(normalizedEmail)) throw new Error('Введите корректный email.')

  return {
    ...state,
    session: {
      method: 'email',
      displayName: normalizedEmail,
      email: normalizedEmail,
      createdAt,
    },
  }
}

export function hasSteamSession(session: Session | null): boolean {
  return session?.method === 'steam'
}

export function logoutSession(state: MarketplaceState): MarketplaceState {
  return { ...state, session: null }
}
