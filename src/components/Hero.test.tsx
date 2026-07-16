import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import heroStyles from '../styles.css?raw'
import { Hero } from './Hero'

describe('Hero spatial workstation', () => {
  it('presents only the rifle with its real marketplace parameters', () => {
    render(<Hero />)

    expect(
      screen.getByRole('img', {
        name: 'M4A1-S «Поток информации», винтовка',
      }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(
      screen.queryByRole('img', {
        name: 'Штык-нож M9 «Доплер», нож',
      }),
    ).not.toBeInTheDocument()

    const rifleData = screen.getByLabelText('Параметры винтовки')
    expect(within(rifleData).getByText('41 760 ₽')).toBeInTheDocument()
    expect(within(rifleData).getByText('0,1987')).toBeInTheDocument()

    expect(screen.queryByLabelText('Параметры ножа')).not.toBeInTheDocument()
    expect(screen.getByText('01 предмет')).toBeInTheDocument()
  })

  it('links an inspected item to its annotation', () => {
    render(<Hero />)

    const rifle = screen.getByRole('img', {
      name: 'M4A1-S «Поток информации», винтовка',
    })
    const rifleData = screen.getByLabelText('Параметры винтовки')

    expect(rifleData).toHaveAttribute('data-active', 'false')
    fireEvent.pointerEnter(rifle)
    expect(rifleData).toHaveAttribute('data-active', 'true')
    fireEvent.pointerLeave(rifle)
    expect(rifleData).toHaveAttribute('data-active', 'false')
  })

  it('locks inspection on click and exposes the state accessibly', () => {
    render(<Hero />)

    const control = screen.getByRole('button', {
      name: 'Осмотреть M4A1-S «Поток информации»',
    })
    expect(control).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(control)
    expect(control).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(control)
    expect(control).toHaveAttribute('aria-pressed', 'false')
  })

  it('exposes locked inspection state on the workstation', () => {
    render(<Hero />)

    const workstation = document.querySelector('.hero-workstation')
    const control = screen.getByRole('button', {
      name: 'Осмотреть M4A1-S «Поток информации»',
    })

    expect(workstation).toHaveAttribute('data-inspection-locked', 'false')
    fireEvent.click(control)
    expect(workstation).toHaveAttribute('data-inspection-locked', 'true')
  })

  it('renders the rifle through a volumetric WebGL scene with spatial callouts', () => {
    render(<Hero />)

    expect(
      screen.getByRole('button', {
        name: 'Осмотреть M4A1-S «Поток информации»',
      }),
    ).toBeInTheDocument()
    expect(document.querySelector('[data-rifle-renderer="webgl"]')).toBeInTheDocument()
    expect(document.querySelectorAll('.rifle-turntable__depth')).toHaveLength(0)
    expect(screen.getByLabelText('Состояние предмета')).toBeInTheDocument()
    expect(screen.getByLabelText('Редкость предмета')).toBeInTheDocument()
    expect(screen.getByLabelText('Происхождение предмета')).toBeInTheDocument()
  })

  it('renders an inert five-cell scan field with scanning initially inactive', () => {
    render(<Hero />)

    const workstation = document.querySelector('.hero-workstation')
    const scanField = document.querySelector('.hero-scan-field')

    expect(workstation).toHaveAttribute('data-scan-active', 'false')
    expect(scanField).toHaveAttribute('aria-hidden', 'true')
    expect(scanField?.querySelectorAll('.hero-scan-cell')).toHaveLength(5)
  })

  it('scopes each marker to one direction-aware shelf assembly', () => {
    render(<Hero />)

    expect(document.querySelectorAll('.hero-line-shelf')).toHaveLength(8)
    expect(document.querySelectorAll('.hero-line-elbow')).toHaveLength(4)
    expect(document.querySelectorAll('.hero-line-shelf--outer-left')).toHaveLength(4)
    expect(document.querySelectorAll('.hero-line-shelf--outer-right')).toHaveLength(4)

    const assemblies = document.querySelectorAll('.hero-line-assembly')
    expect(assemblies).toHaveLength(4)
    expect(document.querySelectorAll('.hero-line-assembly--outer-left')).toHaveLength(3)
    expect(document.querySelectorAll('.hero-line-assembly--outer-right')).toHaveLength(1)
    assemblies.forEach((assembly) => {
      expect(assembly.querySelectorAll(':scope > .hero-line-shelf')).toHaveLength(1)
      expect(assembly.querySelectorAll(':scope > .hero-line-marker-shift')).toHaveLength(1)
      expect(assembly.querySelector('.hero-line-elbow')).not.toBeInTheDocument()
    })
  })

  it('runs the centered odd-cell coarse-pointer cycle before activation', () => {
    expect(heroStyles).toMatch(
      /@media \(hover: none\), \(pointer: coarse\)[\s\S]*?\.hero-scan-cell:nth-child\(odd\)\s*{[\s\S]*?hero-scan-cell-cycle 6\.1s/,
    )
    expect(heroStyles).not.toContain(
      ".hero-sutera-scene[data-scan-active='true'] .hero-scan-cell:nth-child(odd)",
    )
  })

  it('calibrates shelves through shared direction-aware assembly transforms', () => {
    expect(heroStyles).toMatch(
      /\.hero-line-shelf,\s*\.hero-line-assembly\s*{[\s\S]*?transition: transform 620ms var\(--ease-out\)/,
    )
    expect(heroStyles).toContain(
      ".hero-sutera-scene[data-scan-active='true'] .hero-line-assembly",
    )
    expect(heroStyles).not.toContain('translateX(-8px)')
    expect(heroStyles).not.toContain('translateX(8px)')
  })

  it('keeps the active cell lifetime brief and fades cells on zone exit', () => {
    expect(heroStyles).toMatch(/transition:\s*opacity 280ms steps\(3, end\)/)
    expect(heroStyles).toMatch(
      /@keyframes hero-scan-cell-cycle\s*{[\s\S]*?3%\s*{ opacity: 0\.12; }[\s\S]*?8%, 17%\s*{ opacity: 0\.38; }[\s\S]*?27%, 100%\s*{ opacity: 0; }/,
    )
  })

  it('disables the shared shelf assembly transform for reduced motion', () => {
    expect(heroStyles).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.hero-line-assembly,[\s\S]*?transform: none !important;[\s\S]*?transition: none !important;/,
    )
  })

  it('frames the origin label and lifts the selected lot from the lower edge', () => {
    expect(heroStyles).toMatch(
      /\.hero-spatial-callout--bottom p\s*{[\s\S]*?padding: 0\.58rem 0\.68rem;[\s\S]*?border: 1px solid rgba\(244, 239, 232, 0\.3\);[\s\S]*?background: rgba\(23, 16, 31, 0\.9\);[\s\S]*?clip-path: polygon\(0 0, 100% 0, 100% 78%, 90% 100%, 0 100%\);/,
    )
    expect(heroStyles).toMatch(
      /\.hero-lot-window\s*{[\s\S]*?bottom: 16\.5%;/,
    )
  })

  it('activates scanning only inside the central inspection zone and resets on leave', () => {
    render(<Hero />)

    const workstation = document.querySelector('.hero-workstation') as HTMLDivElement
    workstation.getBoundingClientRect = () => ({
      bottom: 800,
      height: 800,
      left: 0,
      right: 1000,
      top: 0,
      width: 1000,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })

    fireEvent.pointerMove(workstation, { clientX: 500, clientY: 420 })
    expect(workstation).toHaveAttribute('data-scan-active', 'true')

    fireEvent.pointerMove(workstation, { clientX: 80, clientY: 80 })
    expect(workstation).toHaveAttribute('data-scan-active', 'false')

    fireEvent.pointerMove(workstation, { clientX: 500, clientY: 420 })
    expect(workstation).toHaveAttribute('data-scan-active', 'true')
    fireEvent.pointerLeave(workstation)
    expect(workstation).toHaveAttribute('data-scan-active', 'false')
  })

  it('turns the catalog action into a cursor-cover target while it is hovered', () => {
    render(<Hero />)

    const workstation = document.querySelector('.hero-workstation')
    const catalogAction = screen.getByRole('link', { name: 'Перейти в каталог' })

    fireEvent.pointerEnter(catalogAction)
    expect(workstation).toHaveAttribute('data-menu-covering', 'true')
    fireEvent.pointerLeave(catalogAction)
    expect(workstation).toHaveAttribute('data-menu-covering', 'false')
  })

  it('keeps the free inspection cursor synchronous with the real pointer', () => {
    expect(heroStyles).toMatch(
      /\.hero-cursor\s*{[\s\S]*?transition: width 160ms ease, height 160ms ease, border-color 160ms ease;/,
    )
    expect(heroStyles).not.toMatch(
      /\.hero-cursor\s*{[\s\S]*?transition: top 160ms ease, left 160ms ease/,
    )
  })

  it('hands live cell opacity into an interruptible exit fade', () => {
    vi.useFakeTimers()
    const frames = new Map<number, FrameRequestCallback>()
    let frameId = 0
    const requestFrame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frameId += 1
      frames.set(frameId, callback)
      return frameId
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      frames.delete(id)
    })
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true } as MediaQueryList)))

    const { unmount } = render(<Hero />)
    const workstation = document.querySelector('.hero-workstation') as HTMLDivElement
    const cells = Array.from(document.querySelectorAll<HTMLElement>('.hero-scan-cell'))
    workstation.getBoundingClientRect = () => ({
      bottom: 800,
      height: 800,
      left: 0,
      right: 1000,
      top: 0,
      width: 1000,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })

    fireEvent.pointerMove(workstation, { clientX: 500, clientY: 420 })
    frames.forEach((callback, id) => {
      frames.delete(id)
      callback(0)
    })

    const liveOpacities = ['0', '0.12', '0.26', '0.38', '0']
    const nativeGetComputedStyle = window.getComputedStyle
    vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
      const cellIndex = cells.indexOf(element as HTMLElement)
      if (cellIndex >= 0) {
        return { opacity: liveOpacities[cellIndex] } as CSSStyleDeclaration
      }
      return nativeGetComputedStyle(element)
    })
    const layoutFlush = vi.spyOn(cells[0], 'getBoundingClientRect')

    fireEvent.pointerMove(workstation, { clientX: 80, clientY: 80 })
    expect(cells.map((cell) => cell.style.opacity)).toEqual(liveOpacities)
    expect(cells.every((cell) => cell.style.animation === 'none')).toBe(true)
    expect(layoutFlush).toHaveBeenCalledOnce()

    frames.forEach((callback, id) => {
      frames.delete(id)
      callback(16)
    })
    expect(cells.every((cell) => cell.style.opacity === '0')).toBe(true)
    expect(cells.every((cell) => cell.style.transition.includes('opacity 280ms'))).toBe(true)

    fireEvent.pointerMove(workstation, { clientX: 500, clientY: 420 })
    expect(cells.every((cell) => cell.style.opacity === '')).toBe(true)
    expect(cells.every((cell) => cell.style.animation === '')).toBe(true)

    fireEvent.pointerMove(workstation, { clientX: 80, clientY: 80 })
    unmount()
    expect(cells.every((cell) => cell.getAttribute('style') === null)).toBe(true)
    expect(requestFrame).toHaveBeenCalled()

    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('keeps the catalogue action available', () => {
    render(<Hero />)

    expect(
      screen.getByRole('link', { name: 'Перейти в каталог' }),
    ).toHaveAttribute('href', '/catalog')
  })

  it('renders practical workstation data in both peripheral stations', () => {
    render(<Hero />)

    expect(screen.getByLabelText('Локальное время станции')).toBeInTheDocument()

    const index = screen.getByLabelText('Индекс характеристик')
    expect(within(index).getByText('Тип')).toBeInTheDocument()
    expect(within(index).getByText('Редкость')).toBeInTheDocument()
    expect(within(index).getByText('Состояние')).toBeInTheDocument()
    expect(within(index).getByText('Источник')).toBeInTheDocument()
    const thumbnail = index.querySelector('.hero-index__rifle-thumb')
    expect(thumbnail).toBeInTheDocument()
    expect(thumbnail).toHaveAttribute('src', '/assets/hero/m4a1s-printstream.png')

    const lot = screen.getByLabelText('Рабочее окно выбранного лота')
    expect(within(lot).getByText('41 760 ₽')).toBeInTheDocument()
    expect(within(lot).getByRole('button', { name: 'Сравнить предмет' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(within(lot).getByRole('button', { name: 'Добавить в инвентарь' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('uses dedicated compact and tablet geometry to keep actions clear of copy and annotations', () => {
    expect(heroStyles).toMatch(
      /@media \(min-width: 861px\) and \(max-width: 1100px\) \{[\s\S]*?\.hero \.hero-actions \{ top: 36%; left: 2\.15%; bottom: auto; \}[\s\S]*?\.hero-spatial-callout--left \{ top: 48%; left: 4%; width: 23%; \}/,
    )
    expect(heroStyles).toMatch(
      /@media \(min-width: 601px\) and \(max-width: 860px\) \{[\s\S]*?\.hero \.hero-actions \{ top: 33%; left: 4%; \}[\s\S]*?\.hero \.hero-object-stage \{ top: 39%; \}/,
    )
    expect(heroStyles).toMatch(
      /@media \(max-width: 600px\) \{[\s\S]*?\.hero \.hero-object-stage \{ top: 48\.7%; left: 4%; width: 92%; height: 20%; \}[\s\S]*?\.hero-spatial-callout--top \{ top: 70%;/,
    )
  })
})
