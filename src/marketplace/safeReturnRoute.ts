import { parseAppRoute } from '../router/useAppRoute'

function isKnownInternalRoute(value: string): boolean {
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\') || value.includes('#')) {
    return false
  }

  try {
    const url = new URL(value, 'https://nyxo.local')
    if (url.origin !== 'https://nyxo.local') return false
    return parseAppRoute(url.pathname).name !== 'not-found'
  } catch {
    return false
  }
}

export function safeReturnRoute(value: unknown, fallback: string): string {
  if (typeof value === 'string' && isKnownInternalRoute(value)) return value
  return isKnownInternalRoute(fallback) ? fallback : '/'
}
