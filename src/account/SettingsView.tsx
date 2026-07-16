import { useState } from 'react'

import {
  replaceMarketplaceState,
  updateMarketplaceState,
  type MarketplaceState,
} from '../marketplace/marketplaceStore'
import { logoutSession } from '../marketplace/session'

export function SettingsView({ state }: { state: MarketplaceState }) {
  const [emailNotifications, setEmailNotifications] = useState(
    state.preferences.emailNotifications,
  )
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const persist = (
    updater: (current: MarketplaceState) => MarketplaceState,
    success: string,
  ) => {
    setNotice('')
    setError('')
    const previous: { state: MarketplaceState | null } = { state: null }
    const result = updateMarketplaceState((current) => {
      previous.state = current
      return updater(current)
    })

    if (!result.persisted) {
      if (previous.state) replaceMarketplaceState(previous.state)
      setError('Не удалось сохранить изменения. Проверьте хранилище браузера.')
      return
    }
    setNotice(success)
  }

  return (
    <section className="account-view" aria-labelledby="account-settings-title">
      <header className="account-view__heading">
        <p className="eyebrow">ACCOUNT / LOCAL</p>
        <h1 id="account-settings-title">Настройки</h1>
        <p>Параметры действуют только в этом браузере.</p>
      </header>

      {error && <p className="account-feedback account-feedback--error" role="alert">{error}</p>}
      {notice && <p className="account-feedback" role="status">{notice}</p>}

      <div className="account-settings-grid">
        <form className="account-panel account-settings-form" onSubmit={(event) => {
          event.preventDefault()
          persist(
            (current) => ({
              ...current,
              preferences: { ...current.preferences, emailNotifications },
            }),
            'Настройки сохранены локально.',
          )
        }}>
          <h2>Уведомления</h2>
          <label>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(event) => setEmailNotifications(event.target.checked)}
            />
            <span>Получать уведомления по email</span>
          </label>
          <small>Отправка писем пока не подключена; сохраняется только предпочтение.</small>
          <button className="nyxo-action" type="submit">Сохранить настройки</button>
        </form>

        <section className="account-panel account-session-panel" aria-labelledby="settings-session-title">
          <h2 id="settings-session-title">Локальная сессия</h2>
          {state.session ? (
            <>
              <strong>{state.session.displayName}</strong>
              <p>{state.session.method === 'steam' ? 'Steam' : 'Email'} · активна в этом браузере</p>
              <button
                type="button"
                onClick={() => persist(logoutSession, 'Вы вышли из локального аккаунта.')}
              >
                Выйти из аккаунта
              </button>
            </>
          ) : (
            <>
              <p>Активной сессии нет.</p>
              <a className="nyxo-action" href="/auth?returnTo=%2Faccount%2Fsettings">Войти</a>
            </>
          )}
        </section>
      </div>
    </section>
  )
}
