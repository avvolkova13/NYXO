# NYXO Rifle Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Match Sutéra's 111-phase, 4.208-second object rotation cadence while keeping the NYXO rifle completely inside its WebGL surface at every angle.

**Architecture:** Add a pure motion/framing module that converts time to a snapped rotation phase and calculates a safe perspective-camera distance from local object bounds. `RifleModel` consumes those functions after the complete rifle and suppressor assembly is loaded; CSS gives the renderer the full stage width and removes competing pointer/hover transforms.

**Tech Stack:** React 19, TypeScript 7, Three.js 0.185, Vitest 4, vanilla CSS.

## Global Constraints

- One complete revolution lasts exactly `(111 - 10) / 24` seconds.
- Rotation uses exactly 111 visual phases and linear timing.
- X and Z rotation remain fixed; autonomous bobbing and pointer tilt are removed.
- Camera fitting includes the rifle mesh and suppressor and adds a 12% safety margin.
- Reduced-motion mode shows a stable three-quarter pose.
- No new dependencies, image sequences, models, textures, or Hero content changes.

---

### Task 1: Deterministic motion and camera-fit helpers

**Files:**
- Create: `src/components/rifleMotion.ts`
- Create: `src/components/rifleMotion.test.ts`

**Interfaces:**
- Produces: `SUTERA_FRAME_COUNT`, `SUTERA_LOOP_DURATION_SECONDS`, `RIFLE_BASE_YAW`, `rifleMotionAt(elapsedSeconds, reducedMotion)`, and `safeCameraDistance(bounds, verticalFovDegrees, aspect, margin)`.
- `rifleMotionAt` returns `{ frame: number; angle: number }`.
- `safeCameraDistance` consumes axis-aligned local bounds `{ min: Vec3; max: Vec3 }` and returns a positive camera Z distance.

- [ ] **Step 1: Write failing motion tests**

```ts
expect(SUTERA_FRAME_COUNT).toBe(111)
expect(SUTERA_LOOP_DURATION_SECONDS).toBeCloseTo(4.208333, 5)
expect(rifleMotionAt(0, false)).toEqual({ frame: 0, angle: RIFLE_BASE_YAW })
expect(rifleMotionAt(SUTERA_LOOP_DURATION_SECONDS / 2, false).frame).toBe(55)
expect(rifleMotionAt(SUTERA_LOOP_DURATION_SECONDS, false)).toEqual({ frame: 0, angle: RIFLE_BASE_YAW })
expect(rifleMotionAt(2, true)).toEqual({ frame: 0, angle: RIFLE_BASE_YAW })
```

- [ ] **Step 2: Run the tests and verify the expected import failure**

Run: `npm test -- --run src/components/rifleMotion.test.ts`

Expected: FAIL because `./rifleMotion` does not exist.

- [ ] **Step 3: Implement snapped Sutéra timing**

```ts
export const SUTERA_FRAME_COUNT = 111
export const SUTERA_LOOP_DURATION_SECONDS = (SUTERA_FRAME_COUNT - 10) / 24
export const RIFLE_BASE_YAW = -0.46

export function rifleMotionAt(elapsedSeconds: number, reducedMotion: boolean) {
  if (reducedMotion) return { frame: 0, angle: RIFLE_BASE_YAW }
  const wrapped = ((elapsedSeconds % SUTERA_LOOP_DURATION_SECONDS) + SUTERA_LOOP_DURATION_SECONDS) % SUTERA_LOOP_DURATION_SECONDS
  const frame = Math.floor((wrapped / SUTERA_LOOP_DURATION_SECONDS) * SUTERA_FRAME_COUNT) % SUTERA_FRAME_COUNT
  return {
    frame,
    angle: RIFLE_BASE_YAW + (frame / (SUTERA_FRAME_COUNT - 1)) * Math.PI * 2,
  }
}
```

- [ ] **Step 4: Add safe-frustum tests**

```ts
const bounds = { min: { x: -5, y: -1.5, z: -1 }, max: { x: 5, y: 1.5, z: 1 } }
const wide = safeCameraDistance(bounds, 26, 16 / 9, 1.12)
const narrow = safeCameraDistance(bounds, 26, 4 / 3, 1.12)
expect(wide).toBeGreaterThan(0)
expect(narrow).toBeGreaterThan(wide)
```

- [ ] **Step 5: Implement sampled safe framing**

Generate the eight bounds corners, rotate them through 72 evenly spaced Y angles, and calculate the maximum of `z + abs(x) / tan(horizontalFov / 2)` and `z + abs(y) / tan(verticalFov / 2)`. Return that maximum multiplied by the supplied margin.

- [ ] **Step 6: Run helper tests**

Run: `npm test -- --run src/components/rifleMotion.test.ts`

Expected: PASS.

Commit: skipped because this workspace is not a Git repository.

### Task 2: Apply the reference motion to the 3D assembly

**Files:**
- Modify: `src/components/RifleModel.tsx`
- Test: `src/components/rifleMotion.test.ts`

**Interfaces:**
- Consumes: `rifleMotionAt`, `safeCameraDistance`, and `RIFLE_BASE_YAW` from Task 1.
- Preserves: `RifleModel({ active, inspecting })` public component API.

- [ ] **Step 1: Create one `content` group inside the existing `rig`**

Add both the loaded FBX and generated suppressor to `content`, then center the complete assembly once both exist.

- [ ] **Step 2: Store centered local bounds and fit the camera**

Temporarily reset rig rotation, calculate `THREE.Box3().setFromObject(content)`, subtract its center from `content.position`, recalculate the centered bounds, and pass them to `safeCameraDistance`. Call the same fit function from `resize()` after updating `camera.aspect`.

- [ ] **Step 3: Replace layered motion in `render()`**

```ts
const motion = rifleMotionAt(elapsed, reducedMotion)
rig.rotation.set(0.06, motion.angle, -0.055)
rig.position.set(0, 0, 0)
rig.scale.setScalar(1)
```

Remove the current `elapsed * speed`, sine X/Z motion, vertical bob, and active scale interpolation.

- [ ] **Step 4: Verify helper and Hero tests**

Run: `npm test -- --run src/components/rifleMotion.test.ts src/components/Hero.test.tsx`

Expected: PASS.

Commit: skipped because this workspace is not a Git repository.

### Task 3: Remove the WebGL crop and competing CSS transforms

**Files:**
- Modify: `src/styles.css`

**Interfaces:**
- The Hero structure and accessible interaction contracts remain unchanged.

- [ ] **Step 1: Give the WebGL surface the full stage width**

```css
.hero .hero-object--rifle {
  width: 100%;
  max-width: none;
  aspect-ratio: 16 / 9;
}
```

- [ ] **Step 2: Keep the rig fixed in screen space**

```css
.hero-object-rig {
  transform: none;
  transition: none;
}

.hero .hero-object--rifle[data-active='true'],
.hero .hero-object--rifle:focus-visible {
  transform: translate(-50%, -50%);
}
```

- [ ] **Step 3: Run complete verification**

Run: `npm test -- --run && npm run typecheck && npm run build`

Expected: 8+ test files pass, TypeScript exits 0, and Vite produces `dist/`.

- [ ] **Step 4: Visual QA four cycle phases**

Capture the Hero near 0%, 25%, 50%, and 75% of the 4.208-second loop. Confirm muzzle, suppressor, stock, magazine, and grip keep visible space from every WebGL boundary. Repeat at a narrow viewport and confirm the model remains inside the scene.

Commit: skipped because this workspace is not a Git repository.
