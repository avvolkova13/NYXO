import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Footer } from './Footer'

describe('Footer', () => {
  it('keeps the footer lockup static when links are hovered', () => {
    render(<Footer />)

    fireEvent.pointerEnter(screen.getByRole('link', { name: 'Каталог' }))

    expect(screen.queryByTestId('footer-lockup-card')).not.toBeInTheDocument()
    expect(screen.getByTestId('footer-lockup')).not.toHaveClass('is-previewing')
  })

  it('does not create image previews when the identity lockup is hovered', () => {
    render(<Footer />)

    const lockup = screen.getByTestId('footer-lockup')
    fireEvent.pointerEnter(lockup)
    fireEvent.mouseMove(lockup, { clientX: 300, clientY: 100 })
    fireEvent.pointerLeave(lockup)

    expect(lockup).not.toHaveClass('is-previewing')
    expect(lockup).not.toHaveClass('is-closing')
    expect(screen.queryByTestId('footer-lockup-card')).not.toBeInTheDocument()
  })
})
