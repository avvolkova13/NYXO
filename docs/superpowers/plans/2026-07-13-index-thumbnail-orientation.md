# Vertical Index Thumbnail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the complete rifle vertically inside the existing bottom-left characteristics scanner without changing the central 3D scene or scanner effects.

**Architecture:** Add a dedicated semantic CSS class to the scanner thumbnail, then use a centered 90-degree transform with `object-fit: contain`-style sizing. Keep the scanner container and its pseudo-element animation untouched.

**Tech Stack:** React 19, TypeScript, CSS, Vitest, Testing Library, Vite.

## Global Constraints

- Change only the small rifle thumbnail inside the bottom-left “Характеристики предмета” scanner.
- Do not change the central 3D rifle, Hero composition, callouts, scanner frame, scan line, markers, colors, or animation.
- Preserve existing responsive dimensions.

---

### Task 1: Vertical scanner thumbnail

**Files:**
- Modify: `src/components/Hero.tsx:241-243`
- Modify: `src/components/Hero.test.tsx`
- Modify: `src/styles.css:3463-3481`

**Interfaces:**
- Consumes: existing `.hero-index__scanner` frame and `/assets/hero/m4a1s-printstream.png` asset.
- Produces: `.hero-index__rifle-thumb` presentation contract used only by the characteristics scanner.

- [ ] **Step 1: Write the failing test**

Add a focused assertion inside the workstation-data test:

```tsx
const thumbnail = index.querySelector('.hero-index__rifle-thumb')
expect(thumbnail).toBeInTheDocument()
expect(thumbnail).toHaveAttribute('src', '/assets/hero/m4a1s-printstream.png')
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run:

```bash
npm test -- --run src/components/Hero.test.tsx
```

Expected: failure because `.hero-index__rifle-thumb` does not exist.

- [ ] **Step 3: Add the dedicated thumbnail class**

Change the scanner image to:

```tsx
<img
  className="hero-index__rifle-thumb"
  src="/assets/hero/m4a1s-printstream.png"
  alt=""
/>
```

- [ ] **Step 4: Vertically fit the complete silhouette**

Replace the scanner image rule with:

```css
.hero-index__scanner .hero-index__rifle-thumb {
  position: absolute;
  top: 50%;
  left: 50%;
  width: auto;
  height: min(44%, 3.2rem);
  max-width: none;
  opacity: 0.78;
  transform: translate(-50%, -50%) rotate(90deg);
  transform-origin: center;
}
```

- [ ] **Step 5: Run the focused test and confirm GREEN**

Run:

```bash
npm test -- --run src/components/Hero.test.tsx
```

Expected: all Hero tests pass.

- [ ] **Step 6: Verify desktop and mobile renders**

Open the local Hero at desktop width and at 390 px. Confirm the full thumbnail silhouette stays inside all four scanner borders while the scan line and markers continue moving unchanged.

- [ ] **Step 7: Run full verification**

Run:

```bash
npm test -- --run && npm run typecheck && npm run build
```

Expected: all tests pass, TypeScript exits with code 0, and Vite completes the production build.

The workspace is not a Git repository, so no commit step is available.
