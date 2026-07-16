import { useState } from 'react'

import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import {
  requestInventoryWithdrawal,
  saveSteamTradeUrl,
  type InventoryActionFailure,
} from '../marketplace/inventory'
import type { InventoryItem } from '../marketplace/marketplaceStore'
import { useMarketplaceState } from '../marketplace/useMarketplaceState'

const formatCoins = (value: number) => `${value.toLocaleString('ru-RU')} COINS`

const actionErrors: Record<InventoryActionFailure, string> = {
  'invalid-trade-url': 'Укажите корректный Steam Trade URL с параметрами partner и token.',
  'missing-trade-url': 'Укажите Steam Trade URL перед выводом предмета.',
  'item-not-found': 'Предмет больше не найден в локальном инвентаре.',
  'item-unavailable': 'Этот предмет уже ожидает подтверждения вывода.',
  'storage-error': 'Не удалось сохранить изменение в этом браузере.',
}

function InventoryCard({
  item,
  onWithdraw,
}: {
  item: InventoryItem
  onWithdraw: (item: InventoryItem) => void
}) {
  const pending = item.status === 'withdrawal-pending'

  return (
    <article className="inventory-card" data-testid="inventory-item">
      <div className="inventory-card__media">
        {item.imageSrc ? (
          <img src={item.imageSrc} alt={item.name} />
        ) : (
          <span aria-hidden="true">NYXO / ITEM</span>
        )}
      </div>
      <div className="inventory-card__body">
        <span className={`inventory-card__status${pending ? ' inventory-card__status--pending' : ''}`}>
          {pending ? 'Вывод ожидает подтверждения' : 'Доступен'}
        </span>
        <h2>{item.name}</h2>
        <strong className="inventory-card__value">{formatCoins(item.valueCoins)}</strong>
        <div className="inventory-card__actions">
          <button
            className="nyxo-action"
            type="button"
            disabled={pending}
            aria-label={
              pending
                ? `Вывод ${item.name} ожидает подтверждения`
                : `Вывести ${item.name}`
            }
            onClick={() => onWithdraw(item)}
          >
            {pending ? 'Вывод запрошен' : 'Вывести в Steam'}
          </button>
          <button type="button" disabled aria-label={`Продать ${item.name}`}>
            Продать за COINS
          </button>
        </div>
        <small>Перепродажа пока недоступна и не меняет баланс COINS.</small>
      </div>
    </article>
  )
}

export function InventoryPage() {
  const state = useMarketplaceState()
  const [tradeUrl, setTradeUrl] = useState(state.steamTradeUrl)
  const [feedback, setFeedback] = useState<{ kind: 'error' | 'success'; message: string } | null>(null)

  const saveUrl = () => {
    const result = saveSteamTradeUrl(tradeUrl)
    if (!result.ok) {
      setFeedback({ kind: 'error', message: actionErrors[result.reason] })
      return
    }
    setTradeUrl(result.state.steamTradeUrl)
    setFeedback({ kind: 'success', message: 'Trade URL сохранён локально.' })
  }

  const withdraw = (item: InventoryItem) => {
    const result = requestInventoryWithdrawal(item.id)
    if (!result.ok) {
      setFeedback({ kind: 'error', message: actionErrors[result.reason] })
      return
    }
    setFeedback({
      kind: 'success',
      message: `Локальный вывод «${item.name}» ожидает подтверждения.`,
    })
  }

  return (
    <div className="inventory-page">
      <Header />
      <main className="inventory-page__main">
        <header className="inventory-page__intro">
          <p className="eyebrow">NYXO / STEAM STORAGE</p>
          <h1>Инвентарь</h1>
          <p>Купленные предметы и локальная подготовка Steam-трейда.</p>
        </header>

        <form
          className="inventory-trade-form"
          onSubmit={(event) => {
            event.preventDefault()
            saveUrl()
          }}
        >
          <div>
            <label htmlFor="inventory-trade-url">Steam Trade URL</label>
            <p>Нужен только для локального мок-вывода. Реальный Steam-трейд не создаётся.</p>
          </div>
          <input
            id="inventory-trade-url"
            type="url"
            value={tradeUrl}
            onChange={(event) => setTradeUrl(event.target.value)}
            placeholder="https://steamcommunity.com/tradeoffer/new/?partner=...&token=..."
            autoComplete="url"
          />
          <button className="nyxo-action" type="submit">Сохранить Trade URL</button>
        </form>

        {feedback && (
          <p
            className={`inventory-page__feedback${feedback.kind === 'error' ? ' inventory-page__feedback--error' : ''}`}
            role={feedback.kind === 'error' ? 'alert' : 'status'}
          >
            {feedback.message}
          </p>
        )}

        {state.inventory.length > 0 ? (
          <section className="inventory-page__grid" aria-label="Предметы инвентаря">
            {state.inventory.map((item) => (
              <InventoryCard key={item.id} item={item} onWithdraw={withdraw} />
            ))}
          </section>
        ) : (
          <section className="inventory-page__empty">
            <p className="eyebrow">STORAGE / EMPTY</p>
            <h2>Инвентарь пуст</h2>
            <p>После локальной покупки игровой предмет появится здесь.</p>
            <a className="nyxo-action" href="/catalog">Перейти в каталог</a>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}
