import { useRef, useState, type FormEvent } from 'react'

import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import {
  replaceMarketplaceState,
  updateMarketplaceState,
  type MarketplaceState,
} from '../marketplace/marketplaceStore'
import {
  categoryRequiresOrderNumber,
  createSupportTicket,
  SUPPORT_CATEGORIES,
  validateSupportTicket,
  type SupportTicketErrors,
  type SupportTicketInput,
} from '../marketplace/support'

const emptyForm: SupportTicketInput = {
  category: 'Steam',
  email: '',
  subject: '',
  message: '',
}

type FieldName = keyof SupportTicketInput

export function SupportPage() {
  const [form, setForm] = useState<SupportTicketInput>(emptyForm)
  const [errors, setErrors] = useState<SupportTicketErrors>({})
  const [ticketNumber, setTicketNumber] = useState('')
  const [storageError, setStorageError] = useState('')
  const submitting = useRef(false)
  const needsOrderNumber = categoryRequiresOrderNumber(form.category)

  const updateField = (field: FieldName, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      if (!(field in current)) return current
      const next = { ...current }
      delete next[field]
      return next
    })
    setStorageError('')
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting.current) return

    const nextErrors = validateSupportTicket(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    submitting.current = true
    const previous: { state: MarketplaceState | null } = { state: null }
    const result = updateMarketplaceState((current) => {
      previous.state = current
      return createSupportTicket(current, form).state
    })

    if (!result.persisted) {
      if (previous.state) replaceMarketplaceState(previous.state)
      submitting.current = false
      setStorageError('Не удалось сохранить обращение. Попробуйте ещё раз.')
      return
    }

    setTicketNumber(result.state.supportTickets.at(-1)?.number ?? '')
  }

  const errorProps = (field: FieldName) => ({
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `support-${field}-error` : undefined,
  })

  return (
    <div className="support-page">
      <Header />
      <main className="support-page__main">
        {ticketNumber ? (
          <section
            className="support-confirmation"
            role="status"
            aria-live="polite"
            aria-labelledby="support-confirmation-title"
          >
            <p className="eyebrow">NYXO / TICKET</p>
            <h1 id="support-confirmation-title">Обращение сохранено</h1>
            <p className="support-confirmation__number">
              Обращение № <strong>{ticketNumber}</strong>
            </p>
            <p className="support-confirmation__notice">
              Сохраните номер обращения для проверки статуса.
            </p>
            <div className="support-confirmation__actions">
              <a className="nyxo-action" href="/account">Перейти в кабинет</a>
              <a href="/">На главную</a>
            </div>
          </section>
        ) : (
          <>
            <header className="support-page__intro">
              <p className="eyebrow">NYXO / HELP DESK</p>
              <h1>Поддержка</h1>
              <p>
                Опишите ситуацию — обращению будет присвоен номер для проверки статуса.
              </p>
            </header>

            {storageError && <p className="support-page__error" role="alert">{storageError}</p>}

            <form className="support-form" noValidate onSubmit={submit}>
              <div className="support-form__fields">
                <label className="support-field">
                  <span>Категория</span>
                  <select
                    aria-label="Категория"
                    value={form.category}
                    onChange={(event) => {
                      const category = event.target.value as SupportTicketInput['category']
                      setForm((current) => ({
                        ...current,
                        category,
                        ...(!categoryRequiresOrderNumber(category) ? { orderNumber: undefined } : {}),
                      }))
                      setErrors((current) => {
                        const next = { ...current }
                        delete next.orderNumber
                        return next
                      })
                    }}
                  >
                    {SUPPORT_CATEGORIES.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </label>

                {needsOrderNumber && (
                  <label className="support-field">
                    <span>Номер заказа</span>
                    <input
                      aria-label="Номер заказа"
                      type="text"
                      required
                      value={form.orderNumber ?? ''}
                      placeholder="NYXO-240601"
                      onChange={(event) => updateField('orderNumber', event.target.value)}
                      {...errorProps('orderNumber')}
                    />
                    {errors.orderNumber && (
                      <small id="support-orderNumber-error" role="alert">{errors.orderNumber}</small>
                    )}
                  </label>
                )}

                <label className="support-field">
                  <span>Email</span>
                  <input
                    aria-label="Email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    {...errorProps('email')}
                  />
                  {errors.email && <small id="support-email-error" role="alert">{errors.email}</small>}
                </label>

                <label className="support-field support-field--wide">
                  <span>Тема</span>
                  <input
                    aria-label="Тема"
                    type="text"
                    required
                    value={form.subject}
                    onChange={(event) => updateField('subject', event.target.value)}
                    {...errorProps('subject')}
                  />
                  {errors.subject && <small id="support-subject-error" role="alert">{errors.subject}</small>}
                </label>

                <label className="support-field support-field--wide">
                  <span>Сообщение</span>
                  <textarea
                    aria-label="Сообщение"
                    required
                    rows={7}
                    value={form.message}
                    onChange={(event) => updateField('message', event.target.value)}
                    {...errorProps('message')}
                  />
                  {errors.message && <small id="support-message-error" role="alert">{errors.message}</small>}
                </label>
              </div>

              <aside className="support-form__summary" aria-labelledby="support-summary-title">
                <span className="support-form__index">01 / REQUEST</span>
                <h2 id="support-summary-title">Ваше обращение</h2>
                <p>
                  Укажите точные данные — они помогут быстрее разобраться в ситуации.
                </p>
                <dl>
                  <div><dt>Канал</dt><dd>Служба поддержки</dd></div>
                  <div><dt>Статус</dt><dd>Данные заполнены</dd></div>
                </dl>
                <button className="nyxo-action" type="submit">Создать обращение</button>
              </aside>
            </form>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
