# NYXO Retro Gaming Station Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recompose the existing NYXO landing as one tactile retro gaming workstation while preserving structure, Russian copy and marketplace usability.

**Architecture:** Keep the current React/Vite component boundaries and typed mock data. Add local state only to Hero selection, inventory selection and inspection view switching; express the station language through semantic markup and a rebuilt native-CSS system with no new runtime dependencies.

**Tech Stack:** React 19, TypeScript, Vite, native CSS, Vitest, Testing Library

## Global Constraints

- No generated or external images.
- No new landing sections or independent routes.
- No copy rewrites beyond necessary functional control labels `Выбрать`, `Выбрано`, `Полный вид` and `Детали покрытия`.
- Alumni Sans headings, Golos Text interface.
- Acid orange is the only dominant accent; toxic yellow is a rare confirmation/focus signal.
- No green, blue, glassmorphism, glitch, scanlines, particles, casino, crypto, cyberpunk, HUD or copied Shopify objects.

---

### Task 1: Specify workstation interactions with failing tests

**Files:**
- Create: `src/components/Hero.test.tsx`
- Create: `src/components/PopularNow.test.tsx`
- Create: `src/components/Inspection.test.tsx`

**Interfaces:**
- Consumes: existing `Hero`, `PopularNow`, `Inspection` exports and `products` mock data.
- Produces: behavioral contracts for product selection and inspection view switching.

- [ ] **Step 1:** Test that selecting `AWP «История о драконе»` in Hero updates the active readouts and pressed state.
- [ ] **Step 2:** Test that selecting an inventory module in Popular Now updates the featured heading, price and pressed state.
- [ ] **Step 3:** Test that `Полный вид` and `Детали покрытия` are accessible pressed controls and update the media accessible name.
- [ ] **Step 4:** Run `npm test -- --run src/components/Hero.test.tsx src/components/PopularNow.test.tsx src/components/Inspection.test.tsx` and confirm failures are caused by missing controls.

### Task 2: Implement meaningful station behavior and markup

**Files:**
- Modify: `src/components/Hero.tsx`
- Modify: `src/components/PopularNow.tsx`
- Modify: `src/components/ProductCard.tsx`
- Modify: `src/components/ProductMedia.tsx`
- Modify: `src/components/Inspection.tsx`
- Modify: `src/components/SignalLink.tsx`
- Modify: `src/components/HowItWorks.tsx`
- Modify: `src/components/FAQ.tsx`
- Modify: `src/components/Header.tsx`
- Modify: `src/components/Footer.tsx`

**Interfaces:**
- Consumes: `Product`, `products`, `featuredProduct` and existing anchor destinations.
- Produces: `ProductCard` optional `onSelect` behavior, Hero selector buttons, Popular inventory buttons and Inspection view buttons.

- [ ] **Step 1:** Add Hero local selection state and real product selector buttons that update its screen, price, game, condition and attribute.
- [ ] **Step 2:** Add Popular Now local selection state, one selected display and selectable product modules with `aria-pressed`.
- [ ] **Step 3:** Extend `ProductCard` with optional `onSelect`, show `Выбрать` or `Выбрано`, and preserve article semantics.
- [ ] **Step 4:** Add Inspection `full/detail` state and two pressed controls that update `ProductMedia` view.
- [ ] **Step 5:** Add functional panel headers, control decks and chassis wrappers using only existing copy and real product data.
- [ ] **Step 6:** Run the three interaction tests and the full test suite; expect all tests to pass.

### Task 3: Replace the visual system with a connected physical workstation

**Files:**
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: workstation class names introduced in Task 2.
- Produces: one connected dark station chassis, recessed displays, matte panels, physical controls, responsive layouts and reduced-motion behavior.

- [ ] **Step 1:** Replace flat background/card treatments with global chassis, panel, bezel, screen and control tokens.
- [ ] **Step 2:** Recompose Hero as a dense integrated console that fits the first desktop viewport.
- [ ] **Step 3:** Recompose Popular Now as selected display plus inventory slot bank, not an equal-card grid.
- [ ] **Step 4:** Style How It Works as one operation rail and Inspection as an interactive examination console.
- [ ] **Step 5:** Carry the same material system into navigation, FAQ and footer with 44 px mobile controls.
- [ ] **Step 6:** Add only causal transform/opacity motion and a complete reduced-motion override.

### Task 4: Verify behavior, build and rendered quality

**Files:**
- Modify only if verification exposes a reproducible issue.

**Interfaces:**
- Consumes: completed landing implementation.
- Produces: verified responsive production build.

- [ ] **Step 1:** Run `npm run typecheck`, `npm test -- --run` and `npm run build`; require zero failures.
- [ ] **Step 2:** Inspect desktop, tablet and mobile at 320, 390, 430, 768, 1024 and 1440 px; require zero horizontal overflow.
- [ ] **Step 3:** Verify Hero selection, inventory selection, inspection switching, FAQ disclosure, focus visibility and reduced-motion CSS.
- [ ] **Step 4:** Compare with the captured current version and confirm the new result reads as one gaming workstation while remaining a practical marketplace.

