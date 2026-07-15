# NYXO spatial scan hover — final review

## Overall verdict

**PASS WITH ONE ACCEPTED MINOR DEVIATION.**

The current implementation satisfies the user-visible request for translucent square scan cells and coordinated moving shelves. No Critical or Important findings remain. The only retained Minor item is the absence of pointer-direction bias in shelf positions; it is an accepted design-spec deviation rather than a release blocker because the user explicitly requested squares and moving shelves but did not separately request directional bias.

## Finding counts

- Critical: 0
- Important: 0
- Minor: 1

## Review basis

Reviewed the current workspace because no Git history or comparison range exists:

- design spec: `docs/superpowers/specs/2026-07-13-hero-spatial-scan-hover-design.md`;
- implementation plan: `docs/superpowers/plans/2026-07-13-hero-spatial-scan-hover.md`;
- Task 1–3 briefs, reports, and reviews under `.superpowers/sdd/`;
- current production files: `src/components/Hero.tsx`, `src/styles.css`;
- current test file: `src/components/Hero.test.tsx`;
- parent desktop, mobile, reduced-motion, and endpoint-geometry evidence in `.superpowers/sdd/final-review-package.md`.

Fresh verification performed for this final review:

`npm test -- --run && npm run typecheck && npm run build`

- exit code: 0;
- tests: 9 files passed, 33 tests passed, 0 failed;
- typecheck: passed with no diagnostics;
- production build: passed; 39 modules transformed, build completed in 150ms;
- Vite continues to report the existing 773.48 kB minified Three.js rifle-runtime chunk advisory. The scan feature adds no dependency and does not create that pre-existing bundle concern.

## Specification and interaction compliance

### Scan-zone state and structure

- `Hero` owns a boolean `scanActive` state and derives it from inclusive 20%–80% horizontal and 24%–82% vertical scene bounds (`src/components/Hero.tsx:50`, `src/components/Hero.tsx:138-156`).
- Pointer leave clears both scan and hover state, while locked inspection deliberately keeps the effective `data-scan-active` state enabled (`src/components/Hero.tsx:167-177`, `src/components/Hero.tsx:193-200`).
- The decorative layer is immediately after the coordinate field, is `aria-hidden`, and contains exactly five deterministic cells (`src/components/Hero.tsx:202-207`).
- The scan field is full-scene, clipped, above the decorative scene layer, and non-interactive (`src/styles.css:3784-3790`).
- Cell centers are cursor-relative and clamped to the required central bounds. Their fixed offsets and sizes remain deterministic and within 3.5rem–5.8rem (`src/styles.css:3792-3837`).

### Scan-cell motion

- Idle opacity is zero. Fine-pointer activation uses a staggered 2.8s stepped repeating cycle with a maximum opacity of 0.38, below the 0.46 limit (`src/styles.css:3792-3807`, `src/styles.css:3839-3846`, `src/styles.css:3900-3908`).
- The active lifecycle provides an approximately 140ms stepped rise, 252ms hold, and 280ms stepped exit, within the accepted motion ranges.
- Rifle proximity changes only the cell border/background contrast. It does not introduce rifle scaling or glow (`src/styles.css:3848-3852`).
- Locked inspection slows the cycle to 4.2s (`src/styles.css:3854-3856`).
- Fine-pointer zone exit captures current computed cell opacity, commits it with one layout read, and performs an interruptible 280ms stepped fade. It restores normal CSS animation on rapid re-entry and removes its temporary inline styles and schedules on unmount (`src/components/Hero.tsx:62-125`, `src/components/Hero.tsx:151-155`, `src/components/Hero.tsx:174`, `src/components/Hero.tsx:179-188`).
- The forced layout is confined to a zone-exit handoff rather than pointer tracking. Five cells are sampled, so the implementation is proportionate and does not create sustained layout work.

Parent desktop browser evidence confirms idle cells are absent, active opacity remains restrained, no more than the fixed five cells can appear, and the exit sequence progresses from a live 0.38 value through stepped intermediate opacity to zero rather than snapping.

### Connected shelf motion

- All four SVG networks retain eight horizontal shelf paths, four stationary elbow paths, and four marker wrappers. The marker-bearing shelf and marker are grouped into one direction-aware assembly (`src/components/Hero.tsx:267-330`).
- Shelf and assembly movement uses `transform-box: fill-box`, anchored on the elbow-facing endpoint, with a 620ms transform transition and the existing easing (`src/styles.css:3858-3873`).
- Active calibration uses a restrained `scaleX(1.062)` and staggered 0/55/110/165ms delays (`src/styles.css:3875-3898`). Identity transforms are the base state, so geometry settles on exit.
- Marker-bearing shelves and markers share the same transform instead of relying on a fragile fixed-pixel marker correction. This preserves endpoint attachment at responsive SVG sizes while leaving elbows geometrically stationary.
- Parent browser measurements confirm all four assemblies settle at the expected matrix and every marker-to-shelf endpoint gap is exactly 0px.

### Coarse pointers and reduced motion

- Coarse-pointer CSS fixes cursor variables at the scene center and runs only odd cells on a quiet 6.1s cadence without requiring touch tracking (`src/styles.css:3910-3927`).
- Reduced-motion CSS removes scan cycling and all shelf/assembly/marker displacement, keeps cell centering, and exposes only one low-opacity cell during active interaction (`src/styles.css:3929-3949`).
- Runtime media emulation was unavailable in the supplied QA environment. The focused stylesheet-contract tests verify both fallbacks, and the parent mobile run confirms no horizontal overflow and all cell rectangles remain within the rendered scene width. This is an explicit evidence limitation, not an observed defect.

## Accessibility review

- Decorative scan content is excluded from the accessibility tree with `aria-hidden="true"` and contains no meaningful text.
- Both the scan layer and the existing SVG line network remain non-interactive; the scan layer cannot block pointer or click targets.
- Existing rifle and station controls retain button semantics, accessible names, `aria-pressed`, focus behavior, and keyboard activation.
- Reduced-motion users receive no positional scan, shelf, assembly, or marker motion.
- No marketplace labels, product data, action names, or focus styles were changed.

No accessibility finding remains.

## Performance and regression risk

- Pointer-driven scene transforms remain requestAnimationFrame-throttled.
- Scan animation is limited to five opacity-only cells; shelf movement is transform-only; no unrestricted random generation, new dependency, particle system, filter-heavy effect, or SVG path mutation was introduced.
- The only synchronous geometry read added by this feature occurs once per fine-pointer exit handoff to make the fade render correctly. It is not part of continuous pointer movement.
- Parent QA reports zero horizontal overflow at both 1440×900 and 390×844, the rifle remains visible, and all mobile cell rectangles stay within the scene.
- Existing product data, catalogue action, locked inspection behavior, 3D rifle rendering, annotations, thumbnail, and peripheral workstation data retain automated coverage and remain green.

Regression risk is low. The pre-existing Three.js chunk-size advisory is unrelated to this feature.

## Test-quality review

The Hero suite covers:

- deterministic decorative structure and initial state;
- exact central-zone activation, deactivation, and pointer-leave reset;
- accessible inspection locking and workstation state exposure;
- per-assembly shelf/marker ownership, direction split, and elbow exclusion;
- coarse-pointer, reduced-motion, timing, and transform stylesheet contracts;
- live-opacity exit capture, forced style commit, next-frame fade, rapid re-entry, and unmount cleanup;
- existing rifle data, annotation behavior, rendering, catalogue action, thumbnail, and controls.

The stylesheet-contract assertions cannot replace media-query runtime emulation, but they are focused on the declarations that matter and are supplemented by the supplied desktop/mobile browser evidence. The unavailable coarse-pointer and reduced-motion runtime emulation remains documented; it does not conceal a source-level contradiction.

## Remaining finding

### Minor — pointer direction does not bias shelf positions

The design spec says fine-pointer movement may give line positions a small directional bias without continuous cursor chasing. The implementation performs the same one-time `scaleX(1.062)` calibration for every active zone and exposes no pointer quadrant/direction hook for shelf transforms (`src/components/Hero.tsx:138-165`, `src/styles.css:3875-3878`).

**Adjudication:** accepted, non-blocking Minor deviation. The user asked for squares and moving shelves; directional bias was not separately requested. The implemented shelves do move, stagger, remain connected, and return correctly. Adding direction logic now would expand motion complexity and regression surface without being necessary to satisfy the expressed request. No remediation is required for final acceptance unless directional response becomes a newly explicit product requirement.

## Final acceptance

There are no Critical or Important findings. The feature is suitable for acceptance with the single documented and explicitly adjudicated Minor deviation above.
