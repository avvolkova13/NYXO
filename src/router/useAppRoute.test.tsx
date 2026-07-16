import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { navigate, parseAppRoute, useAppRoute } from './useAppRoute'

describe('parseAppRoute', () => {
  it.each([
    ['/', { name: 'home' }],
    ['/catalog', { name: 'catalog' }],
    ['/catalog/ak47-wild-lotus', { name: 'product', slug: 'ak47-wild-lotus' }],
    ['/product/ak47-wild-lotus', { name: 'product', slug: 'ak47-wild-lotus' }],
  ] as const)('parses %s', (pathname, route) => {
    expect(parseAppRoute(pathname)).toEqual(route)
  })

  it('decodes product slugs and treats unknown paths as Home', () => {
    expect(parseAppRoute('/catalog/a%20skin')).toEqual({ name: 'product', slug: 'a skin' })
    expect(parseAppRoute('/something-else')).toEqual({ name: 'home' })
  })
})

describe('useAppRoute', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/')
    vi.restoreAllMocks()
  })

  it('initializes from the current URL and responds to back-forward navigation', () => {
    window.history.replaceState({}, '', '/catalog')
    const { result } = renderHook(() => useAppRoute())

    expect(result.current).toEqual({ name: 'catalog' })

    act(() => {
      window.history.replaceState({}, '', '/catalog/ak47-wild-lotus')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    expect(result.current).toEqual({ name: 'product', slug: 'ak47-wild-lotus' })
  })

  it('navigates without failing when scrollTo is unavailable', () => {
    const originalScrollTo = window.scrollTo
    Object.defineProperty(window, 'scrollTo', { configurable: true, value: undefined })

    expect(() => navigate('/catalog')).not.toThrow()
    expect(window.location.pathname).toBe('/catalog')

    Object.defineProperty(window, 'scrollTo', { configurable: true, value: originalScrollTo })
  })
})
