# NYXO Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for behavioral work. This greenfield workspace cannot initialize Git because `.git` is write-protected, so verification replaces commit checkpoints.

**Goal:** Build one production-quality Russian landing page for the NYXO gaming-skins marketplace using the approved Controlled Heat direction.

**Architecture:** A Vite React TypeScript application with semantic section components, typed mock product data, native CSS for the design system and causal motion, and Vitest/Testing Library for behavior and content verification. Product media uses honest neutral placeholders because the brief forbids image generation and supplies no assets.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library, jsdom, `@fontsource-variable/alumni-sans`, `@fontsource-variable/golos-text`.

## Global Constraints

- Build only the landing page with exactly Hero, Popular Now, How It Works, Inspection, FAQ and Footer.
- All user-facing interface copy is Russian and the supplied copy is preserved verbatim.
- Use Void Plum `#0A0610`, Raised Plum `#17101F`, Bruised Plum `#2B1731`, Mineral White `#F4EFE8`, Ash Lilac `#A79CAA`, Acid Orange `#FF4A00`, Hot Coral `#FF6A52`, Toxic Yellow `#EBFF3F`, Afterimage Magenta `#7D164F`.
- Alumni Sans is the display face and Golos Text is the interface face.
- Signal Layer is selective: primary CTA, active featured item and important selected states only.
- No casino, crypto, generic cyberpunk, RGB, luxury showroom, Locker inheritance or invented marketing claims.
- Product arrays stay outside JSX and use a typed model that can be replaced by APIs.
- Keyboard access, visible focus, reduced motion and zero horizontal overflow are required.

---

### Task 1: Greenfield scaffold and typed data

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`
- Create: `src/types/product.ts`, `src/data/products.ts`
- Test: `src/data/products.test.ts`

**Interfaces:**
- Produces `Product` with `id`, `name`, `game`, `price`, `condition`, optional `attribute`, `attributeLabel`, `tone`, and `featured`.
- Produces `products: Product[]` and `featuredProduct: Product`.

- [ ] Write a failing test importing the missing data module and asserting at least five items, one featured item and complete required fields.
- [ ] Install dependencies and run `npm test -- src/data/products.test.ts`; verify the module-not-found failure.
- [ ] Add the typed mock data module with an explicit mock-data comment.
- [ ] Re-run the test and verify it passes.

### Task 2: Semantic landing structure and copy fidelity

**Files:**
- Create: `src/main.tsx`, `src/App.tsx`
- Create: `src/components/Header.tsx`, `Hero.tsx`, `PopularNow.tsx`, `HowItWorks.tsx`, `Inspection.tsx`, `FAQ.tsx`, `Footer.tsx`
- Test: `src/App.test.tsx`, `src/components/FAQ.test.tsx`

**Interfaces:**
- `App` renders one `main` and the required section anchors `hero`, `popular`, `how`, `inspection`, `faq`.
- `FAQ` renders four native `details` disclosures with the supplied questions and answers.

- [ ] Write failing tests for the single H1, required section headings, CTA destinations, supplied step copy, four FAQ questions and footer links.
- [ ] Run the tests and verify failures are caused by missing components.
- [ ] Implement the minimal semantic React structure using the supplied Russian copy only.
- [ ] Re-run tests and verify they pass.

### Task 3: Reusable marketplace components and Signal Layer behavior

**Files:**
- Create: `src/components/SignalLink.tsx`, `ProductMedia.tsx`, `ProductCard.tsx`, `SectionHeading.tsx`
- Modify: `src/components/Hero.tsx`, `PopularNow.tsx`, `Inspection.tsx`
- Test: `src/components/SignalLink.test.tsx`, `src/components/ProductCard.test.tsx`

**Interfaces:**
- `SignalLink` accepts anchor props plus `signalLabel` and renders a real link with a non-decorative signal layer hidden from assistive technology only when it duplicates the visible action.
- `ProductCard` accepts `product`, `size` and `active`; it always exposes product identity and price in text.
- `ProductMedia` accepts a product and creates an honest placeholder with an accessible label, not a fake product render.

- [ ] Write failing tests for link semantics, accessible names and product data rendering.
- [ ] Run the tests and confirm the expected missing-component failures.
- [ ] Implement the reusable components and refactor the three product-led sections.
- [ ] Re-run the focused and full test suites.

### Task 4: Controlled Heat visual system and responsive behavior

**Files:**
- Create: `src/styles.css`
- Modify: all section components only where class names or mobile controls are required.

**Interfaces:**
- CSS variables expose the approved color, typography, spacing, radius and focus tokens.
- Responsive states cover desktop, tablet, `430px`, `390px`, `360px` and `320px` widths.

- [ ] Add font imports and global semantic tokens.
- [ ] Build the asymmetric Hero, editorial Popular composition, connected How It Works flow, inspection comparison, accessible FAQ and structured Footer.
- [ ] Add selective transform-only Signal Layer behavior and visible `:focus-visible` states.
- [ ] Add `prefers-reduced-motion` overrides and mobile navigation behavior without horizontal overflow.
- [ ] Run unit tests and TypeScript after styling changes.

### Task 5: Build and browser QA

**Files:**
- Modify only files implicated by verified defects.

**Verification:**
- `npm test`
- `npm run typecheck`
- `npm run build`
- Browser checks at 1440x1000, 1024x900, 768x1024, 430x900, 390x844, 360x800 and 320x720.

- [ ] Verify headings, CTA anchors, FAQ interaction and keyboard focus.
- [ ] Verify no horizontal overflow and no console errors at every viewport.
- [ ] Capture desktop and mobile screenshots for art-direction review.
- [ ] Review as Art Director, UX Lead and UI Designer; fix all High and Medium issues.
- [ ] Re-run the complete verification commands after the final fix.

