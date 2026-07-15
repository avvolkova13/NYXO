import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'

type PixelHeadingProps = {
  as: 'h1' | 'h2'
  children: ReactNode
  className?: string
  id?: string
  text?: string
}

const pixelScales = [0.2, 0.15, 0.1, 0.05, 0]

function transformText(text: string, textTransform: string) {
  if (textTransform === 'uppercase') return text.toUpperCase()
  if (textTransform === 'lowercase') return text.toLowerCase()
  if (textTransform === 'capitalize') {
    return text.replace(/\b\p{L}/gu, (character) => character.toUpperCase())
  }
  return text
}

function wrapLines(
  context: CanvasRenderingContext2D,
  text: string,
  availableWidth: number,
  singleLine: boolean,
) {
  const lines: string[] = []

  for (const rawLine of text.split('\n')) {
    if (singleLine || context.measureText(rawLine).width <= availableWidth - 10) {
      lines.push(rawLine)
      continue
    }

    let line = ''
    for (const word of rawLine.split(' ')) {
      const next = line ? `${line} ${word}` : word
      if (line && context.measureText(next).width > availableWidth - 10) {
        lines.push(line)
        line = word
      } else {
        line = next
      }
    }
    if (line) lines.push(line)
  }

  return lines
}

export function PixelHeading({ as: Tag, children, className = '', id, text }: PixelHeadingProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef(0)
  const [completed, setCompleted] = useState(false)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const heading = headingRef.current
    if (!heading) return
    let fallbackTimer = 0

    const startSafely = () => {
      setStarted(true)
    }

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setCompleted(true)
      return
    }

    if (!('IntersectionObserver' in window)) {
      startSafely()
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        startSafely()
        observer.disconnect()
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    )

    observer.observe(heading)
    fallbackTimer = window.setTimeout(() => {
      // Some embedded and headless browser contexts never dispatch an initial
      // observer callback. A heading must never remain invisible because of it.
      startSafely()
      observer.disconnect()
    }, 900)

    return () => {
      window.clearTimeout(fallbackTimer)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!started || completed) return

    const heading = headingRef.current
    const canvas = canvasRef.current
    if (!heading || !canvas) return

    let cancelled = false

    const render = () => {
      if (cancelled) return

      const displayContext = canvas.getContext('2d', {
        willReadFrequently: true,
        alpha: true,
      })
      if (!displayContext) {
        setCompleted(true)
        return
      }

      displayContext.imageSmoothingEnabled = false

      const styles = window.getComputedStyle(heading)
      const fontSize = Number.parseFloat(styles.fontSize)
      const lineHeight = Number.parseFloat(styles.lineHeight) || fontSize * 1.2
      const paddingX = Number.parseInt(styles.paddingLeft, 10) + Number.parseInt(styles.paddingRight, 10)
      const paddingY = Number.parseInt(styles.paddingTop, 10) + Number.parseInt(styles.paddingBottom, 10)
      const width = heading.offsetWidth - paddingX
      const height = heading.offsetHeight - paddingY
      const pixelRatio = window.devicePixelRatio || 1

      if (!width || !height || !fontSize) {
        setCompleted(true)
        return
      }

      const scaledWidth = Math.round(width * pixelRatio)
      const scaledHeight = Math.round(height * pixelRatio)
      canvas.width = scaledWidth
      canvas.height = scaledHeight
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      const source = document.createElement('canvas')
      source.width = scaledWidth
      source.height = scaledHeight
      const sourceContext = source.getContext('2d', {
        willReadFrequently: true,
        alpha: true,
      })

      if (!sourceContext) {
        setCompleted(true)
        return
      }

      sourceContext.imageSmoothingEnabled = false
      sourceContext.fillStyle = styles.color
      sourceContext.font = `${styles.fontWeight} ${fontSize * pixelRatio}px ${styles.fontFamily}`
      sourceContext.textAlign = styles.textAlign as CanvasTextAlign
      sourceContext.letterSpacing = `${Number.parseFloat(styles.letterSpacing) * pixelRatio || 0}px`

      const title = transformText(text ?? heading.textContent ?? '', styles.textTransform)
      const lines = wrapLines(
        sourceContext,
        title,
        scaledWidth,
        styles.whiteSpace === 'nowrap',
      )

      lines.forEach((line, index) => {
        const baseline = scaledHeight - (lines.length - 1 - index) * lineHeight * pixelRatio
        if (styles.textAlign === 'center') {
          sourceContext.fillText(line, scaledWidth / 2, baseline)
        } else if (styles.textAlign === 'right' || styles.textAlign === 'end') {
          sourceContext.fillText(line, scaledWidth - 5 * pixelRatio, baseline)
        } else {
          sourceContext.fillText(line, 5 * pixelRatio, baseline)
        }
      })

      const blockSizes = pixelScales.map((scale) => Math.max(1, scale * scaledHeight))
      const start = Date.now()
      const duration = 350
      const steps = 4

      const animate = () => {
        if (cancelled) return

        const progress = Math.min(1, Math.max(0, (Date.now() - start) / duration))
        if (progress === 0) {
          displayContext.clearRect(0, 0, scaledWidth, scaledHeight)
        } else {
          const level = Math.floor(progress * (steps - 1))
          const blockSize = blockSizes[level]
          const reduced = document.createElement('canvas')
          reduced.width = Math.max(1, Math.floor(scaledWidth / blockSize))
          reduced.height = Math.max(1, Math.floor(scaledHeight / blockSize))
          const reducedContext = reduced.getContext('2d')

          if (!reducedContext) {
            setCompleted(true)
            return
          }

          reducedContext.imageSmoothingEnabled = false
          reducedContext.drawImage(source, 0, 0, reduced.width, reduced.height)
          displayContext.clearRect(0, 0, scaledWidth, scaledHeight)
          displayContext.imageSmoothingEnabled = false
          displayContext.drawImage(reduced, 0, 0, scaledWidth, scaledHeight)
        }

        if (progress < 1) {
          animationFrameRef.current = window.requestAnimationFrame(animate)
        } else {
          setCompleted(true)
        }
      }

      animate()
    }

    const fontsReady = document.fonts?.ready ?? Promise.resolve()
    void fontsReady.then(render).catch(() => setCompleted(true))

    return () => {
      cancelled = true
      window.cancelAnimationFrame(animationFrameRef.current)
    }
  }, [completed, started, text])

  return (
    <Tag
      ref={headingRef}
      id={id}
      className={`pixel-heading ${className}`.trim()}
      data-pixel-state={completed ? 'complete' : started ? 'rendering' : 'waiting'}
    >
      {!completed ? (
        <canvas ref={canvasRef} className="pixel-heading__canvas" aria-hidden="true" />
      ) : null}
      <span className="pixel-heading__text" style={{ opacity: completed ? 1 : 0 }}>
        {children}
      </span>
    </Tag>
  )
}
