# Task 3 brief — scan-cell and connected shelf motion

## Context

Tasks 1–2 provide `data-scan-active`, `data-rifle-proximity`, five `.hero-scan-cell` elements, eight direction-aware shelf paths, four elbow hooks, and four direction-aware marker wrappers. Implement the visual behavior without changing Hero layout, rifle runtime, content, or marketplace interactions.

## Files

- Modify `src/components/Hero.test.tsx` only for the locked-state regression test below.
- Modify `src/components/Hero.tsx` only to expose locked inspection state.
- Modify `src/styles.css` for all visual behavior.

## Requirements

### TDD state hook

1. Add a failing test that reads `.hero-workstation`, expects `data-inspection-locked="false"`, clicks the existing rifle inspection button, then expects `data-inspection-locked="true"`.
2. Run the focused test and record RED.
3. Add `data-inspection-locked={inspectionLocked}` to `.hero-workstation` and run the Hero tests GREEN.

### Scan cells

4. `.hero-scan-field` is an absolute, full-scene (`inset: 0`) decorative layer at z-index 5 with `overflow: hidden` and `pointer-events: none`.
5. Position each cell relative to existing `--cursor-x` and `--cursor-y`, but clamp cell centers to x 27%–76% and y 30%–75% of the Hero. This keeps cells out of headline/actions and peripheral windows.
6. Give the five cells deterministic offsets and sizes between 3.5rem and 5.8rem. Use low-opacity paper/plum surfaces with an orange inner edge; no solid white, blur-heavy glass, blue, green, RGB, particles, or random jitter.
7. Idle cells are invisible. While `data-scan-active=true`, cells appear and disappear in a staggered, stepped repeating cycle around 2.6–3.0 seconds. Maximum visible opacity must stay below 0.46.
8. While `data-rifle-proximity=true`, increase border/background contrast slightly without adding scale or glow to the rifle.
9. While `data-inspection-locked=true`, slow the cell cycle to about 4.2 seconds.

### Connected shelf motion

10. Use `transform-box: fill-box` and CSS transforms only; do not edit SVG `d` geometry.
11. Anchor `.hero-line-shelf--outer-left` at `right center` and `.hero-line-shelf--outer-right` at `left center`. On scan-active, scale horizontal shelves outward by roughly 1.055–1.07 so elbow endpoints remain fixed and connected.
12. Move left marker wrappers about -8px and right marker wrappers about +8px so markers remain attached to extended free endpoints.
13. Stagger the top, left, bottom, and system-window responses by approximately 0ms, 55ms, 110ms, and 165ms.
14. Return shelves and markers to identity transforms when scan-active becomes false.
15. Keep elbow paths geometrically stationary; their endpoints are the fixed anchors that prevent gaps.

### Responsive and accessibility motion

16. On coarse pointers, use the default centered cursor variables and animate only odd-numbered cells in a quiet 5.8–6.4 second periodic cycle, without touch-following behavior.
17. Under `prefers-reduced-motion: reduce`, disable cell cycling and all shelf/marker displacement. Preserve centering transform for cells and show only one low-opacity cell while scan-active.
18. Do not intercept pointer events or change keyboard/focus behavior.

### Automated and browser verification

19. Run `npm test -- --run && npm run typecheck && npm run build` and record exact results.
20. Verify the local Hero at desktop 1440×900 and mobile 390×844. On desktop, confirm cells are absent outside the zone, no more than five appear inside it, line shelves remain connected to elbows/markers, and primary UI stays unobscured/clickable. On mobile, confirm the quiet centered fallback and no horizontal overflow.
21. Verify reduced-motion behavior if the browser controller exposes media emulation; otherwise verify the final CSS rule directly and record that limitation.
22. Do not modify the rifle model, rotation, Hero layout, typography, copy, palette, information content, or other sections.
23. Workspace is not a Git repository. Do not commit.

## Required report

Write `.superpowers/sdd/task-3-report.md` containing status, exact files changed, RED/GREEN evidence, full verification output summary, desktop/mobile visual observations, reduced-motion evidence, self-review, and concerns.

Return only status, one-line verification summary, and concerns.
