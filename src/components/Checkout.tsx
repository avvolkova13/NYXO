import { useState } from 'react'

import { PixelHeading } from './PixelHeading'

export function Checkout() {
  const [accepted, setAccepted] = useState(false)
  const [amount, setAmount] = useState('1500')

  return (
    <section className="checkout content-section" id="checkout" aria-labelledby="checkout-title">
      <div className="checkout__panel station-panel">
        <div>
          <PixelHeading as="h2" id="checkout-title">Счёт COINS</PixelHeading>
          <p>Пополните внутренний баланс, чтобы оплатить цифровой товар без перехода в пустой checkout.</p>
        </div>
        <form className="checkout__form" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="coins-amount">Сумма пополнения, COINS</label>
          <input id="coins-amount" inputMode="numeric" value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^0-9]/g, ''))} />
          <label className="checkout__consent">
            <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
            <span>Я принимаю условия Пользовательского соглашения (Оферты) и даю согласие на обработку персональных данных в соответствии с Политикой конфиденциальности.</span>
          </label>
          <button className="nyxo-action checkout__submit" type="submit" disabled={!accepted || !amount}>Пополнить баланс</button>
        </form>
      </div>
    </section>
  )
}
