import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { useMarketplaceState } from '../marketplace/useMarketplaceState'
import type { AccountSection } from '../router/useAppRoute'
import { AccountNav } from './AccountNav'
import { OrdersList, OrdersView } from './OrdersView'
import { PaymentsView } from './PaymentsView'
import { SettingsView } from './SettingsView'
import { SteamView } from './SteamView'

const formatCoins = (value: number) => `${value.toLocaleString('ru-RU')} COINS`

function Overview() {
  const state = useMarketplaceState()
  const recentOrders = state.orders.slice(-2)

  return (
    <section className="account-view account-overview" aria-labelledby="account-overview-title">
      <header className="account-view__heading">
        <p className="eyebrow">NYXO / ACCOUNT</p>
        <h1 id="account-overview-title">Личный кабинет</h1>
        <p>Баланс, последние покупки и быстрый доступ к локальным разделам.</p>
      </header>

      <div className="account-overview__stats">
        <article className="account-stat account-stat--balance">
          <span>Баланс</span>
          <strong>{formatCoins(state.balanceCoins)}</strong>
          <a href="/balance/top-up?returnTo=%2Faccount">Пополнить баланс</a>
        </article>
        <article className="account-stat">
          <span>Сессия</span>
          <strong>{state.session ? state.session.displayName : 'Не выполнен вход'}</strong>
          <a href={state.session ? '/account/settings' : '/auth?returnTo=%2Faccount'}>
            {state.session ? 'Управлять сессией' : 'Войти'}
          </a>
        </article>
        <article className="account-stat">
          <span>Инвентарь</span>
          <strong>{state.inventory.length.toLocaleString('ru-RU')} предметов</strong>
          <a href="/inventory">Открыть инвентарь</a>
        </article>
      </div>

      <section className="account-overview__recent" aria-labelledby="account-recent-title">
        <header>
          <div>
            <p className="eyebrow">RECENT / ORDERS</p>
            <h2 id="account-recent-title">Последние покупки</h2>
          </div>
          <a href="/account/purchases">Все покупки</a>
        </header>
        <OrdersList orders={recentOrders} />
      </section>
    </section>
  )
}

export function AccountPage({ section }: { section: AccountSection }) {
  const state = useMarketplaceState()

  return (
    <div className="account-page">
      <Header />
      <main className="account-page__main">
        <AccountNav section={section} />
        {section === 'overview' && <Overview />}
        {section === 'purchases' && <OrdersView orders={state.orders} />}
        {section === 'payments' && <PaymentsView payments={state.payments} />}
        {section === 'steam' && <SteamView state={state} />}
        {section === 'settings' && <SettingsView state={state} />}
      </main>
      <Footer />
    </div>
  )
}
