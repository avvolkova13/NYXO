import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createDefaultMarketplaceState,
  readMarketplaceState,
  replaceMarketplaceState,
} from '../marketplace/marketplaceStore'
import { AuthPage } from './AuthPage'

describe('AuthPage', () => {
  beforeEach(() => {
    localStorage.clear()
    replaceMarketplaceState(createDefaultMarketplaceState())
    window.history.replaceState({}, '', '/auth')
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
  })

  afterEach(() => vi.restoreAllMocks())

  it('switches between Steam and email modes with an honest local-demo explanation', async () => {
    const user = userEvent.setup()
    render(<AuthPage />)

    expect(screen.getByRole('heading', { level: 1, name: 'Вход в NYXO' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Steam' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(/локальная демонстрация.*API Steam/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Email' }))

    expect(screen.getByRole('button', { name: 'Email' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument()
    expect(screen.getByText(/локальная демонстрация.*API авторизации/i)).toBeInTheDocument()
  })

  it('validates email before creating a local email session', async () => {
    const user = userEvent.setup()
    render(<AuthPage />)
    await user.click(screen.getByRole('button', { name: 'Email' }))

    await user.type(screen.getByRole('textbox', { name: 'Email' }), 'not-an-email')
    await user.click(screen.getByRole('button', { name: 'Продолжить с email' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Введите корректный email')
    expect(readMarketplaceState().session).toBeNull()
  })

  it('creates a Steam mock connection and returns to a safe internal route', async () => {
    window.history.replaceState({}, '', '/auth?returnTo=%2Fcart&required=steam')
    const user = userEvent.setup()
    render(<AuthPage />)

    expect(screen.getByRole('status')).toHaveTextContent('Для передачи скина нужен вход через Steam')
    await user.click(screen.getByRole('button', { name: 'Войти через Steam' }))

    expect(readMarketplaceState().session).toMatchObject({
      method: 'steam',
      displayName: 'Игрок NYXO',
    })
    expect(window.location.pathname).toBe('/cart')
  })

  it('does not allow an external returnTo destination', async () => {
    window.history.replaceState(
      {},
      '',
      `/auth?returnTo=${encodeURIComponent('https://evil.example/steal')}`,
    )
    const user = userEvent.setup()
    render(<AuthPage />)

    await user.click(screen.getByRole('button', { name: 'Войти через Steam' }))

    expect(window.location.pathname).toBe('/account')
    expect(window.location.origin).not.toBe('https://evil.example')
  })

  it('explains that email authorization does not satisfy required Steam delivery', async () => {
    window.history.replaceState({}, '', '/auth?returnTo=%2Fcart&required=steam')
    const user = userEvent.setup()
    render(<AuthPage />)

    await user.click(screen.getByRole('button', { name: 'Email' }))
    expect(screen.getByText(/Email-вход не заменяет Steam-сессию/i)).toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: 'Email' }), 'player@example.com')
    await user.click(screen.getByRole('button', { name: 'Продолжить с email' }))

    expect(readMarketplaceState().session).toMatchObject({
      method: 'email',
      email: 'player@example.com',
    })
    expect(window.location.pathname).toBe('/cart')
  })

  it('logs out an existing local session', async () => {
    replaceMarketplaceState({
      ...createDefaultMarketplaceState(),
      session: {
        method: 'steam',
        displayName: 'Игрок NYXO',
        createdAt: '2026-07-16T10:00:00.000Z',
      },
    })
    const user = userEvent.setup()
    render(<AuthPage />)

    expect(screen.getByText('Игрок NYXO')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Выйти' }))

    expect(readMarketplaceState().session).toBeNull()
    expect(screen.getByRole('button', { name: 'Войти через Steam' })).toBeInTheDocument()
  })

  it('keeps the existing session visible when logout cannot be persisted', async () => {
    replaceMarketplaceState({
      ...createDefaultMarketplaceState(),
      session: {
        method: 'steam',
        displayName: 'Игрок NYXO',
        createdAt: '2026-07-16T10:00:00.000Z',
      },
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota exceeded')
    })
    const user = userEvent.setup()
    render(<AuthPage />)

    await user.click(screen.getByRole('button', { name: 'Выйти' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Не удалось сохранить выход')
    expect(screen.getByText('Игрок NYXO')).toBeInTheDocument()
    expect(readMarketplaceState().session).toMatchObject({ method: 'steam' })
  })

  it('lets an email session upgrade directly when Steam is required', async () => {
    replaceMarketplaceState({
      ...createDefaultMarketplaceState(),
      session: {
        method: 'email',
        displayName: 'player@example.com',
        email: 'player@example.com',
        createdAt: '2026-07-16T10:00:00.000Z',
      },
    })
    window.history.replaceState({}, '', '/auth?returnTo=%2Fcart&required=steam')
    const user = userEvent.setup()
    render(<AuthPage />)

    await user.click(screen.getByRole('button', { name: 'Войти через Steam' }))

    expect(readMarketplaceState().session).toMatchObject({
      method: 'steam',
      displayName: 'Игрок NYXO',
    })
    expect(window.location.pathname).toBe('/cart')
  })
})
