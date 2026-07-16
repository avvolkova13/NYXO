import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createDefaultMarketplaceState,
  readMarketplaceState,
  replaceMarketplaceState,
} from '../marketplace/marketplaceStore'
import { TopUpPage } from './TopUpPage'

const consentSentence =
  'Я принимаю условия Пользовательского соглашения (Оферты) и даю согласие на обработку персональных данных в соответствии с Политикой конфиденциальности.'

describe('TopUpPage', () => {
  beforeEach(() => {
    localStorage.clear()
    replaceMarketplaceState(createDefaultMarketplaceState())
    window.history.replaceState({}, '', '/balance/top-up')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('offers four fixed packages, an empty custom amount, and production-ready payment copy', () => {
    render(<TopUpPage />)

    for (const amount of ['1 000 COINS', '3 000 COINS', '5 000 COINS', '10 000 COINS']) {
      expect(screen.getByRole('radio', { name: amount })).toBeInTheDocument()
    }
    expect(screen.getByRole('spinbutton', { name: 'Своя сумма COINS' })).toHaveValue(null)
    expect(screen.getByText('Пополнение баланса COINS')).toBeInTheDocument()
    expect(document.body).not.toHaveTextContent(/тестов|демонстрац|реальная оплата не выполняется/i)
  })

  it('renders the exact mandatory consent with working legal links', () => {
    render(<TopUpPage />)

    const consent = screen.getByTestId('top-up-consent-copy')
    expect(consent).toHaveTextContent(consentSentence)
    expect(within(consent).getByRole('link', { name: 'Пользовательского соглашения (Оферты)' }))
      .toHaveAttribute('href', '/legal/terms')
    expect(within(consent).getByRole('link', { name: 'Политикой конфиденциальности' }))
      .toHaveAttribute('href', '/legal/privacy')
  })

  it('keeps submit explicitly disabled until a valid amount and consent are present', async () => {
    const user = userEvent.setup()
    render(<TopUpPage />)

    const submit = screen.getByRole('button', { name: 'Пополнить баланс' })
    const consent = screen.getByRole('checkbox', { name: consentSentence })
    const custom = screen.getByRole('spinbutton', { name: 'Своя сумма COINS' })

    expect(submit).toBeDisabled()
    expect(submit).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByText('Выберите корректную сумму и примите обязательное согласие.')).toBeInTheDocument()

    await user.click(consent)
    expect(submit).toBeDisabled()

    await user.type(custom, '99')
    expect(submit).toBeDisabled()
    expect(screen.getByRole('alert')).toHaveTextContent('от 100 до 100 000 COINS')

    await user.clear(custom)
    await user.type(custom, '100000')
    expect(submit).toBeEnabled()
    expect(submit).toHaveAttribute('aria-disabled', 'false')
  })

  it('does not trust needed as an amount and only explains a valid shortage', () => {
    window.history.replaceState({}, '', '/balance/top-up?returnTo=%2Fcart&needed=400')
    render(<TopUpPage />)

    expect(screen.getByText('Для заказа не хватает 400 COINS. Выберите сумму пополнения.')).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: 'Своя сумма COINS' })).toHaveValue(null)
    expect(screen.getByRole('button', { name: 'Пополнить баланс' })).toBeDisabled()
  })

  it('shows the new balance and returns to a safe known internal route after success', async () => {
    window.history.replaceState({}, '', '/balance/top-up?returnTo=%2Fcatalog')
    const user = userEvent.setup()
    render(<TopUpPage />)

    await user.click(screen.getByRole('radio', { name: '1 000 COINS' }))
    await user.click(screen.getByRole('checkbox', { name: consentSentence }))
    await user.click(screen.getByRole('button', { name: 'Пополнить баланс' }))

    const status = screen.getByRole('status')
    expect(status).toHaveAccessibleName('Баланс COINS обновлён')
    expect(status).toHaveTextContent('Баланс и запись в истории платежей обновлены')
    expect(within(status).getByText('3 500 COINS')).toBeInTheDocument()
    expect(within(status).getByRole('link', { name: 'Вернуться' })).toHaveAttribute(
      'href',
      '/catalog',
    )
    expect(readMarketplaceState().balanceCoins).toBe(3_500)
    expect(readMarketplaceState().payments.at(-1)).toMatchObject({
      kind: 'top-up',
      amountCoins: 1_000,
      status: 'completed',
    })
  })

  it.each([
    ['https://evil.example/steal', '/cart'],
    ['//evil.example/steal', '/cart'],
    ['/unknown', '/cart'],
  ])('rejects unsafe returnTo %s and falls back to Cart', async (returnTo, expected) => {
    window.history.replaceState(
      {},
      '',
      `/balance/top-up?returnTo=${encodeURIComponent(returnTo)}`,
    )
    const user = userEvent.setup()
    render(<TopUpPage />)

    await user.click(screen.getByRole('radio', { name: '3 000 COINS' }))
    await user.click(screen.getByRole('checkbox', { name: consentSentence }))
    await user.click(screen.getByRole('button', { name: 'Пополнить баланс' }))

    expect(screen.getByRole('link', { name: 'Вернуться' })).toHaveAttribute('href', expected)
  })

  it('rolls back on persistence failure, shows no false confirmation, and allows retry', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota exceeded')
    })
    const user = userEvent.setup()
    render(<TopUpPage />)

    await user.click(screen.getByRole('radio', { name: '5 000 COINS' }))
    await user.click(screen.getByRole('checkbox', { name: consentSentence }))
    await user.click(screen.getByRole('button', { name: 'Пополнить баланс' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Не удалось сохранить пополнение')
    expect(screen.queryByRole('heading', { name: 'Баланс COINS обновлён' })).not.toBeInTheDocument()
    expect(readMarketplaceState().balanceCoins).toBe(2_500)
    expect(readMarketplaceState().payments).toHaveLength(1)

    setItem.mockRestore()
    await user.click(screen.getByRole('button', { name: 'Пополнить баланс' }))
    expect(screen.getByRole('heading', { name: 'Баланс COINS обновлён' })).toBeInTheDocument()
    expect(readMarketplaceState().balanceCoins).toBe(7_500)
  })

  it('shows a recoverable overflow error without persisting or changing shared state', async () => {
    const original = {
      ...createDefaultMarketplaceState(),
      balanceCoins: Number.MAX_SAFE_INTEGER,
      cartProductIds: ['ak47-wild-lotus'],
      session: {
        method: 'steam' as const,
        displayName: 'Overflow tester',
        createdAt: '2026-07-16T09:00:00.000Z',
        steamId: 'steam-overflow-test',
      },
      inventory: [
        {
          id: 'inventory-overflow-test',
          productId: 'ak47-wild-lotus',
          name: 'AK-47 | Wild Lotus',
          valueCoins: 1_850,
          acquiredAt: '2026-07-16T09:00:00.000Z',
          status: 'available' as const,
        },
      ],
    }
    replaceMarketplaceState(original)
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    const user = userEvent.setup()
    render(<TopUpPage />)

    await user.click(screen.getByRole('radio', { name: '1 000 COINS' }))
    await user.click(screen.getByRole('checkbox', { name: consentSentence }))
    await user.click(screen.getByRole('button', { name: 'Пополнить баланс' }))

    expect(screen.getByRole('alert')).toHaveTextContent('итоговый баланс превышает допустимый лимит')
    expect(screen.queryByRole('heading', { name: 'Баланс COINS обновлён' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Вернуться' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Пополнить баланс' })).toBeEnabled()
    expect(setItem).not.toHaveBeenCalled()
    expect(readMarketplaceState()).toEqual(original)
  })
})
