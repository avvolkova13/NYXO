import { useMemo, useRef, useState } from 'react'

import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { products } from '../data/products'
import {
  replaceMarketplaceState,
  updateMarketplaceState,
  type MarketplaceOrder,
  type MarketplaceState,
} from '../marketplace/marketplaceStore'
import { calculateCart, completePurchase, type PurchaseResult } from '../marketplace/purchase'
import { useMarketplaceState } from '../marketplace/useMarketplaceState'

const formatCoins = (value: number) => `${value.toLocaleString('ru-RU')} COINS`

export function CartPage() {
  const state = useMarketplaceState()
  const cart = useMemo(() => calculateCart(products, state.cartProductIds), [state.cartProductIds])
  const [receipt, setReceipt] = useState<MarketplaceOrder | null>(null)
  const [error, setError] = useState('')
  const purchaseInProgress = useRef(false)

  const removeProduct = (productId: string) => {
    setError('')
    const previous: { state: MarketplaceState | null } = { state: null }
    const result = updateMarketplaceState((current) => {
      previous.state = current
      return {
        ...current,
        cartProductIds: current.cartProductIds.filter((id) => id !== productId),
      }
    })
    if (!result.persisted) {
      if (previous.state) replaceMarketplaceState(previous.state)
      setError('Не удалось сохранить изменения корзины. Попробуйте ещё раз.')
    }
  }

  const purchase = () => {
    if (purchaseInProgress.current) return
    purchaseInProgress.current = true
    setError('')

    const completed: { result: PurchaseResult | null } = { result: null }
    const previous: { state: MarketplaceState | null } = { state: null }
    const persisted = updateMarketplaceState((current) => {
      previous.state = current
      completed.result = completePurchase(current, products)
      return completed.result.state
    })

    if (!persisted.persisted) {
      if (previous.state) replaceMarketplaceState(previous.state)
      purchaseInProgress.current = false
      setError('Не удалось сохранить покупку. Освободите место в браузере и попробуйте ещё раз.')
      return
    }

    if (completed.result?.status === 'success') {
      setReceipt(completed.result.order)
      return
    }

    purchaseInProgress.current = false
    setError('Условия покупки изменились. Проверьте корзину и повторите попытку.')
  }

  return (
    <div className="cart-page">
      <Header />
      <main className="cart-page__main">
        {error && <p className="cart-page__error" role="alert">{error}</p>}

        {receipt ? (
          <section className="cart-receipt" aria-labelledby="cart-receipt-title">
            <p className="eyebrow">NYXO / RECEIPT</p>
            <h1 id="cart-receipt-title">Покупка завершена</h1>
            <p>Заказ <strong>{receipt.number}</strong> оплачен в COINS.</p>
            <dl>
              <div><dt>Списано</dt><dd>{formatCoins(receipt.totalCoins)}</dd></div>
              <div><dt>Позиций</dt><dd>{receipt.items.length}</dd></div>
            </dl>
            <div className="cart-page__actions">
              <a className="nyxo-action" href="/account/purchases">Мои покупки</a>
              <a className="cart-page__secondary-action" href="/inventory">Открыть инвентарь</a>
            </div>
          </section>
        ) : (
          <>
            <header className="cart-page__intro">
              <p className="eyebrow">NYXO / CHECKOUT</p>
              <h1>Корзина</h1>
              <p>Проверьте состав заказа перед списанием COINS.</p>
            </header>

            {cart.items.length === 0 ? (
              <section className="cart-empty" aria-labelledby="cart-empty-title">
                <h2 id="cart-empty-title">Корзина пуста</h2>
                <p>Добавьте скин или цифровое пополнение из общего каталога NYXO.</p>
                <a className="nyxo-action" href="/catalog">Вернуться в каталог</a>
              </section>
            ) : (
              <div className="cart-page__layout">
                <section className="cart-items" aria-labelledby="cart-items-title">
                  <div className="cart-items__heading">
                    <h2 id="cart-items-title">Состав заказа</h2>
                    <span>{cart.items.length.toLocaleString('ru-RU')} поз.</span>
                  </div>
                  <ul>
                    {cart.items.map((product) => (
                      <li className="cart-row" key={product.id}>
                        <img src={product.imageUrl} alt="" />
                        <div className="cart-row__details">
                          <span>{product.category}</span>
                          <strong>{product.name}</strong>
                        </div>
                        <b>{formatCoins(Math.round(product.price))}</b>
                        <button type="button" onClick={() => removeProduct(product.id)} aria-label={`Удалить ${product.name}`}>
                          Удалить
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>

                <aside className="cart-summary" aria-labelledby="cart-summary-title">
                  <p className="eyebrow">COINS / TOTAL</p>
                  <h2 id="cart-summary-title">Итого</h2>
                  <dl>
                    <div><dt>Товары</dt><dd>{formatCoins(cart.subtotalCoins)}</dd></div>
                    <div><dt>Баланс</dt><dd>{formatCoins(state.balanceCoins)}</dd></div>
                  </dl>

                  {state.balanceCoins < cart.subtotalCoins ? (
                    <div className="cart-summary__gate">
                      <strong>Не хватает {formatCoins(cart.subtotalCoins - state.balanceCoins)}</strong>
                      <a className="nyxo-action" href={`/balance/top-up?returnTo=%2Fcart&needed=${cart.subtotalCoins - state.balanceCoins}`}>
                        Пополнить на {formatCoins(cart.subtotalCoins - state.balanceCoins)}
                      </a>
                    </div>
                  ) : cart.hasSkin && state.session?.method !== 'steam' ? (
                    <div className="cart-summary__gate">
                      <p>Для передачи скина нужна активная Steam-сессия.</p>
                      <a className="nyxo-action" href="/auth?returnTo=%2Fcart&required=steam">Войти через Steam</a>
                    </div>
                  ) : (
                    <button className="nyxo-action" type="button" onClick={purchase}>Оплатить заказ</button>
                  )}
                  <p className="cart-summary__note">Списание и создание заказа выполняются одной операцией.</p>
                </aside>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
