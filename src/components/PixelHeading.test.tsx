import { act, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { PixelHeading } from './PixelHeading'

describe('PixelHeading', () => {
  it('uses a pixelated canvas of the heading itself instead of DOM overlay fragments', () => {
    const bounds = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      width: 420,
      height: 96,
      bottom: 96,
      left: 0,
      right: 420,
      top: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        disconnect() {}
      },
    )
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {}
        disconnect() {}
      },
    )

    const { container } = render(
      <PixelHeading as="h2">Популярное сейчас</PixelHeading>,
    )

    expect(screen.getByRole('heading', { name: 'Популярное сейчас' })).toBeInTheDocument()
    return waitFor(() => {
      expect(container.querySelector('canvas.pixel-heading__canvas')).toBeInTheDocument()
      expect(container.querySelector('.pixel-heading__fragments')).not.toBeInTheDocument()
    }).finally(() => {
      bounds.mockRestore()
      vi.unstubAllGlobals()
    })
  })

  it('starts as a safe fallback when an observer never reports an intersection', async () => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {}
        disconnect() {}
      },
    )

    const { container } = render(<PixelHeading as="h2">Каталог предметов</PixelHeading>)

    expect(screen.getByRole('heading', { name: 'Каталог предметов' })).toHaveAttribute(
      'data-pixel-state',
      'waiting',
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })

    expect(container.querySelector('.pixel-heading')).not.toHaveAttribute(
      'data-pixel-state',
      'waiting',
    )

    vi.useRealTimers()
    vi.unstubAllGlobals()
  })
})
