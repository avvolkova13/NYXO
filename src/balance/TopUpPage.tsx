import { useRef, useState } from 'react'

import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import {
  replaceMarketplaceState,
  updateMarketplaceState,
  type MarketplaceState,
} from '../marketplace/marketplaceStore'
import { safeReturnRoute } from '../marketplace/safeReturnRoute'
import {
  applyTopUp,
  isValidTopUpAmount,
  MAX_TOP_UP_COINS,
  MIN_TOP_UP_COINS,
  TOP_UP_PACKAGES,
  TopUpBalanceOverflowError,
} from '../marketplace/topUp'
import { useMarketplaceState } from '../marketplace/useMarketplaceState'

const formatCoins = (value: number) => `${value.toLocaleString('ru-RU')} COINS`

function readPositiveInteger(value: string | null): number | null {
  if (value === null || !/^\d+$/.test(value)) return null
  const number = Number(value)
  return Number.isSafeInteger(number) && number > 0 ? number : null
}

export function TopUpPage() {
  const state = useMarketplaceState()
  const search = new URLSearchParams(window.location.search)
  const returnTo = safeReturnRoute(search.get('returnTo'), '/cart')
  const neededCoins = readPositiveInteger(search.get('needed'))
  const [packageAmount, setPackageAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [consented, setConsented] = useState(false)
  const [error, setError] = useState('')
  const [newBalance, setNewBalance] = useState<number | null>(null)
  const submitting = useRef(false)

  const customNumber = customAmount === '' ? null : Number(customAmount)
  const amountCoins = customAmount === '' ? packageAmount : customNumber
  const validAmount = isValidTopUpAmount(amountCoins)
  const canSubmit = validAmount && consented
  const showCustomError = customAmount !== '' && !isValidTopUpAmount(customNumber)

  const selectPackage = (amount: number) => {
    setPackageAmount(amount)
    setCustomAmount('')
    setError('')
  }

  const changeCustomAmount = (value: string) => {
    setCustomAmount(value)
    setPackageAmount(null)
    setError('')
  }

  const submit = () => {
    if (!canSubmit || submitting.current || amountCoins === null) return
    submitting.current = true
    setError('')

    const previous: { state: MarketplaceState | null } = { state: null }
    let result
    try {
      result = updateMarketplaceState((current) => {
        previous.state = current
        return applyTopUp(current, amountCoins).state
      })
    } catch (caughtError) {
      submitting.current = false
      if (caughtError instanceof TopUpBalanceOverflowError) {
        setError(
          'Пополнение не выполнено: итоговый баланс превышает допустимый лимит. Потратьте часть COINS и попробуйте снова.',
        )
        return
      }
      throw caughtError
    }

    if (!result.persisted) {
      if (previous.state) replaceMarketplaceState(previous.state)
      submitting.current = false
      setError('Не удалось сохранить пополнение. Попробуйте ещё раз.')
      return
    }

    setNewBalance(result.state.balanceCoins)
  }

  return (
    <div className="top-up-page">
      <Header />
      <main className="top-up-page__main">
        {error && <p className="top-up-page__error" role="alert">{error}</p>}

        {newBalance !== null ? (
          <section
            className="top-up-success"
            role="status"
            aria-live="polite"
            aria-labelledby="top-up-success-title"
          >
            <p className="eyebrow">COINS / COMPLETE</p>
            <h1 id="top-up-success-title">Баланс COINS обновлён</h1>
            <p>Баланс и запись в истории платежей обновлены.</p>
            <dl>
              <div><dt>Новый баланс</dt><dd>{formatCoins(newBalance)}</dd></div>
              <div><dt>Статус</dt><dd>Выполнено</dd></div>
            </dl>
            <a className="nyxo-action" href={returnTo}>Вернуться</a>
          </section>
        ) : (
          <>
            <header className="top-up-page__intro">
              <p className="eyebrow">NYXO / COINS</p>
              <h1>Пополнить баланс</h1>
              <p>Выберите пакет или укажите свою целую сумму COINS.</p>
            </header>

            {neededCoins !== null && (
              <p className="top-up-page__shortage">
                Для заказа не хватает {formatCoins(neededCoins)}. Выберите сумму пополнения.
              </p>
            )}

            <form className="top-up-form" onSubmit={(event) => { event.preventDefault(); submit() }}>
              <section className="top-up-form__amount" aria-labelledby="top-up-amount-title">
                <div className="top-up-form__section-heading">
                  <span>01</span>
                  <h2 id="top-up-amount-title">Сумма пополнения</h2>
                </div>

                <fieldset className="top-up-packages">
                  <legend>Готовые пакеты</legend>
                  {TOP_UP_PACKAGES.map((amount) => (
                    <label key={amount} className="top-up-package">
                      <input
                        type="radio"
                        name="top-up-package"
                        value={amount}
                        aria-label={formatCoins(amount).replace(/\u00a0/g, ' ')}
                        checked={packageAmount === amount && customAmount === ''}
                        onChange={() => selectPackage(amount)}
                      />
                      <span>{formatCoins(amount)}</span>
                    </label>
                  ))}
                </fieldset>

                <label className="top-up-custom">
                  <span>Своя сумма COINS</span>
                  <input
                    type="number"
                    aria-label="Своя сумма COINS"
                    min={MIN_TOP_UP_COINS}
                    max={MAX_TOP_UP_COINS}
                    step="1"
                    inputMode="numeric"
                    value={customAmount}
                    onChange={(event) => changeCustomAmount(event.target.value)}
                    aria-describedby={showCustomError ? 'top-up-custom-error' : 'top-up-custom-hint'}
                    aria-invalid={showCustomError}
                  />
                  <small id="top-up-custom-hint">Целое число от 100 до 100 000.</small>
                </label>
                {showCustomError && (
                  <p id="top-up-custom-error" className="top-up-form__validation" role="alert">
                    Введите целую сумму от 100 до 100 000 COINS.
                  </p>
                )}
              </section>

              <aside className="top-up-form__confirm" aria-labelledby="top-up-confirm-title">
                <div className="top-up-form__section-heading">
                  <span>02</span>
                  <h2 id="top-up-confirm-title">Подтверждение</h2>
                </div>
                <p className="top-up-form__status-label">
                  Пополнение баланса COINS
                </p>
                <dl>
                  <div><dt>Текущий баланс</dt><dd>{formatCoins(state.balanceCoins)}</dd></div>
                  <div><dt>Пополнение</dt><dd>{validAmount ? formatCoins(amountCoins) : '—'}</dd></div>
                </dl>

                <label className="top-up-consent">
                  <input
                    type="checkbox"
                    checked={consented}
                    onChange={(event) => setConsented(event.target.checked)}
                  />
                  <span data-testid="top-up-consent-copy">
                    Я принимаю условия <a href="/legal/terms">Пользовательского соглашения (Оферты)</a> и даю согласие на обработку персональных данных в соответствии с <a href="/legal/privacy">Политикой конфиденциальности</a>.
                  </span>
                </label>

                <button
                  className="nyxo-action top-up-form__submit"
                  type="submit"
                  disabled={!canSubmit}
                  aria-disabled={!canSubmit}
                >
                  Пополнить баланс
                </button>
                {!canSubmit && (
                  <p className="top-up-form__disabled-note">
                    Выберите корректную сумму и примите обязательное согласие.
                  </p>
                )}
              </aside>
            </form>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
