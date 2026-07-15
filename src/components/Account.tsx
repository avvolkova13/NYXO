import { useState } from 'react'

import { PixelHeading } from './PixelHeading'

export function Account() {
  const [steamUrl, setSteamUrl] = useState('')
  const [saved, setSaved] = useState(false)
  const [inventoryNotice, setInventoryNotice] = useState('')

  return (
    <section className="account content-section" id="account" aria-labelledby="account-title">
      <div className="account__panel station-panel">
        <div className="account__header">
          <div>
            <PixelHeading as="h2" id="account-title">Личный кабинет</PixelHeading>
            <p>История покупок, сделки и инвентарь в одном месте.</p>
          </div>
          <a className="nyxo-action" href="#account-login"><span className="status-lamp" aria-hidden="true" />Войти через Steam</a>
        </div>
        <div className="account__grid">
          <article className="account-module" id="account-login">
            <span className="account-module__label">Баланс</span>
            <strong>0 COINS</strong>
            <a href="#checkout">Пополнить счёт →</a>
          </article>
          <article className="account-module" id="account-history">
            <span className="account-module__label">Покупки</span>
            <strong>История заказов</strong>
            <a href="#account-history">Открыть историю →</a>
          </article>
          <article className="account-module" id="account-inventory">
            <span className="account-module__label">Инвентарь</span>
            <strong>0 предметов</strong>
            <a href="#trade-url">Настроить вывод →</a>
            <div className="account-module__actions">
              <button type="button" onClick={() => setInventoryNotice('Оценка предмета станет доступна после синхронизации Steam-инвентаря.')}>Продать сайту за COINS</button>
              <button type="button" onClick={() => setInventoryNotice('Добавьте Steam Trade URL, чтобы открыть вывод предметов.')}>Вывести в Steam</button>
            </div>
            {inventoryNotice && <small>{inventoryNotice}</small>}
          </article>
        </div>
        <form className="trade-url" id="trade-url" onSubmit={(event) => { event.preventDefault(); setSaved(Boolean(steamUrl.trim())) }}>
          <label htmlFor="steam-trade-url">Steam Trade URL</label>
          <div>
            <input id="steam-trade-url" type="url" value={steamUrl} onChange={(event) => setSteamUrl(event.target.value)} placeholder="https://steamcommunity.com/tradeoffer/new/?partner=..." required />
            <button className="nyxo-action" type="submit">{saved ? 'Сохранено' : 'Сохранить URL'}</button>
          </div>
          <small>Без Trade URL вывод купленных предметов в Steam недоступен.</small>
        </form>
      </div>
    </section>
  )
}
