import { useState } from 'react'

import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import {
  replaceMarketplaceState,
  updateMarketplaceState,
  type MarketplaceState,
} from '../marketplace/marketplaceStore'
import { safeReturnRoute } from '../marketplace/safeReturnRoute'
import {
  createEmailSession,
  createSteamSession,
  isValidEmailAddress,
  logoutSession,
} from '../marketplace/session'
import { useMarketplaceState } from '../marketplace/useMarketplaceState'
import { navigate } from '../router/useAppRoute'

type AuthMode = 'steam' | 'email'

export function AuthPage() {
  const state = useMarketplaceState()
  const search = new URLSearchParams(window.location.search)
  const returnTo = safeReturnRoute(search.get('returnTo'), '/account')
  const steamRequired = search.get('required') === 'steam'
  const [mode, setMode] = useState<AuthMode>('steam')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const persistSession = (updater: (current: MarketplaceState) => MarketplaceState) => {
    const previous: { state: MarketplaceState | null } = { state: null }
    const result = updateMarketplaceState((current) => {
      previous.state = current
      return updater(current)
    })

    if (!result.persisted) {
      if (previous.state) replaceMarketplaceState(previous.state)
      setError('Не удалось сохранить вход. Попробуйте ещё раз.')
      return
    }

    navigate(returnTo)
  }

  const connectSteam = () => {
    setError('')
    persistSession(createSteamSession)
  }

  const connectEmail = () => {
    setError('')
    if (!isValidEmailAddress(email)) {
      setError('Введите корректный email.')
      return
    }
    persistSession((current) => createEmailSession(current, email))
  }

  const logout = () => {
    setError('')
    const previous: { state: MarketplaceState | null } = { state: null }
    const result = updateMarketplaceState((current) => {
      previous.state = current
      return logoutSession(current)
    })
    if (!result.persisted) {
      if (previous.state) replaceMarketplaceState(previous.state)
      setError('Не удалось сохранить выход. Попробуйте ещё раз.')
    }
  }

  return (
    <div className="auth-page">
      <Header />
      <main className="auth-page__main">
        <header className="auth-page__intro">
          <p className="eyebrow">NYXO / ACCESS</p>
          <h1>Вход в NYXO</h1>
          <p>Выберите способ входа для продолжения.</p>
        </header>

        {steamRequired && (
          <p className="auth-page__required" role="status">
            Для передачи скина нужен вход через Steam.
          </p>
        )}
        {error && <p className="auth-page__error" role="alert">{error}</p>}

        {state.session ? (
          <section className="auth-session" aria-labelledby="auth-session-title">
            <p className="eyebrow">SESSION / ACTIVE</p>
            <h2 id="auth-session-title">Вы вошли</h2>
            <strong>{state.session.displayName}</strong>
            <p>
              {state.session.method === 'steam'
                ? 'Сессия Steam активна.'
                : 'Сессия email активна. Для передачи скинов всё ещё нужен Steam.'}
            </p>
            <div className="auth-session__actions">
              {steamRequired && state.session.method === 'email' ? (
                <button className="nyxo-action" type="button" onClick={connectSteam}>
                  Войти через Steam
                </button>
              ) : (
                <a className="nyxo-action" href={returnTo}>Продолжить</a>
              )}
              <button type="button" onClick={logout}>Выйти</button>
            </div>
          </section>
        ) : (
          <section className="auth-console" aria-labelledby="auth-console-title">
            <div className="auth-console__modes" aria-label="Способ входа">
              <button
                type="button"
                aria-pressed={mode === 'steam'}
                onClick={() => { setMode('steam'); setError('') }}
              >
                Steam
              </button>
              <button
                type="button"
                aria-pressed={mode === 'email'}
                onClick={() => { setMode('email'); setError('') }}
              >
                Email
              </button>
            </div>

            <div className="auth-console__panel">
              {mode === 'steam' ? (
                <>
                  <p className="eyebrow">STEAM / ACCESS</p>
                  <h2 id="auth-console-title">Подключить Steam</h2>
                  <p>
                    Используйте Steam для покупок и передачи игровых предметов.
                  </p>
                  <button className="nyxo-action" type="button" onClick={connectSteam}>
                    Войти через Steam
                  </button>
                </>
              ) : (
                <form onSubmit={(event) => { event.preventDefault(); connectEmail() }} noValidate>
                  <p className="eyebrow">EMAIL / ACCESS</p>
                  <h2 id="auth-console-title">Войти по email</h2>
                  <p>
                    Используйте email для быстрого доступа к аккаунту NYXO.
                  </p>
                  {steamRequired && (
                    <p className="auth-console__steam-note">
                      Email-вход не заменяет Steam-сессию, необходимую для передачи скина.
                    </p>
                  )}
                  <label>
                    <span>Email</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      aria-invalid={Boolean(error)}
                      autoComplete="email"
                    />
                  </label>
                  <button className="nyxo-action" type="submit">Продолжить с email</button>
                </form>
              )}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}
