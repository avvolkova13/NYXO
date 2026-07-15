# Task 1 brief — central inspection-zone state and scan-cell structure

## Context

NYXO has an existing full-screen React Hero with one 3D rifle, spatial callouts, pointer-driven CSS variables, and tested marketplace data. Add only the state and DOM hooks for a bounded central scan interaction. Do not style the new scan cells in this task.

## Files

- Modify `src/components/Hero.test.tsx`
- Modify `src/components/Hero.tsx`

## Requirements

1. Follow strict TDD: add a failing test, run it and record the expected failure, then implement the minimum code and run the complete Hero test file.
2. Add `scanActive` boolean state, initially `false`.
3. In the existing pointer handler, calculate whether the pointer is inside the central zone bounded by 20%–80% of scene width and 24%–82% of scene height. Update `scanActive` from that calculation.
4. Reset `scanActive` to `false` on scene pointer leave.
5. Expose `data-scan-active={scanActive || inspectionLocked}` and `data-rifle-proximity={active}` on `.hero-workstation`.
6. Immediately after `.hero-coordinate-field`, render `.hero-scan-field[aria-hidden="true"]` containing exactly five `<i className="hero-scan-cell" />` children generated from a fixed array/range.
7. Add one test verifying the scan field, `aria-hidden`, five cells, and initial false state.
8. Add one test mocking a 1000×800 scene rect, moving at (500,420) to expect active true, then (80,80) and pointer leave to expect false.
9. Do not change rifle rendering, rotation, marketplace data, copy, labels, layout, styles, or other components.
10. Workspace is not a Git repository. Do not commit.

## Required report

Write `.superpowers/sdd/task-1-report.md` containing:

- status: DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED;
- exact files changed;
- RED command and expected failure evidence;
- GREEN command and passing counts;
- self-review notes and concerns.

Return only the status, one-line test summary, and concerns in the final message.
