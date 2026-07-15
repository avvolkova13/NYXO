import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from 'react'

import { SignalLink } from './SignalLink'
import { RifleModel } from './RifleModel'
import { PixelHeading } from './PixelHeading'

const rifle = {
  name: 'M4A1-S «Поток информации»',
  price: '41 760 ₽',
  condition: 'После полевых испытаний',
  float: '0,1987',
  rarity: 'Тайное',
  source: 'Кейс «Сломанный клык»',
  game: 'Counter-Strike 2',
  type: 'Винтовка',
}

const scanCells = Array.from({ length: 5 })

const stationTime = () =>
  new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date())

function TerminalMarker({ x, y }: { x: number; y: number }) {
  return (
    <g className="hero-line-marker" transform={`translate(${x} ${y})`}>
      <rect width="10" height="10" />
      <rect x="3.5" y="3.5" width="3" height="3" />
    </g>
  )
}

export function Hero() {
  const sceneRef = useRef<HTMLDivElement>(null)
  const pointerFrameRef = useRef(0)
  const scanExitFrameRef = useRef(0)
  const scanExitTimerRef = useRef(0)
  const scanExitCellsRef = useRef<HTMLElement[]>([])
  const pendingPointerRef = useRef({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)
  const [inspectionLocked, setInspectionLocked] = useState(false)
  const [scanActive, setScanActive] = useState(false)
  const [menuCovering, setMenuCovering] = useState(false)
  const [compared, setCompared] = useState(false)
  const [saved, setSaved] = useState(false)
  const [pulse, setPulse] = useState(0)
  const [time, setTime] = useState(stationTime)
  const active = hovered || inspectionLocked

  useEffect(() => {
    const timer = window.setInterval(() => setTime(stationTime()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const clearScanExitSchedule = () => {
    window.cancelAnimationFrame(scanExitFrameRef.current)
    window.clearTimeout(scanExitTimerRef.current)
    scanExitFrameRef.current = 0
    scanExitTimerRef.current = 0
  }

  const clearScanExitStyles = () => {
    scanExitCellsRef.current.forEach((cell) => {
      cell.style.removeProperty('animation')
      cell.style.removeProperty('opacity')
      cell.style.removeProperty('transition')
      if (!cell.style.cssText) cell.removeAttribute('style')
    })
    scanExitCellsRef.current = []
  }

  const restoreScanCellCycle = () => {
    clearScanExitSchedule()
    clearScanExitStyles()
  }

  const beginScanCellExit = () => {
    if (
      typeof window.matchMedia === 'function' &&
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    ) return

    const cells = Array.from(
      sceneRef.current?.querySelectorAll<HTMLElement>('.hero-scan-cell') ?? [],
    )
    if (!cells.length) return

    clearScanExitSchedule()
    const liveOpacities = cells.map((cell) => window.getComputedStyle(cell).opacity)
    scanExitCellsRef.current = cells
    cells.forEach((cell, index) => {
      cell.style.transition = 'none'
      cell.style.animation = 'none'
      cell.style.opacity = liveOpacities[index]
    })
    void cells[0].getBoundingClientRect()

    scanExitFrameRef.current = window.requestAnimationFrame(() => {
      scanExitFrameRef.current = 0
      cells.forEach((cell) => {
        cell.style.transition = 'opacity 280ms steps(3, end)'
        cell.style.opacity = '0'
      })
      scanExitTimerRef.current = window.setTimeout(() => {
        scanExitTimerRef.current = 0
        clearScanExitStyles()
      }, 300)
    })
  }

  useEffect(
    () => () => {
      window.cancelAnimationFrame(pointerFrameRef.current)
      clearScanExitSchedule()
      clearScanExitStyles()
    },
    [],
  )

  const applyPointer = () => {
    pointerFrameRef.current = 0
    const scene = sceneRef.current
    if (!scene) return
    const { x, y } = pendingPointerRef.current
    scene.style.setProperty('--pointer-x', `${x * 8}px`)
    scene.style.setProperty('--pointer-y', `${y * 6}px`)
    scene.style.setProperty('--pointer-rx', `${y * -1.2}deg`)
    scene.style.setProperty('--pointer-ry', `${x * 1.6}deg`)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const scene = sceneRef.current
    if (!scene) return
    const bounds = scene.getBoundingClientRect()
    if (!bounds.width || !bounds.height) return

    const localX = event.clientX - bounds.left
    const localY = event.clientY - bounds.top
    const nextScanActive =
      localX >= bounds.width * 0.2 &&
      localX <= bounds.width * 0.8 &&
      localY >= bounds.height * 0.24 &&
      localY <= bounds.height * 0.82
    if (nextScanActive) {
      restoreScanCellCycle()
    } else if (scanActive && !inspectionLocked) {
      beginScanCellExit()
    }
    setScanActive(nextScanActive)
    const x = localX / bounds.width - 0.5
    const y = localY / bounds.height - 0.5
    pendingPointerRef.current = { x, y }
    scene.style.setProperty('--cursor-x', `${localX}px`)
    scene.style.setProperty('--cursor-y', `${localY}px`)
    if (!pointerFrameRef.current) {
      pointerFrameRef.current = window.requestAnimationFrame(applyPointer)
    }
  }

  const resetPointer = () => {
    const scene = sceneRef.current
    if (!scene) return
    scene.style.setProperty('--pointer-x', '0px')
    scene.style.setProperty('--pointer-y', '0px')
    scene.style.setProperty('--pointer-rx', '0deg')
    scene.style.setProperty('--pointer-ry', '0deg')
    if (scanActive && !inspectionLocked) beginScanCellExit()
    setScanActive(false)
    setHovered(false)
    setMenuCovering(false)
  }

  const beginMenuCover = (event: PointerEvent<HTMLAnchorElement>) => {
    const scene = sceneRef.current
    setMenuCovering(true)
    if (!scene) return

    const sceneBounds = scene.getBoundingClientRect()
    const targetBounds = event.currentTarget.getBoundingClientRect()
    if (!sceneBounds.width || !sceneBounds.height || !targetBounds.width || !targetBounds.height) return

    scene.style.setProperty('--menu-cover-x', `${targetBounds.left - sceneBounds.left + targetBounds.width / 2}px`)
    scene.style.setProperty('--menu-cover-y', `${targetBounds.top - sceneBounds.top + targetBounds.height / 2}px`)
    scene.style.setProperty('--menu-cover-width', `${targetBounds.width + 12}px`)
    scene.style.setProperty('--menu-cover-height', `${targetBounds.height + 12}px`)
  }

  const toggleInspection = () => {
    const nextLocked = !inspectionLocked
    if (nextLocked) {
      restoreScanCellCycle()
    } else if (!scanActive) {
      beginScanCellExit()
    }
    setInspectionLocked(nextLocked)
    setPulse((value) => value + 1)
  }

  return (
    <section className="hero" id="hero" aria-labelledby="hero-title">
      <div
        className="hero-workstation hero-sutera-scene"
        ref={sceneRef}
        data-inspecting={active}
        data-inspection-locked={inspectionLocked}
        data-scan-active={scanActive || inspectionLocked}
        data-rifle-proximity={active}
        data-menu-covering={menuCovering}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetPointer}
      >
        <div className="hero-coordinate-field" aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => <i key={index} />)}
        </div>
        <div className="hero-scan-field" aria-hidden="true">
          {scanCells.map((_, index) => <i className="hero-scan-cell" key={index} />)}
        </div>

        <button
          className="hero-mode"
          type="button"
          aria-label={inspectionLocked ? 'Завершить осмотр предмета' : 'Запустить осмотр предмета'}
          aria-pressed={inspectionLocked}
          onClick={toggleInspection}
        >
          <span>Режим станции</span>
          <strong>{inspectionLocked ? 'Детальный осмотр' : 'Общий вид'}</strong>
          <i className="hero-mode__orbit" aria-hidden="true"><b /></i>
          <em aria-hidden="true">{inspectionLocked ? '×' : '+'}</em>
        </button>

        <time className="hero-station-time" aria-label="Локальное время станции">
          <span>Локальное время</span>
          <strong>ЕКБ&nbsp;&nbsp;{time}</strong>
        </time>

        <div className="hero-copy">
          <span className="hero-kicker">
            <span className="status-lamp" aria-hidden="true" />
            Станция редких предметов
          </span>
          <PixelHeading as="h1" id="hero-title" text={'Редкие скины.\nБез лишнего шума.'}>
            <span>Редкие скины.</span>{' '}
            <span>Без лишнего шума.</span>
          </PixelHeading>
          <p className="hero-intro">
            Ищите, сравнивайте и изучайте характеристики предметов до покупки.
          </p>
        </div>

        <div className="hero-object-stage" aria-label="Осматриваемый предмет">
          <div className="hero-object-rig">
            <button
              className="hero-object hero-object--rifle"
              type="button"
              aria-label={`Осмотреть ${rifle.name}`}
              aria-pressed={inspectionLocked}
              data-active={active}
              onPointerEnter={() => setHovered(true)}
              onPointerLeave={() => setHovered(false)}
              onFocus={() => setHovered(true)}
              onBlur={() => setHovered(false)}
              onClick={toggleInspection}
            >
              <RifleModel active={active} inspecting={inspectionLocked} />
              {pulse > 0 && <span key={pulse} className="hero-inspection-pulse" aria-hidden="true" />}
              <span className="hero-inspection-reticle" aria-hidden="true"><i /></span>
            </button>
          </div>
        </div>

        <div
          className="hero-data-network"
          aria-label="Параметры винтовки"
          data-active={active}
        >
          <aside className="hero-spatial-callout hero-spatial-callout--top" aria-label="Состояние предмета">
            <p>
              <span>Состояние</span>
              <strong>{rifle.condition}</strong>
              <small>Float&nbsp;&nbsp;<span>{rifle.float}</span></small>
            </p>
            <svg viewBox="0 0 310 72" preserveAspectRatio="none" aria-hidden="true">
              <path className="hero-line hero-line--end hero-line-shelf hero-line-shelf--outer-right" d="M310 1H136" />
              <path className="hero-line hero-line--elbow hero-line-elbow" d="M136 1L104 58" />
              <g className="hero-line-assembly hero-line-assembly--outer-left">
                <path className="hero-line hero-line--start hero-line-shelf hero-line-shelf--outer-left hero-line-shelf--assembled" d="M104 58H10" />
                <g className="hero-line-marker-shift hero-line-marker-shift--left">
                  <TerminalMarker x={0} y={53} />
                </g>
              </g>
            </svg>
          </aside>

          <aside className="hero-spatial-callout hero-spatial-callout--left" aria-label="Редкость предмета">
            <p>
              <span>{rifle.type} / Редкость</span>
              <strong>{rifle.rarity}</strong>
              <small>{rifle.name}</small>
            </p>
            <svg viewBox="0 0 310 78" preserveAspectRatio="none" aria-hidden="true">
              <path className="hero-line hero-line--end hero-line-shelf hero-line-shelf--outer-left" d="M0 1H168" />
              <path className="hero-line hero-line--elbow hero-line-elbow" d="M168 1L226 65" />
              <g className="hero-line-assembly hero-line-assembly--outer-right">
                <path className="hero-line hero-line--start hero-line-shelf hero-line-shelf--outer-right hero-line-shelf--assembled" d="M226 65H300" />
                <g className="hero-line-marker-shift hero-line-marker-shift--right">
                  <TerminalMarker x={300} y={60} />
                </g>
              </g>
            </svg>
          </aside>

          <aside className="hero-spatial-callout hero-spatial-callout--bottom" aria-label="Происхождение предмета">
            <svg viewBox="0 0 300 112" preserveAspectRatio="none" aria-hidden="true">
              <g className="hero-line-assembly hero-line-assembly--outer-left">
                <path className="hero-line hero-line--start hero-line-shelf hero-line-shelf--outer-left hero-line-shelf--assembled" d="M10 1H110" />
                <g className="hero-line-marker-shift hero-line-marker-shift--left">
                  <TerminalMarker x={0} y={-4} />
                </g>
              </g>
              <path className="hero-line hero-line--elbow hero-line-elbow" d="M110 1L154 99" />
              <path className="hero-line hero-line--end hero-line-shelf hero-line-shelf--outer-right" d="M154 99H300" />
            </svg>
            <p>
              <span>Происхождение</span>
              <strong>{rifle.source}</strong>
            </p>
          </aside>

          <aside className="hero-system-window" aria-label="Сводка предмета">
            <svg viewBox="0 0 350 118" preserveAspectRatio="none" aria-hidden="true">
              <path className="hero-line hero-line--end hero-line-shelf hero-line-shelf--outer-right" d="M350 1H202" />
              <path className="hero-line hero-line--elbow hero-line-elbow" d="M202 1L142 105" />
              <g className="hero-line-assembly hero-line-assembly--outer-left">
                <path className="hero-line hero-line--start hero-line-shelf hero-line-shelf--outer-left hero-line-shelf--assembled" d="M142 105H10" />
                <g className="hero-line-marker-shift hero-line-marker-shift--left">
                  <TerminalMarker x={0} y={100} />
                </g>
              </g>
            </svg>
            <div className="hero-system-window__frame">
              <div className="hero-system-window__title">
                <strong>NYXO</strong>
                <span>01 предмет</span>
              </div>
              <dl>
                <div><dt>Игра</dt><dd>{rifle.game}</dd></div>
                <div><dt>Предмет</dt><dd>M4A1-S</dd></div>
                <div><dt>Цена</dt><dd>{rifle.price}</dd></div>
              </dl>
            </div>
          </aside>
        </div>

        <aside className="hero-index" aria-label="Индекс характеристик">
          <span>[ ХАРАКТЕРИСТИКИ ПРЕДМЕТА ]</span>
          <div className="hero-index__body">
            <div className="hero-index__scanner" aria-hidden="true">
              <img
                className="hero-index__rifle-thumb"
                src="/assets/hero/m4a1s-printstream.png"
                alt=""
              />
              <i /><i /><i />
            </div>
            <dl>
              <div><dt><b>01.</b><span>Тип</span></dt><dd>{rifle.type}</dd></div>
              <div><dt><b>02.</b><span>Редкость</span></dt><dd>{rifle.rarity}</dd></div>
              <div><dt><b>03.</b><span>Состояние</span></dt><dd>{rifle.condition}</dd></div>
              <div><dt><b>04.</b><span>Источник</span></dt><dd>{rifle.source}</dd></div>
            </dl>
          </div>
        </aside>

        <aside className="hero-lot-window" aria-label="Рабочее окно выбранного лота">
          <header><span>Выбранный лот</span><b>● в продаже</b></header>
          <div className="hero-lot-window__content">
            <small>M4A1-S / {rifle.condition}</small>
            <strong>{rifle.price}</strong>
            <dl>
              <div><dt>Float</dt><dd>{rifle.float}</dd></div>
              <div><dt>Комиссия</dt><dd>включена</dd></div>
            </dl>
          </div>
          <div className="hero-lot-window__actions">
            <button className="nyxo-action" type="button" aria-label="Сравнить предмет" aria-pressed={compared} onClick={() => setCompared((value) => !value)}>Сравнить</button>
            <button className="nyxo-action" type="button" aria-label="Добавить в инвентарь" aria-pressed={saved} onClick={() => setSaved((value) => !value)}>В инвентарь</button>
            <a className="nyxo-action" href="#popular">Открыть</a>
          </div>
        </aside>

        <div className="hero-actions">
          <SignalLink
            href="#popular"
            signalLabel="Каталог"
            onPointerEnter={beginMenuCover}
            onPointerLeave={() => setMenuCovering(false)}
          >
            Перейти в каталог
          </SignalLink>
          <a className="secondary-link" href="#popular">Популярные скины</a>
        </div>

        <span className="hero-cursor" aria-hidden="true">
          <i className="hero-cursor__corner hero-cursor__corner--tl" />
          <i className="hero-cursor__corner hero-cursor__corner--tr" />
          <i className="hero-cursor__corner hero-cursor__corner--br" />
          <i className="hero-cursor__corner hero-cursor__corner--bl" />
        </span>
      </div>
    </section>
  )
}
