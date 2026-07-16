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
      setError('Не удалось сохранить Trade URL. Попробуйте ещё раз.')
      return
    }
    setTradeUrl(result.state.steamTradeUrl)
    setNotice('Trade URL сохранён.')
  }

  return (
    <section className="account-view" aria-labelledby="account-steam-title">
      <header className="account-view__heading">
        <p className="eyebrow">ACCOUNT / STEAM</p>
        <h1 id="account-steam-title">Steam</h1>
        <p>Способ входа и адрес для передачи предметов.</p>
      </header>

      {error && <p className="account-feedback account-feedback--error" role="alert">{error}</p>}
      {notice && <p className="account-feedback" role="status">{notice}</p>}

      <div className="account-steam-grid">
        <section className="account-panel" aria-labelledby="steam-connection-title">
          <p className="eyebrow">CONNECTION / STEAM</p>
          <h2 id="steam-connection-title">
            {steamSession ? 'Steam выбран' : 'Steam не выбран'}
          </h2>
          {steamSession ? (
            <>
              <strong>{steamSession.displayName}</strong>
              <p>Способ входа Steam сохранён.</p>
            </>
          ) : (
            <>
              <p>Выберите Steam, чтобы подготовить передачу купленных скинов.</p>
              <a className="nyxo-action" href="/auth?returnTo=%2Faccount%2Fsteam&required=steam">
                Продолжить со Steam
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
          <small>Используется для получения купленных предметов в Steam.</small>
          <button className="nyxo-action" type="submit">Сохранить Trade URL</button>
        </form>
      </div>
    </section>
  )
}
