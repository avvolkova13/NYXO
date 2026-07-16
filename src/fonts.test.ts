import { describe, expect, it } from 'vitest'

import mainSource from './main.tsx?raw'
import styles from './styles.css?raw'

describe('local font loading', () => {
  it('loads Alumni Sans and Golos Text through explicit local font faces', () => {
    expect(mainSource).not.toContain('@fontsource-variable')
    expect(styles).toMatch(/@font-face\s*{[^}]*font-family:\s*'Alumni Sans Variable'/s)
    expect(styles).toMatch(/@font-face\s*{[^}]*font-family:\s*'Golos Text Variable'/s)
    expect(styles).toContain('alumni-sans-cyrillic-wght-normal.woff2')
    expect(styles).toContain('alumni-sans-latin-wght-normal.woff2')
    expect(styles).toContain('golos-text-cyrillic-wght-normal.woff2')
    expect(styles).toContain('golos-text-latin-wght-normal.woff2')
    expect(styles).toMatch(/font-weight:\s*100 900/)
    expect(styles).toMatch(/font-weight:\s*400 900/)
    expect(styles).toContain('font-display: swap')
  })

  it('uses the declared variable-family names consistently', () => {
    expect(styles).not.toMatch(/font(?:-family|\s*):[^;\n]*'Alumni Sans'(?! Variable)/)
    expect(styles).not.toMatch(/font(?:-family|\s*):[^;\n]*'Golos Text'(?! Variable)/)
  })
})
