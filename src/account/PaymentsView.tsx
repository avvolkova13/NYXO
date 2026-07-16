import type { MarketplacePayment } from '../marketplace/marketplaceStore'
import { accountDateTime, formatAccountDate } from './formatAccountDate'

const formatCoins = (value: number) => `${value.toLocaleString('ru-RU')} COINS`

export function PaymentsView({ payments }: { payments: MarketplacePayment[] }) {
  return (
    <section className="account-view" aria-labelledby="account-payments-title">
      <header className="account-view__heading">
        <p className="eyebrow">ACCOUNT / COINS</p>
        <h1 id="account-payments-title">История платежей</h1>
        <p>Операции пополнения и покупки в COINS.</p>
      </header>

      {payments.length === 0 ? (
        <section className="account-empty" aria-labelledby="account-payments-empty">
          <h2 id="account-payments-empty">Операций пока нет</h2>
          <a className="nyxo-action" href="/balance/top-up?returnTo=%2Faccount%2Fpayments">
            Пополнить баланс
          </a>
        </section>
      ) : (
        <div className="account-payments">
          {[...payments].reverse().map((payment) => {
            const topUp = payment.kind === 'top-up'
            return (
              <article className="account-payment" key={payment.id}>
                <div>
                  <small>{topUp ? 'COINS / IN' : 'COINS / OUT'}</small>
                  <strong>{topUp ? 'Пополнение' : 'Покупка'}</strong>
                </div>
                <time dateTime={accountDateTime(payment.createdAt)}>
                  {formatAccountDate(payment.createdAt)}
                </time>
                <b className={topUp ? 'account-payment__amount--positive' : undefined}>
                  {topUp ? '+' : '−'}{formatCoins(payment.amountCoins)}
                </b>
                <span className="account-status account-status--complete">Выполнен</span>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
