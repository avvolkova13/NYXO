# Task 3 re-review — scan-cell and connected shelf motion

## Verdicts

### Specification compliance: PASS WITH MINOR DEVIATION

All five prior Important findings are resolved in the current implementation. The only remaining code-level deviation is the previously reported pointer-direction shelf bias, which the fix report explicitly leaves unchanged. Required desktop/mobile and reduced-motion browser QA remains pending because no browser backend was available; this is an outstanding verification limitation rather than a newly observed source defect.

### Code quality: PASS

The fixes replace the fragile fixed marker offsets with shared direction-aware SVG assemblies and add focused DOM/stylesheet contract coverage for the previously untested behaviors. The structure is readable, preserves all path geometry, and keeps reduced-motion and pointer-event safeguards explicit.

## Prior Important finding resolution

### I1 — coarse-pointer initial fallback: RESOLVED

- References: `src/styles.css:3910-3927`, `src/components/Hero.test.tsx:117-124`
- Odd cells now animate at 6.1 seconds directly under the coarse-pointer media query, without a `data-scan-active` gate. Cursor variables remain forced to 50%, even cells remain inactive, and the later reduced-motion rule overrides the animation.

### I2 — 360 ms shelf calibration: RESOLVED

- References: `src/styles.css:3858-3863`, `src/components/Hero.test.tsx:126-135`
- Shelves and assemblies now use the existing easing with a 620 ms transform transition, inside the specified 520–720 ms range. The required 0/55/110/165 ms callout delays remain intact.

### I3 — marker/shelf endpoint detachment: RESOLVED

- References: `src/components/Hero.tsx:199-254`, `src/styles.css:3858-3898`, `src/components/Hero.test.tsx:98-115`
- Each marker-bearing shelf and its marker wrapper now share one `.hero-line-assembly` scale transform. The group bounding box is anchored on the elbow-facing side, so the shelf free endpoint and marker are moved by the same transform at every rendered SVG width. Assembled shelves are excluded from the standalone shelf transform, preventing double scaling. All four elbows remain outside the assemblies and all `d` geometry is unchanged.

### I4 — cell lifetime and zone exit: RESOLVED

- References: `src/styles.css:3792-3807`, `src/styles.css:3900-3908`, `src/components/Hero.test.tsx:137-142`
- The 2.8 second cycle now has a 140 ms stepped rise from 3% to 8%, a 252 ms hold from 8% to 17%, and a 280 ms stepped exit from 17% to 27%. The base 280 ms stepped opacity transition provides the zone-exit fade after the active animation is removed.

### I5 — missing behavioral contract coverage: RESOLVED

- References: `src/components/Hero.test.tsx:98-148`
- The suite now verifies assembly ownership and direction, elbow exclusion, coarse-pointer animation before activation, 620 ms calibration, removal of fixed pixel translations, cell lifecycle/exit declarations, and reduced-motion assembly reset.
- Focused re-review command passed: 1 file passed, 5 tests passed, 9 skipped.
- Browser-rendered endpoint geometry and media emulation are still not evidenced because the original browser runtime exposed no backend. The source contracts materially close the prior automated-coverage gap, but final visual acceptance remains for parent QA.

## Remaining findings

### Critical

None.

### Important

None.

### Minor

#### M1. Pointer movement still provides no directional shelf bias

- References: `src/components/Hero.tsx:64-96`, `src/styles.css:3875-3878`
- The design spec asks for a small pointer-direction bias without continuous cursor chasing. The implementation still applies the same `scaleX(1.062)` calibration in every active direction and exposes no direction/quadrant hook for line positions.
- This is unchanged from the prior review and was intentionally deferred according to the appended fix report.

## Verification evidence

Re-review command:

`npm test -- --run src/components/Hero.test.tsx -t "scopes each marker|coarse-pointer|calibrates shelves|active cell lifetime|shared shelf assembly"`

- Exit code: 0.
- Result: 1 test file passed; 5 tests passed; 9 skipped.

The appended fix report records a fresh full run with 9 files/32 tests passing, typecheck passing, and build passing. No production files were modified during this re-review.

## Finding counts

- Critical: 0
- Important: 0
- Minor: 1
