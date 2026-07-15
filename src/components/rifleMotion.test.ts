import { describe, expect, it } from 'vitest'

import {
  RIFLE_BASE_YAW,
  SUTERA_FRAME_COUNT,
  SUTERA_LOOP_DURATION_SECONDS,
  cameraSafetyMargin,
  rifleMotionAt,
  safeCameraDistance,
} from './rifleMotion'

describe('Sutera-derived rifle motion', () => {
  it('maps the reference duration to 111 deterministic phases', () => {
    expect(SUTERA_FRAME_COUNT).toBe(111)
    expect(SUTERA_LOOP_DURATION_SECONDS).toBeCloseTo(4.208333, 5)
    expect(rifleMotionAt(0, false)).toEqual({
      frame: 0,
      angle: RIFLE_BASE_YAW,
    })
    expect(rifleMotionAt(SUTERA_LOOP_DURATION_SECONDS / 2, false).frame).toBe(55)
    expect(rifleMotionAt(SUTERA_LOOP_DURATION_SECONDS, false)).toEqual({
      frame: 0,
      angle: RIFLE_BASE_YAW,
    })
  })

  it('holds the authored three-quarter pose when motion is reduced', () => {
    expect(rifleMotionAt(2, true)).toEqual({
      frame: 0,
      angle: RIFLE_BASE_YAW,
    })
  })

  it('moves the camera farther away when the viewport narrows', () => {
    const bounds = {
      min: { x: -5, y: -1.5, z: -1 },
      max: { x: 5, y: 1.5, z: 1 },
    }

    const wide = safeCameraDistance(bounds, 26, 16 / 9, 1.12)
    const narrow = safeCameraDistance(bounds, 26, 4 / 3, 1.12)

    expect(wide).toBeGreaterThan(0)
    expect(narrow).toBeGreaterThan(wide)
  })

  it('adds extra canvas-edge protection on portrait viewports', () => {
    expect(cameraSafetyMargin(16 / 9)).toBe(1.12)
    expect(cameraSafetyMargin(0.75)).toBe(1.32)
  })
})
