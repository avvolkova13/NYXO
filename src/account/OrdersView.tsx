import type { MarketplaceOrder } from '../marketplace/marketplaceStore'
import { accountDateTime, formatAccountDate } from './formatAccountDate'

const formatCoins = (value: number) => `${value.toLocaleString('ru-RU')} COINS`

export function OrdersList({ orders }: { orders: MarketplaceOrder[] }) {
  if (orders.length === 0) {
    return (
      <section className="account-empty" aria-labelledby="account-orders-empty">
        <h2 id="account-orders-empty">Покупок пока нет</h2>
        <p>Выберите первый цифровой предмет в каталоге NYXO.</p>
        <a className="nyxo-action" href="/catalog">Открыть каталог</a>
      </section>
    )
  }

  return (
    <div className="account-orders">
      {[...orders].reverse().map((order) => (
        <article
          className="account-order"
          key={order.id}
          aria-label={`Заказ ${order.number}`}
        >
          <header className="account-order__header">
            <div>
              <span>Заказ</span>
              <strong>{order.number}</strong>
            </div>
            <time dateTime={accountDateTime(order.createdAt)}>
              {formatAccountDate(order.createdAt)}
            </time>
            <span className="account-status account-status--complete">Выполнен</span>
          </header>
          <ul className="account-order__items">
            {order.items.map((item) => (
              <li key={`${order.id}-${item.productId}`}>
                <div>
                  <small>{item.category ?? 'Цифровой товар'}</small>
                  <strong>{item.name}</strong>
                </div>
                <b>{formatCoins(item.priceCoins)}</b>
                <a href={`/catalog/${encodeURIComponent(item.productId)}`}>Найти в каталоге</a>
              </li>
            ))}
          </ul>
          <footer className="account-order__total">
            <span>Итого</span>
            <strong>{formatCoins(order.totalCoins)}</strong>
          </footer>
        </article>
      ))}
    </div>
  )
}

export function OrdersView({ orders }: { orders: MarketplaceOrder[] }) {
  return (
    <section className="account-view" aria-labelledby="account-purchases-title">
      <header className="account-view__heading">
        <p className="eyebrow">ACCOUNT / ORDERS</p>
        <h1 id="account-purchases-title">Покупки</h1>
        <p>Завершённые заказы из общей локальной истории NYXO.</p>
      </header>
      <OrdersList orders={orders} />
    </section>
  )
}
