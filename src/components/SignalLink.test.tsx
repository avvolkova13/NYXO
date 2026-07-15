import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import styles from '../styles.css?raw'
import { SignalLink } from './SignalLink'

describe('SignalLink', () => {
  it('keeps the visible action as a real accessible link', () => {
    render(
      <SignalLink href="#popular" signalLabel="Каталог">
        Перейти в каталог
      </SignalLink>,
    )

    const link = screen.getByRole('link', { name: 'Перейти в каталог' })
    expect(link).toHaveAttribute('href', '#popular')
    expect(link).toHaveClass('signal-link')
  })

  it('hides the repeated signal label from the accessibility tree', () => {
    render(
      <SignalLink href="#popular" signalLabel="Каталог">
        Перейти в каталог
      </SignalLink>,
    )

    expect(screen.getByText('Каталог')).toHaveAttribute('aria-hidden', 'true')
  })

  it('keeps the menu-style action text as the only accessible label', () => {
    render(
      <SignalLink href="#popular" signalLabel="Каталог">
        Перейти в каталог
      </SignalLink>,
    )

    const link = screen.getByRole('link', { name: 'Перейти в каталог' })
    const labels = link.querySelectorAll('.signal-link__label')

    expect(labels).toHaveLength(0)
    expect(link.querySelector('.signal-link__content')).toHaveTextContent('Перейти в каталог')
  })

  it('uses the square Menu control language instead of a filled hover wipe', () => {
    expect(styles).toMatch(/\.signal-link\s*{[\s\S]*?border-radius: 0;/)
    expect(styles).toMatch(
      /\.signal-link__content::before,[\s\S]*?content: '\[';/,
    )
    expect(styles).toMatch(
      /\.hero-sutera-scene\[data-menu-covering='true'\] \.signal-link\s*{[\s\S]*?background: var\(--orange\);/,
    )
  })

  it('defines the same square orange hover treatment for every shared action control', () => {
    expect(styles).toMatch(
      /\.nyxo-action\s*\{[\s\S]*?border-radius: 0;[\s\S]*?background: var\(--paper\);[\s\S]*?color: #0a0610;/,
    )
    expect(styles).toMatch(
      /\.nyxo-action:hover,[\s\S]*?\.nyxo-action:focus-visible\s*\{[\s\S]*?background: var\(--orange\);[\s\S]*?color: #0a0610;/,
    )
  })

  it('keeps product-media backgrounds free from decorative diagonal strips', () => {
    expect(styles).not.toMatch(
      /\.product-media__viewport\s*\{[\s\S]*?linear-gradient\(135deg, transparent 0 54%/,
    )
  })
})
