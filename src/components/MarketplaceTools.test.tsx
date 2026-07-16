import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { MarketplaceTools } from './MarketplaceTools'

describe('MarketplaceTools', () => {
  it('uses neutral empty-search copy without implementation status', async () => {
    const user = userEvent.setup()
    render(<MarketplaceTools />)

    await user.type(screen.getByRole('searchbox'), 'товар-которого-нет')

    expect(screen.getByText('По вашему запросу ничего не найдено')).toBeInTheDocument()
    expect(document.body).not.toHaveTextContent(/API|не подключ|демонстрац|тестов/i)
  })
})
