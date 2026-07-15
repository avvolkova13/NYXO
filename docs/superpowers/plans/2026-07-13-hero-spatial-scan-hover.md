# NYXO Hero Spatial Scan Hover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add cursor-triggered translucent scan cells and coordinated callout shelf movement to the existing NYXO Hero inspection zone.

**Architecture:** Keep the interaction inside the existing `Hero` component, which already owns pointer coordinates and inspection state. Derive a bounded central-zone state from local pointer coordinates, expose that state through data attributes, render one fixed decorative scan-cell layer, and animate existing SVG line segments through CSS transforms without changing marketplace data or the rifle runtime.

**Tech Stack:** React 19, TypeScript, CSS animations/transforms, SVG, Vitest, Testing Library, Vite.

## Global Constraints

- Activate the effect across the central inspection zone, with slightly stronger contrast while the rifle itself is active.
- Render three to five deterministic translucent square cells; do not generate unrestricted random positions.
- Keep cells away from the headline, primary action, price window, and index panel.
- Keep markers connected to their SVG line endpoints and return every line to its original geometry on exit.
- Do not add animation dependencies, particles, glitch tearing, RGB separation, audio, or HUD decoration.
- Coarse pointers receive a quiet centered periodic pulse; `prefers-reduced-motion: reduce` keeps opacity feedback but disables positional motion.
- Do not change the rifle model, its rotation, Hero layout, typography, copy, palette, marketplace data, or accessible labels.
- This workspace is not a Git repository, so commit steps are replaced by explicit verification checkpoints.

---

### Task 1: Central inspection-zone state and scan-cell structure

**Files:**
- Modify: `src/components/Hero.test.tsx`
- Modify: `src/components/Hero.tsx`

**Interfaces:**
- Consumes: existing `sceneRef`, `handlePointerMove`, `resetPointer`, `hovered`, and `inspectionLocked` state.
- Produces: `data-scan-active`, `data-rifle-proximity`, `.hero-scan-field`, and five `.hero-scan-cell` elements for CSS in Task 2.

- [ ] **Step 1: Write the failing structure test**

Add this test to `src/components/Hero.test.tsx`:

```tsx
it('renders a deterministic decorative scan field', () => {
  render(<Hero />)

  const scene = document.querySelector('.hero-workstation')
  const scanField = document.querySelector('.hero-scan-field')

  expect(scene).toHaveAttribute('data-scan-active', 'false')
  expect(scanField).toHaveAttribute('aria-hidden', 'true')
  expect(document.querySelectorAll('.hero-scan-cell')).toHaveLength(5)
})
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npm test -- --run src/components/Hero.test.tsx -t "renders a deterministic decorative scan field"
```

Expected: FAIL because `.hero-scan-field` and `data-scan-active` do not exist.

- [ ] **Step 3: Write the failing zone-state test**

Add this second test:

```tsx
it('activates scanning only inside the central inspection zone', () => {
  render(<Hero />)

  const scene = document.querySelector('.hero-workstation') as HTMLDivElement
  Object.defineProperty(scene, 'getBoundingClientRect', {
    value: () => ({
      width: 1000,
      height: 800,
      top: 0,
      left: 0,
      right: 1000,
      bottom: 800,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }),
  })

  fireEvent.pointerMove(scene, { clientX: 500, clientY: 420 })
  expect(scene).toHaveAttribute('data-scan-active', 'true')

  fireEvent.pointerMove(scene, { clientX: 80, clientY: 80 })
  expect(scene).toHaveAttribute('data-scan-active', 'false')

  fireEvent.pointerLeave(scene)
  expect(scene).toHaveAttribute('data-scan-active', 'false')
})
```

- [ ] **Step 4: Run the focused test and verify RED**

Run:

```bash
npm test -- --run src/components/Hero.test.tsx -t "activates scanning only inside"
```

Expected: FAIL because pointer movement does not update `data-scan-active`.

- [ ] **Step 5: Implement the minimal bounded scan state**

In `src/components/Hero.tsx`, add state:

```tsx
const [scanActive, setScanActive] = useState(false)
```

Inside `handlePointerMove`, after calculating `localX`, `localY`, `x`, and `y`, add:

```tsx
const insideScanZone =
  localX >= bounds.width * 0.2 &&
  localX <= bounds.width * 0.8 &&
  localY >= bounds.height * 0.24 &&
  localY <= bounds.height * 0.82

setScanActive(insideScanZone)
```

Inside `resetPointer`, add:

```tsx
setScanActive(false)
```

Expose both states on `.hero-workstation`:

```tsx
data-scan-active={scanActive || inspectionLocked}
data-rifle-proximity={active}
```

Render this layer immediately after `.hero-coordinate-field`:

```tsx
<div className="hero-scan-field" aria-hidden="true">
  {Array.from({ length: 5 }, (_, index) => (
    <i className="hero-scan-cell" key={index} />
  ))}
</div>
```

- [ ] **Step 6: Run Hero tests and verify GREEN**

Run:

```bash
npm test -- --run src/components/Hero.test.tsx
```

Expected: all Hero tests pass, including the two new scan-field tests.

- [ ] **Step 7: Verification checkpoint**

Record the passing focused-test output before starting line animation work. Do not proceed with failing Hero tests.

---

### Task 2: Connected line-shelf hooks

**Files:**
- Modify: `src/components/Hero.test.tsx`
- Modify: `src/components/Hero.tsx`

**Interfaces:**
- Consumes: `data-scan-active` from Task 1 and the existing `.hero-line`/`.hero-line-marker` SVG structure.
- Produces: direction-aware `.hero-line-shelf`, `.hero-line-elbow`, and `.hero-line-marker-shift` hooks used by Task 3 CSS.

- [ ] **Step 1: Write the failing connected-shelf test**

Add:

```tsx
it('keeps every moving line shelf paired with a connected marker wrapper', () => {
  render(<Hero />)

  expect(document.querySelectorAll('.hero-line-shelf')).toHaveLength(8)
  expect(document.querySelectorAll('.hero-line-elbow')).toHaveLength(4)
  expect(document.querySelectorAll('.hero-line-marker-shift')).toHaveLength(4)
  expect(document.querySelectorAll('.hero-line-shelf--outer-left')).toHaveLength(4)
  expect(document.querySelectorAll('.hero-line-shelf--outer-right')).toHaveLength(4)
})
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
npm test -- --run src/components/Hero.test.tsx -t "keeps every moving line shelf"
```

Expected: FAIL with zero matching shelf and marker-wrapper elements.

- [ ] **Step 3: Add semantic motion hooks without changing path geometry**

For each of the four SVG callouts in `src/components/Hero.tsx`:

- add `hero-line-shelf` plus `hero-line-shelf--outer-left` or `hero-line-shelf--outer-right` to the two horizontal paths, according to the direction of their free outer endpoint;
- add `hero-line-elbow` to the elbow path;
- wrap `TerminalMarker` in a `hero-line-marker-shift` group with the same `--left` or `--right` direction as its connected shelf.

Example:

```tsx
<path className="hero-line hero-line--end hero-line-shelf hero-line-shelf--outer-right" d="M310 1H136" />
<path className="hero-line hero-line--elbow hero-line-elbow" d="M136 1L104 58" />
<path className="hero-line hero-line--start hero-line-shelf hero-line-shelf--outer-left" d="M104 58H10" />
<g className="hero-line-marker-shift hero-line-marker-shift--left">
  <TerminalMarker x={0} y={53} />
</g>
```

Apply the same structure to the left, bottom, and system-window SVGs while preserving every existing `d`, `viewBox`, and marker coordinate.

- [ ] **Step 4: Run Hero tests and verify GREEN**

Run:

```bash
npm test -- --run src/components/Hero.test.tsx
```

Expected: all Hero tests pass and the line-hook counts are exactly 8 shelves, 4 elbows, 4 marker wrappers, 4 left-extending shelves, and 4 right-extending shelves.

- [ ] **Step 5: Verification checkpoint**

Confirm the SVG path geometry strings and marketplace labels are unchanged before styling the hooks.

---

### Task 3: Scan-cell and shelf motion styling

**Files:**
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `data-scan-active`, `data-rifle-proximity`, `.hero-scan-field`, `.hero-scan-cell`, `.hero-line-shelf`, `.hero-line-elbow`, and `.hero-line-marker-shift`.
- Produces: desktop hover behavior, coarse-pointer idle pulse, and reduced-motion fallback.

- [ ] **Step 1: Add the bounded scan-field base styles**

Append the following styles after the final Hero spatial rules in `src/styles.css`:

```css
.hero-scan-field {
  position: absolute;
  inset: 24% 20% 18%;
  z-index: 5;
  overflow: hidden;
  pointer-events: none;
}

.hero-scan-cell {
  --cell-x: 0px;
  --cell-y: 0px;
  --cell-size: 4.5rem;
  position: absolute;
  top: clamp(12%, calc(var(--cursor-y) - 24% + var(--cell-y)), 76%);
  left: clamp(10%, calc(var(--cursor-x) - 20% + var(--cell-x)), 82%);
  width: var(--cell-size);
  aspect-ratio: 1;
  border: 1px solid rgba(244, 239, 232, 0.18);
  background: rgba(244, 239, 232, 0.055);
  box-shadow: inset 0 0 0 1px rgba(255, 74, 0, 0.025);
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.82);
  will-change: transform, opacity;
}

.hero-scan-cell:nth-child(1) { --cell-x: -7rem; --cell-y: -3.5rem; --cell-size: 4.1rem; }
.hero-scan-cell:nth-child(2) { --cell-x: 4.8rem; --cell-y: -5.8rem; --cell-size: 5.4rem; }
.hero-scan-cell:nth-child(3) { --cell-x: 8.4rem; --cell-y: 2.3rem; --cell-size: 3.5rem; }
.hero-scan-cell:nth-child(4) { --cell-x: -8.8rem; --cell-y: 4.6rem; --cell-size: 5.8rem; }
.hero-scan-cell:nth-child(5) { --cell-x: 1.2rem; --cell-y: 6.8rem; --cell-size: 4.6rem; }
```

- [ ] **Step 2: Add staggered stepped cell behavior**

```css
.hero-workstation[data-scan-active='true'] .hero-scan-cell {
  animation: hero-scan-cell-cycle 1.8s steps(1, end) both;
}

.hero-workstation[data-scan-active='true'] .hero-scan-cell:nth-child(2) { animation-delay: 90ms; }
.hero-workstation[data-scan-active='true'] .hero-scan-cell:nth-child(3) { animation-delay: 170ms; }
.hero-workstation[data-scan-active='true'] .hero-scan-cell:nth-child(4) { animation-delay: 250ms; }
.hero-workstation[data-scan-active='true'] .hero-scan-cell:nth-child(5) { animation-delay: 330ms; }

.hero-workstation[data-rifle-proximity='true'] .hero-scan-cell {
  border-color: rgba(255, 74, 0, 0.28);
  background: rgba(244, 239, 232, 0.075);
}

@keyframes hero-scan-cell-cycle {
  0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.82); }
  12% { opacity: 0.18; transform: translate(-50%, -50%) scale(0.94); }
  28%, 52% { opacity: 0.42; transform: translate(-50%, -50%) scale(1); }
  68% { opacity: 0.16; transform: translate(-50%, -50%) scale(1.04); }
}
```

- [ ] **Step 3: Add coordinated line-shelf calibration**

```css
.hero-line-shelf,
.hero-line-marker-shift {
  transform-box: fill-box;
  transition: transform 620ms var(--ease-out);
}

.hero-line-shelf--outer-left { transform-origin: right center; }
.hero-line-shelf--outer-right { transform-origin: left center; }

.hero-workstation[data-scan-active='true'] .hero-line-shelf--outer-left,
.hero-workstation[data-scan-active='true'] .hero-line-shelf--outer-right {
  transform: scaleX(1.065);
}

.hero-workstation[data-scan-active='true'] .hero-line-marker-shift--left { transform: translateX(-8px); }
.hero-workstation[data-scan-active='true'] .hero-line-marker-shift--right { transform: translateX(8px); }

.hero-spatial-callout--left .hero-line-shelf,
.hero-spatial-callout--left .hero-line-marker-shift { transition-delay: 55ms; }
.hero-spatial-callout--bottom .hero-line-shelf,
.hero-spatial-callout--bottom .hero-line-marker-shift { transition-delay: 110ms; }
.hero-system-window .hero-line-shelf,
.hero-system-window .hero-line-marker-shift { transition-delay: 165ms; }
```

- [ ] **Step 4: Add coarse-pointer and reduced-motion behavior**

```css
@media (hover: none), (pointer: coarse) {
  .hero-scan-field {
    inset: 30% 8% 22%;
  }

  .hero-scan-cell {
    top: 50%;
    left: 50%;
  }

  .hero-scan-cell:nth-child(odd) {
    animation: hero-scan-cell-cycle 5.8s steps(1, end) infinite;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-scan-cell,
  .hero-line-shelf,
  .hero-line-elbow,
  .hero-line-marker-shift {
    animation: none !important;
    transform: none !important;
    transition: opacity 120ms linear !important;
  }

  .hero-workstation[data-scan-active='true'] .hero-scan-cell:nth-child(3) {
    opacity: 0.18;
  }
}
```

- [ ] **Step 5: Run automated verification**

Run:

```bash
npm test -- --run && npm run typecheck && npm run build
```

Expected: 0 failing tests, TypeScript exits 0, and Vite build exits 0. The existing large Three.js chunk warning is informational and is not introduced by this feature.

- [ ] **Step 6: Desktop browser verification**

At `http://localhost:5173/`, verify at a 1440×900 viewport:

- outside the central zone, all five cells are invisible and line shelves rest at their original positions;
- entering the zone reveals no more than five low-opacity cells around the pointer;
- approaching the rifle strengthens cell borders without covering the rifle;
- all four line groups move once, remain connected to their markers, and return on exit;
- headline, catalogue button, system window, lot window, and index remain unobscured and clickable.

- [ ] **Step 7: Mobile and reduced-motion browser verification**

Verify at 390×844 and with reduced motion enabled:

- mobile shows a quiet centered pulse without touch-following behavior;
- no cell clips outside the central object region;
- reduced motion removes positional shifts and retains only a small opacity response;
- no horizontal overflow is introduced.

- [ ] **Step 8: Final verification checkpoint**

Capture fresh automated output and browser geometry evidence before reporting completion. Because the workspace has no Git repository, preserve the edited files in place without merge, branch, or commit actions.
