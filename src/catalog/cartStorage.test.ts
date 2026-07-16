import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { addCartProductId } from './cartStorage'

describe('addCartProductId', () => {
  beforeEach(() => window.localStorage.clear())
  afterEach(() => vi.restoreAllMocks())

  it('deduplicates product ids', () => {
    window.localStorage.setItem('nyxo:cart', JSON.stringify(['first', 'first', 'second']))

    expect(addCartProductId('first')).toEqual({ ok: true })
    expect(JSON.parse(window.localStorage.getItem('nyxo:cart') ?? '[]')).toEqual([
      'first',
      'second',
    ])
  })

  it('recovers from malformed stored data', () => {
    window.localStorage.setItem('nyxo:cart', '{broken')

    expect(addCartProductId('fresh')).toEqual({ ok: true })
    expect(JSON.parse(window.localStorage.getItem('nyxo:cart') ?? '[]')).toEqual(['fresh'])
  })

  it('recovers when reading storage throws and still attempts a clean write', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const setItem = vi.spyOn(Storage.prototype, 'setItem')

    expect(addCartProductId('fresh')).toEqual({ ok: true })
    expect(setItem).toHaveBeenCalledWith('nyxo:cart', JSON.stringify(['fresh']))
  })

  it('returns a failure instead of throwing when writing storage fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })

    expect(addCartProductId('fresh')).toEqual({ ok: false })
  })
})
