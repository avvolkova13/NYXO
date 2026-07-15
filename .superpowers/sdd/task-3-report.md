# Task 3 report — scan-cell and connected shelf motion

## Status

Implementation complete. Automated verification is green. Desktop/mobile visual QA is pending because the browser runtime exposed no available browser backends (`agent.browsers.list()` returned `[]`).

## Exact files changed

- `src/components/Hero.test.tsx`
- `src/components/Hero.tsx`
- `src/styles.css`
- `.superpowers/sdd/task-3-report.md`

No Git commit was created. The workspace is not a Git repository.

## RED/GREEN evidence

### RED

Command:

`npm test -- --run src/components/Hero.test.tsx -t "exposes locked inspection state on the workstation"`

Result: exit 1. Vitest ran 1 focused test (9 skipped); the test failed at `Hero.test.tsx:66` because `.hero-workstation` did not have `data-inspection-locked="false"` (`Received: null`). This is the expected feature-missing failure.

### GREEN

After adding `data-inspection-locked={inspectionLocked}` to `.hero-workstation`, command:

`npm test -- --run src/components/Hero.test.tsx`

Result: exit 0; 1 test file passed, 10 tests passed.

## Full verification output summary

Fresh final command after the last source edit:

`npm test -- --run && npm run typecheck && npm run build`

- Exit code: 0.
- Tests: 9 test files passed; 28 tests passed; 0 failed. Duration 1.16s.
- Typecheck: `tsc -b --pretty false`, exit 0, no diagnostics.
- Build: `tsc -b && vite build`, exit 0; Vite 8.1.4 transformed 39 modules and built in 141ms.
- Build output included the existing advisory that a chunk exceeds 500 kB after minification (`threeRifleRuntime-Bkts68ir.js`, 773.48 kB / 200.28 kB gzip). It is a warning, not a failure, and changing rifle/runtime bundling is outside this task.

## Desktop visual verification — 1440×900

Not executed: after browser runtime setup, `getForUrl("http://127.0.0.1:5174/")` reported `No browser is available`; the required troubleshooting check then returned an empty browser list (`[]`). Therefore visual confirmation of the clamped zone, shelf/elbow/marker connections, obscuration, and clickability remains pending for parent review.

Static/structural evidence available despite the browser limitation:

- The scan field contains exactly five cells (existing Hero test passes).
- The field is absolute with `inset: 0`, z-index 5, hidden overflow, and `pointer-events: none`.
- Cell centers use `clamp(27%, ..., 76%)` for x and `clamp(30%, ..., 75%)` for y.
- Scan opacity peaks at 0.38, below 0.46.
- Shelves use `transform-box: fill-box`; left/right anchors are `right center`/`left center`; elbow selectors are not transformed.
- Base shelf/marker transform is explicitly `none`; active shelves scale to 1.062 and markers translate ±8px.

## Mobile visual verification — 390×844

Not executed for the same unavailable-browser limitation. Visual confirmation of no horizontal overflow remains pending for parent review.

Static responsive evidence:

- Under `(hover: none), (pointer: coarse)`, `--cursor-x` and `--cursor-y` are forced to 50%, preventing touch-following.
- Only odd-numbered cells animate; their quiet periodic duration is 6.1s.
- The scan layer has `overflow: hidden` and does not intercept input.

## Reduced-motion evidence

Media emulation could not be run because no browser backend was available. The final CSS rule was inspected directly:

- `@media (prefers-reduced-motion: reduce)` disables scan-cell animation with `animation: none !important`.
- All scan cells remain at opacity 0 except the first cell while scan-active, which is shown at opacity 0.18.
- The first cell retains `transform: translate(-50%, -50%)` for centering.
- Shelves and marker wrappers have `transform: none !important` and `transition: none !important`, so no displacement occurs.

## Self-review

- The regression test was added before the production state hook and observed failing for the intended reason.
- Only the requested workstation inspection attribute was added to `Hero.tsx`; the rifle model, runtime, rotation, content, layout, copy, and marketplace interactions were not changed.
- Scan cells use deterministic offsets and 3.5rem–5.8rem sizes; surfaces are low-opacity paper/plum with an orange inner edge. No random jitter, particles, RGB/blue/green treatment, or blur-heavy glass was added.
- Idle cells are invisible. Fine-pointer scanning uses a staggered 2.8s stepped cycle; locked inspection uses 4.2s; coarse pointers use a centered 6.1s odd-cell-only cycle.
- Rifle proximity changes cell border/background contrast only; no rifle scale or glow was added.
- Shelf and marker responses use CSS transforms only. SVG `d` geometry and elbow paths were not edited.
- Response delays are 0ms (top), 55ms (left), 110ms (bottom), and 165ms (system window).
- Scan and line layers retain `pointer-events: none`; keyboard/focus code was not changed.

## Concerns

- Required desktop/mobile visual QA and reduced-motion media emulation could not be performed because no browser backend was exposed. Parent visual review is required.
- The production build reports the pre-existing large rifle-runtime chunk advisory; it is outside Task 3 scope.

## Important review fixes — 2026-07-13

### Status

All Important findings from `task-3-review.md` were addressed. The Minor pointer-direction bias was intentionally left unchanged.

### Corrections

- Coarse-pointer odd cells now run the centered 6.1s cycle independently of `data-scan-active`, including before interaction. Even cells remain hidden, and the reduced-motion rule still overrides the coarse animation.
- Shelf calibration now uses `transform 620ms var(--ease-out)`, within the requested 520–720ms range; the existing 0/55/110/165ms response delays remain intact.
- Each marker-bearing shelf and marker now shares one direction-aware `.hero-line-assembly` transform. Assembled shelves are excluded from the standalone shelf transform, so every endpoint is driven by exactly one scale transform at every SVG render size. Fixed ±8px marker translations were removed.
- All eight shelf `d` values and all marker coordinates were preserved. The four elbow paths remain outside the assemblies and geometrically stationary.
- The 2.8s keyframes now provide a 140ms stepped rise (3%–8%), 252ms hold (8%–17%), and 280ms stepped exit (17%–27%). Cells also have a base `opacity 280ms steps(3, end)` transition when fine-pointer scan activation ends.
- The aggregate line-hook test was replaced with scoped connectivity assertions: four assemblies, the correct 3-left/1-right direction split, exactly one direct shelf and one direct marker wrapper per assembly, and no elbow inside an assembly.
- Added focused stylesheet contract coverage for coarse initial animation, 620ms shared calibration, removal of fixed marker shifts, lifecycle timing/exit transition, and reduced-motion assembly reset.

### TDD RED evidence

Geometry RED command:

`npm test -- --run src/components/Hero.test.tsx -t "scopes each marker to one direction-aware shelf assembly"`

Result: exit 1; 1 failed, 9 skipped. Expected four `.hero-line-assembly` elements, received zero.

CSS contract RED command:

`npm test -- --run src/components/Hero.test.tsx -t "coarse-pointer|calibrates shelves|active cell lifetime|shared shelf assembly"`

Result: exit 1; 4 failed, 10 skipped. Failures corresponded to the activation-gated coarse selector, 360ms/fixed-pixel shelf-marker behavior, long cell lifecycle without exit transition, and missing reduced-motion assembly reset.

### Focused GREEN evidence

Corrected contract command:

`npm test -- --run src/components/Hero.test.tsx -t "scopes each marker|coarse-pointer|calibrates shelves|active cell lifetime|shared shelf assembly"`

Result: exit 0; 1 file passed, 5 tests passed, 9 skipped.

Full Hero command:

`npm test -- --run src/components/Hero.test.tsx`

Result: exit 0; 1 file passed, 14 tests passed.

### Fresh full verification

Command:

`npm test -- --run && npm run typecheck && npm run build`

- Exit code: 0.
- Tests: 9 files passed; 32 tests passed; 0 failed. Duration 1.12s.
- Typecheck: `tsc -b --pretty false`, exit 0, no diagnostics.
- Build: `tsc -b && vite build`, exit 0; Vite 8.1.4 transformed 39 modules and built in 150ms.
- Build output: `index-CQqVmtMO.css` 66.10 kB (15.96 kB gzip), `index-D5t9sZYu.js` 222.01 kB (68.98 kB gzip), and `threeRifleRuntime-9hXXGm5_.js` 773.48 kB (200.28 kB gzip).
- The existing Vite advisory for the rifle runtime chunk exceeding 500 kB remains outside Task 3 scope.

### Remaining concerns

- Browser-level endpoint geometry, coarse-pointer rendering, and reduced-motion media emulation remain unverified because the browser runtime exposed no backend in the original Task 3 run. The new DOM/CSS contract tests cover the corrected structure and declarations, but parent visual QA is still required.

## Browser QA exit-fade fix — 2026-07-13

### Root cause and correction

Browser QA demonstrated that removing the active CSS animation immediately exposes the base `opacity: 0`; browsers do not transition from the animation's current computed opacity to the underlying value in this case. The prior CSS-only exit declaration therefore snapped cells off.

`Hero` now performs a fine-pointer exit handoff before React changes `data-scan-active`:

- reads each cell's current computed opacity;
- freezes that value inline while temporarily disabling its animation and transition;
- on the next animation frame, transitions each captured value to zero over `280ms steps(3, end)`;
- clears the frame, timer, and all three inline properties after completion;
- cancels and clears the handoff immediately on rapid re-entry so the normal cycle resumes;
- skips the handoff for coarse pointers so their always-on centered pulse is unaffected;
- performs the same capture when locked inspection is turned off outside the zone;
- cancels scheduled work and removes inline state on unmount.

Cells captured at opacity zero stay at zero throughout the handoff, preventing invisible-cell flashes. Rifle, layout, content, SVG path geometry, and marketplace behavior were not changed.

### TDD RED evidence

Command:

`npm test -- --run src/components/Hero.test.tsx -t "hands live cell opacity into an interruptible exit fade"`

Result: exit 1; 1 failed, 14 skipped. The regression supplied live values `[0, 0.12, 0.26, 0.38, 0]`; immediately after zone exit all cell inline opacity values were empty, proving no handoff occurred.

The first implementation run reached the expected capture/fade/re-entry behavior but still failed unmount cleanup because removing the final properties left `style=""`. Cleanup was tightened to remove the attribute only when no unrelated inline declarations remain.

### Focused GREEN evidence

Command:

`npm test -- --run src/components/Hero.test.tsx -t "hands live cell opacity into an interruptible exit fade"`

Result: exit 0; 1 test passed, 14 skipped.

The regression verifies preserved per-cell opacity, animation suspension, next-frame fade to zero, the 280ms transition declaration, rapid re-entry cleanup, and unmount cleanup.

### Hero GREEN evidence

Command:

`npm test -- --run src/components/Hero.test.tsx`

Result: exit 0; 1 file passed, 15 tests passed.

### Fresh full verification

Command:

`npm test -- --run && npm run typecheck && npm run build`

- Exit code: 0.
- Tests: 9 files passed; 33 tests passed; 0 failed. Duration 1.07s.
- Typecheck: `tsc -b --pretty false`, exit 0, no diagnostics.
- Build: `tsc -b && vite build`, exit 0; Vite 8.1.4 transformed 39 modules and built in 154ms.
- Build output: `index-CQqVmtMO.css` 66.10 kB (15.96 kB gzip), `index-pcLcXQec.js` 223.03 kB (69.32 kB gzip), and `threeRifleRuntime-zbyKzqxz.js` 773.48 kB (200.28 kB gzip).
- The existing Vite large-chunk advisory for the rifle runtime remains outside Task 3 scope.

### Remaining concern

- The browser controller remains unavailable in this worker, so the corrected fade requires parent browser re-verification against the original 1440×900 reproduction.

## Exit-fade style-flush fix — 2026-07-13

### Root cause and correction

Parent browser re-testing showed that the imperative capture still snapped because the browser batched the captured `animation: none`, `transition: none`, and live `opacity` writes with the next-frame `opacity: 0` write. The captured state existed in the DOM API but was never committed as a rendered frame.

After writing all captured inline values, `beginScanCellExit` now performs one synchronous `getBoundingClientRect()` read on the first scan cell. This forces the browser to commit the frozen opacity state before `requestAnimationFrame` schedules the 280ms fade. The read does not modify layout or geometry.

### TDD RED evidence

Command:

`npm test -- --run src/components/Hero.test.tsx -t "hands live cell opacity into an interruptible exit fade"`

Result: exit 1; 1 failed, 14 skipped. The regression expected one synchronous `getBoundingClientRect` layout flush after the freeze writes and observed zero calls.

### Focused GREEN evidence

Command:

`npm test -- --run src/components/Hero.test.tsx -t "hands live cell opacity into an interruptible exit fade"`

Result: exit 0; 1 test passed, 14 skipped. The test now verifies capture, freeze, the synchronous layout flush, next-frame fade, rapid re-entry cleanup, and unmount cleanup.

### Fresh full verification

Command:

`npm test -- --run && npm run typecheck && npm run build`

- Exit code: 0.
- Tests: 9 files passed; 33 tests passed; 0 failed. Duration 1.27s.
- Typecheck: `tsc -b --pretty false`, exit 0, no diagnostics.
- Build: `tsc -b && vite build`, exit 0; Vite 8.1.4 transformed 39 modules and built in 151ms.
- Build output: `index-CQqVmtMO.css` 66.10 kB (15.96 kB gzip), `index-Do0mQ7hV.js` 223.05 kB (69.32 kB gzip), and `threeRifleRuntime-BMPKbWy7.js` 773.48 kB (200.28 kB gzip).
- The existing Vite large-chunk advisory for the rifle runtime remains outside Task 3 scope.

### Remaining concern

- Parent browser re-verification is still required to confirm the committed intermediate frame eliminates the original 1440×900 snap.
