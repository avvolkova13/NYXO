# Task 2 brief — connected line-shelf hooks

## Context

Task 1 added scan-zone state and five inert scan cells. This task adds only semantic SVG classes and marker wrappers so CSS can animate horizontal shelves while preserving every path coordinate and information label. Do not add CSS yet.

## Files

- Modify `src/components/Hero.test.tsx`
- Modify `src/components/Hero.tsx`

## Requirements

1. Follow strict TDD: add the failing hook-count test, run and record RED, add minimal markup hooks, then run the full Hero test file.
2. Across the four SVG networks, add `hero-line-shelf` to each horizontal start/end path: exactly 8 shelves.
3. Add one direction class to each shelf according to its free outer endpoint: exactly 4 `.hero-line-shelf--outer-left` and 4 `.hero-line-shelf--outer-right`.
4. Add `hero-line-elbow` to each diagonal/elbow path: exactly 4.
5. Wrap each existing `TerminalMarker` in one `<g>` with `hero-line-marker-shift` and the appropriate marker direction class: exactly 4 wrappers.
6. Top callout: end shelf outer-right; start shelf outer-left; marker wrapper `--left`.
7. Left callout: end shelf outer-left; start shelf outer-right; marker wrapper `--right`.
8. Bottom callout: start shelf outer-left; end shelf outer-right; marker wrapper `--left`.
9. System window: end shelf outer-right; start shelf outer-left; marker wrapper `--left`.
10. Preserve every existing `d`, `viewBox`, SVG dimension, `TerminalMarker` coordinate, marketplace datum, accessible label, and non-SVG structure.
11. Add a test expecting 8 shelves, 4 elbows, 4 marker wrappers, 4 outer-left shelves, and 4 outer-right shelves.
12. Workspace is not a Git repository. Do not commit.

## Required report

Write `.superpowers/sdd/task-2-report.md` containing status, files changed, RED evidence, GREEN command/counts, confirmation that SVG geometry strings were preserved, self-review, and concerns.

Return only status, one-line test summary, and concerns.
