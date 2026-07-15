export const SUTERA_FRAME_COUNT = 111
export const SUTERA_LOOP_DURATION_SECONDS = (SUTERA_FRAME_COUNT - 10) / 24
export const RIFLE_BASE_YAW = -0.46

export type MotionVector3 = {
  x: number
  y: number
  z: number
}

export type MotionBounds = {
  min: MotionVector3
  max: MotionVector3
}

export function cameraSafetyMargin(aspect: number) {
  return aspect < 1 ? 1.32 : 1.12
}

export function rifleMotionAt(elapsedSeconds: number, reducedMotion: boolean) {
  if (reducedMotion) {
    return { frame: 0, angle: RIFLE_BASE_YAW }
  }

  const wrapped = (
    (elapsedSeconds % SUTERA_LOOP_DURATION_SECONDS)
    + SUTERA_LOOP_DURATION_SECONDS
  ) % SUTERA_LOOP_DURATION_SECONDS
  const frame = Math.floor(
    (wrapped / SUTERA_LOOP_DURATION_SECONDS) * SUTERA_FRAME_COUNT,
  ) % SUTERA_FRAME_COUNT

  return {
    frame,
    angle: RIFLE_BASE_YAW
      + (frame / (SUTERA_FRAME_COUNT - 1)) * Math.PI * 2,
  }
}

export function safeCameraDistance(
  bounds: MotionBounds,
  verticalFovDegrees: number,
  aspect: number,
  margin: number,
) {
  const verticalHalfFov = verticalFovDegrees * Math.PI / 360
  const horizontalHalfFov = Math.atan(
    Math.tan(verticalHalfFov) * Math.max(aspect, 0.01),
  )
  const tanVertical = Math.tan(verticalHalfFov)
  const tanHorizontal = Math.tan(horizontalHalfFov)
  const xs = [bounds.min.x, bounds.max.x]
  const ys = [bounds.min.y, bounds.max.y]
  const zs = [bounds.min.z, bounds.max.z]
  let minimumDistance = 0

  for (let sample = 0; sample < 72; sample += 1) {
    const angle = sample / 72 * Math.PI * 2
    const cosine = Math.cos(angle)
    const sine = Math.sin(angle)

    for (const x of xs) {
      for (const y of ys) {
        for (const z of zs) {
          const rotatedX = x * cosine + z * sine
          const rotatedZ = -x * sine + z * cosine
          minimumDistance = Math.max(
            minimumDistance,
            rotatedZ + Math.abs(rotatedX) / tanHorizontal,
            rotatedZ + Math.abs(y) / tanVertical,
          )
        }
      }
    }
  }

  return Math.max(0.1, minimumDistance * margin)
}
