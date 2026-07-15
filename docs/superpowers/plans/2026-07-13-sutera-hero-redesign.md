# NYXO Sutera-mechanics Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current Hero with a responsive spatial gaming workstation built around two crossed supplied skin images and real marketplace annotations.

**Architecture:** Keep the implementation inside the existing React and global CSS stack. `Hero.tsx` owns lightweight pointer and item-focus state; SVG connector geometry and all motion remain declarative in CSS. Supplied transparent PNG assets are copied into `public/assets/hero`.

**Tech Stack:** React 19, TypeScript, CSS, SVG, Vitest, Testing Library.

## Global Constraints

- Modify Hero only; do not redesign later sections.
- Use Alumni Sans for display and Golos Text for interface copy.
- Use only `#0A0610`, `#17101F`, `#2B1731`, `#FF4A00`, `#EBFF3F`, and compatible neutral text values.
- All visible text is Russian and all product data is meaningful.
- No continuous 360-degree rotation, green, blue, RGB, WebGL, new dependency, or fake telemetry.

---

### Task 1: Specify the new Hero contract

**Files:**
- Modify: `src/components/Hero.test.tsx`

**Interfaces:**
- Consumes: `Hero()`.
- Produces: assertions for two real item images, real data annotations, CTA preservation, and hover-linked active data.

- [ ] Replace the old selector test with tests for the new spatial Hero.
- [ ] Run `npm test -- --run src/components/Hero.test.tsx` and verify the tests fail because the new images and annotations do not exist.

### Task 2: Add supplied assets and spatial markup

**Files:**
- Add: `public/assets/hero/m4a1s-printstream.png`
- Add: `public/assets/hero/m9-bayonet-doppler.png`
- Modify: `src/components/Hero.tsx`

**Interfaces:**
- Produces: `.hero-stage`, `.hero-object`, `.hero-annotation`, `.hero-system-window`, and real Russian data labels.

- [ ] Copy the two supplied transparent PNGs without altering their pixels.
- [ ] Replace the selected-product console with the crossed composition and four data annotations.
- [ ] Add pointer-position CSS variables and item-hover state.
- [ ] Run the targeted Hero tests and verify they pass.

### Task 3: Implement the Sutera-derived spatial and motion system

**Files:**
- Modify: `src/styles.css`

**Interfaces:**
- Consumes the Hero classes from Task 2.
- Produces responsive grid, connector drawing, marker blink, panel reveal, item hover, idle drift, and reduced-motion behavior.

- [ ] Replace only the current Hero CSS block and its responsive overrides.
- [ ] Keep animation transforms GPU-friendly and causal.
- [ ] Verify 1440, 1024, 768, 430, 390, and 320 pixel layouts in the browser.

### Task 4: Compare, correct, and verify

**Files:**
- Modify as needed: `src/components/Hero.tsx`, `src/styles.css`, `src/components/Hero.test.tsx`.

**Interfaces:**
- Produces the final visual comparison and verified build.

- [ ] Capture Sutera and NYXO Hero references side by side for composition review.
- [ ] Correct any ordinary-landing-page feel, overflow, weak connector hierarchy, or excessive motion.
- [ ] Run `npm test -- --run`, `npm run typecheck`, and `npm run build`.
