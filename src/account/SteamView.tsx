import { useState } from 'react'

import {
  replaceMarketplaceState,
  updateMarketplaceState,
  type MarketplaceState,
} from '../marketplace/marketplaceStore'

export function SteamView({ state }: { state: MarketplaceState }) {
  const [tradeUrl, setTradeUrl] = useState(state.steamTradeUrl)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const steamSession = state.session?.method === 'steam' ? state.session : null

  const saveTradeUrl = () => {
    setNotice('')
    setError('')
    const previous: { state: MarketplaceState | null } = { state: null }
    const result = updateMarketplaceState((current) => {
      previous.state = current
      return { ...current, steamTradeUrl: tradeUrl.trim() }
    })

    if (!result.persisted) {
      if (previous.state) replaceMarketplaceState(previous.state)
      setError('Не удалось сохранить Trade URL. Проверьте хранилище браузера.')
      return
    }
    setTradeUrl(result.state.steamTradeUrl)
    setNotice('Trade URL сохранён локально.')
  }

  return (
    <section className="account-view" aria-labelledby="account-steam-title">
      <header className="account-view__heading">
        <p className="eyebrow">ACCOUNT / STEAM</p>
        <h1 id="account-steam-title">Steam</h1>
        <p>Состояние локального подключения и адрес для будущей передачи предметов.</p>
      </header>

      {error && <p className="account-feedback account-feedback--error" role="alert">{error}</p>}
      {notice && <p className="account-feedback" role="status">{notice}</p>}

      <div className="account-steam-grid">
        <section className="account-panel" aria-labelledby="steam-connection-title">
          <p className="eyebrow">CONNECTION / LOCAL</p>
          <h2 id="steam-connection-title">
            {steamSession ? 'Steam подключён' : 'Steam не подключён'}
          </h2>
          {steamSession ? (
            <>
              <strong>{steamSession.displayName}</strong>
              <p>Локальная демонстрационная сессия активна.</p>
            </>
          ) : (
            <>
              <p>Подключите Steam, чтобы подготовить передачу купленных скинов.</p>
              <a className="nyxo-action" href="/auth?returnTo=%2Faccount%2Fsteam&required=steam">
                Войти через Steam
              </a>
            </>
          )}
        </section>

        <form className="account-panel account-trade-form" onSubmit={(event) => {
          event.preventDefault()
          saveTradeUrl()
        }}>
          <label htmlFor="account-steam-trade-url">Steam Trade URL</label>
          <input
            id="account-steam-trade-url"
            type="url"
            value={tradeUrl}
            onChange={(event) => setTradeUrl(event.target.value)}
            placeholder="https://steamcommunity.com/tradeoffer/new/..."
            autoComplete="url"
          />
          <small>URL сохраняется только в этом браузере. Реальная передача не выполняется.</small>
          <button className="nyxo-action" type="submit">Сохранить Trade URL</button>
        </form>
      </div>
    </section>
  )
}
