# NYXO Remaining Marketplace Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete every remaining NYXO marketplace route with one coherent mock purchase flow while preserving the approved Home and Catalog visual systems.

**Architecture:** Add a versioned client marketplace store backed by defensive `localStorage`, then implement each route in the required product-flow order. Pages share the existing History API router, Header/Footer, product data, media fallback, COINS formatting, and catalog visual tokens; mock actions create real local state transitions that later APIs can replace.

**Tech Stack:** React 19, TypeScript 7, Vite 8, Vitest, Testing Library, existing History API router and CSS.

## Global Constraints

- Do not change the approved Home composition, Hero, or visual direction.
- Reuse existing NYXO colors, Alumni Sans / Golos Text, square controls, panels, states, density, and marketplace language.
- All balances, totals, purchases, payments, and inventory values use COINS; no dollar symbol appears.
- No Lorem Ipsum, dead button, dead link, empty route, invented legal clause, fabricated company data, or false backend success.
- Skin purchase and withdrawal require Steam; email authorization alone is insufficient.
- Storage and malformed query failures never crash the UI.
- Every page supports desktop, tablet, mobile, visible focus, and 44px mobile targets.

---

### Task 1: Add the shared marketplace state and route foundation

**Files:**
- Create: `src/marketplace/marketplaceStore.ts`
- Create: `src/marketplace/marketplaceStore.test.ts`
- Create: `src/marketplace/useMarketplaceState.ts`
- Create: `src/marketplace/safeReturnRoute.ts`
- Create: `src/marketplace/safeReturnRoute.test.ts`
- Modify: `src/router/useAppRoute.ts`
- Modify: `src/router/useAppRoute.test.tsx`

**Interfaces:**
- Produces `MarketplaceState`, `MarketplaceOrder`, `MarketplacePayment`, `InventoryItem`, `Session`, `SupportTicket`.
- Produces `readMarketplaceState()`, `replaceMarketplaceState()`, `updateMarketplaceState(updater)`, `subscribeMarketplaceState(listener)`, `useMarketplaceState()`, and `safeReturnRoute(value, fallback)`.
- Extends `AppRoute` with cart, top-up, auth, account sections, inventory, support, legal, and not-found variants.

- [ ] **Step 1: Write failing store and route tests**

Test default balance `2_500`, seeded past purchase, malformed-storage fallback, unique cart ids, event subscription cleanup, safe internal return paths, rejection of external/protocol-relative routes, and parsing of every route from the design spec.

- [ ] **Step 2: Run foundation tests and confirm failure**

Run: `npm test -- --run src/marketplace/marketplaceStore.test.ts src/marketplace/safeReturnRoute.test.ts src/router/useAppRoute.test.tsx`

Expected: FAIL because marketplace modules and new route variants do not exist.

- [ ] **Step 3: Implement a versioned defensive store**

Use storage key `nyxo:marketplace:v1`. The default state contains `balanceCoins: 2500`, empty cart/session/inventory/tickets, one seeded completed order, and one seeded completed payment. Validate each array/object and recover from read/write exceptions. Dispatch `nyxo:marketplace-state` after successful in-memory updates even when persistence is unavailable.

- [ ] **Step 4: Implement safe return routes and route parsing**

Accept only strings beginning with a single `/`, reject `//`, protocols, and unknown app paths, and return the supplied safe fallback. Unknown paths produce `{ name: 'not-found' }` rather than Home.

- [ ] **Step 5: Run focused and existing route tests**

Run: `npm test -- --run src/marketplace src/router/useAppRoute.test.tsx src/App.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/marketplace src/router
git commit -m "feat: add NYXO marketplace state foundation"
```

---

### Task 2: Complete the product detail route

**Files:**
- Modify: `src/catalog/ProductPreviewPage.tsx`
- Create: `src/catalog/ProductPreviewPage.test.tsx`
- Modify: `src/catalog/CatalogProductCard.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes products, `useMarketplaceState`, and shared cart actions.
- Produces the final mock product-detail experience and working links to `/cart` and `/catalog`.

- [ ] **Step 1: Write failing product-detail tests**

Assert image/fallback, category, description, available attributes, COINS price, availability, delivery, add-to-cart feedback, already-in-cart state, working Cart/Catalog links, and unknown-slug not-found actions.

- [ ] **Step 2: Run the product page test and confirm failure**

Run: `npm test -- --run src/catalog/ProductPreviewPage.test.tsx`

Expected: FAIL on missing cart link/state and store integration.

- [ ] **Step 3: Integrate the shared cart state**

Replace the old isolated `nyxo:cart` helper with store cart ids while retaining safe migration of existing ids. The CTA reads `В корзине` after addition and provides `Перейти в корзину`.

- [ ] **Step 4: Refine only product-route styles**

Keep the current two-panel inspection layout, square actions, COINS hierarchy, explicit delivery terms, and one-column mobile layout.

- [ ] **Step 5: Run product, catalog, and Home regression tests**

Run: `npm test -- --run src/catalog src/App.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/catalog src/App.tsx src/styles.css
git commit -m "feat: complete NYXO product detail"
```

---

### Task 3: Implement the cart and purchase transaction

**Files:**
- Create: `src/checkout/CartPage.tsx`
- Create: `src/checkout/CartPage.test.tsx`
- Create: `src/marketplace/purchase.ts`
- Create: `src/marketplace/purchase.test.ts`
- Modify: `src/App.tsx`
- Modify: `src/components/Header.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Produces `calculateCart(products, ids)` and `completePurchase(state, products): PurchaseResult`.
- Produces `/cart` with empty, insufficient-balance, Steam-required, ready, storage-error, and success states.

- [ ] **Step 1: Write failing transaction tests**

Cover exact subtotal, insufficient balance/shortage, Steam requirement only when skins exist, successful COINS deduction, order/payment creation, inventory transfer, cart clearing, and duplicate-purchase protection.

- [ ] **Step 2: Confirm RED**

Run: `npm test -- --run src/marketplace/purchase.test.ts src/checkout/CartPage.test.tsx`

Expected: FAIL because purchase and CartPage modules do not exist.

- [ ] **Step 3: Implement pure transaction and cart UI**

Render product rows with remove actions, subtotal, balance, shortage, and contextual CTA. Insufficient balance links to `/balance/top-up?returnTo=%2Fcart&needed=<shortage>`. Skin purchase without Steam links to `/auth?returnTo=%2Fcart&required=steam`. Successful purchase shows order number and links to Purchases and Inventory.

- [ ] **Step 4: Add route/header and responsive styles**

Header Cart link displays the unique item count and `aria-current` on `/cart`. Mobile rows stack without hiding price or removal.

- [ ] **Step 5: Run focused and full tests**

Run: `npm test -- --run src/checkout src/marketplace/purchase.test.ts src/App.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/checkout src/marketplace/purchase* src/App.tsx src/components/Header.tsx src/styles.css
git commit -m "feat: add COINS cart purchase flow"
```

---

### Task 4: Implement balance top-up and consent gate

**Files:**
- Create: `src/balance/TopUpPage.tsx`
- Create: `src/balance/TopUpPage.test.tsx`
- Create: `src/marketplace/topUp.ts`
- Create: `src/marketplace/topUp.test.ts`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Produces `applyTopUp(state, amountCoins)` and `/balance/top-up`.

- [ ] **Step 1: Write failing consent and top-up tests**

Assert fixed/custom amounts, invalid amounts, exact consent copy, links to `/legal/terms` and `/legal/privacy`, disabled submit before consent, mock payment record, COINS balance update, safe return to Cart, and external `returnTo` rejection.

- [ ] **Step 2: Confirm RED**

Run: `npm test -- --run src/balance/TopUpPage.test.tsx src/marketplace/topUp.test.ts`

Expected: FAIL because modules do not exist.

- [ ] **Step 3: Implement top-up transaction and page**

Use packages `1_000`, `3_000`, `5_000`, `10_000` COINS plus custom integer amount `100..100_000`. Label the provider step `Тестовое пополнение — реальная оплата не выполняется`.

- [ ] **Step 4: Style confirmation and mobile form**

Preserve panel/field hierarchy and a visibly disabled action; confirmation shows new balance and a working return link.

- [ ] **Step 5: Verify tests**

Run: `npm test -- --run src/balance src/marketplace/topUp.test.ts src/checkout/CartPage.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/balance src/marketplace/topUp* src/App.tsx src/styles.css
git commit -m "feat: add consent-gated COINS top-up"
```

---

### Task 5: Implement Steam and email authorization

**Files:**
- Create: `src/auth/AuthPage.tsx`
- Create: `src/auth/AuthPage.test.tsx`
- Create: `src/marketplace/session.ts`
- Create: `src/marketplace/session.test.ts`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Produces Steam/email session actions and `/auth`.

- [ ] **Step 1: Write failing authorization tests**

Cover mode switching, email validation, Steam mock connection, required-Steam explanation, safe return, email session not satisfying skin delivery, and logout action.

- [ ] **Step 2: Confirm RED**

Run: `npm test -- --run src/auth src/marketplace/session.test.ts`

Expected: FAIL.

- [ ] **Step 3: Implement honest mock authorization**

Steam action creates `{ method: 'steam', displayName: 'Игрок NYXO' }`; email requires a syntactically valid address and creates `{ method: 'email', email }`. Both screens explicitly state that this is a local demonstration until APIs are connected.

- [ ] **Step 4: Integrate route and styles**

Return to sanitized `returnTo`; show Steam-required status when `required=steam`.

- [ ] **Step 5: Verify tests and commit**

Run: `npm test -- --run src/auth src/marketplace/session.test.ts src/checkout/CartPage.test.tsx`

Expected: PASS.

```bash
git add src/auth src/marketplace/session* src/App.tsx src/styles.css
git commit -m "feat: add NYXO mock authorization"
```

---

### Task 6: Implement the account and histories

**Files:**
- Create: `src/account/AccountPage.tsx`
- Create: `src/account/AccountPage.test.tsx`
- Create: `src/account/AccountNav.tsx`
- Create: `src/account/OrdersView.tsx`
- Create: `src/account/PaymentsView.tsx`
- Create: `src/account/SteamView.tsx`
- Create: `src/account/SettingsView.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/Header.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Produces `/account`, `/account/purchases`, `/account/payments`, `/account/steam`, `/account/settings`.

- [ ] **Step 1: Write failing account tests**

Assert all seven navigation destinations, COINS-only balance, seeded previous purchase, order number/date/product/cost/status/action, payment history, Steam state, Trade URL editing, local settings confirmation, and logout.

- [ ] **Step 2: Confirm RED**

Run: `npm test -- --run src/account/AccountPage.test.tsx`

Expected: FAIL.

- [ ] **Step 3: Implement focused account views**

Keep each view in a separate file. Orders show seeded and completed purchases; payment history shows top-ups and purchases; Overview shows recent entries and working shortcuts; Support and Inventory nav link to their real routes.

- [ ] **Step 4: Route, header, and responsive styles**

Header Account destination is `/account`; account nav becomes horizontally scrollable only on narrow screens without page overflow.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- --run src/account src/App.test.tsx`

Expected: PASS.

```bash
git add src/account src/App.tsx src/components/Header.tsx src/styles.css
git commit -m "feat: add NYXO account histories"
```

---

### Task 7: Implement inventory and Steam Trade URL gates

**Files:**
- Create: `src/inventory/InventoryPage.tsx`
- Create: `src/inventory/InventoryPage.test.tsx`
- Create: `src/marketplace/inventory.ts`
- Create: `src/marketplace/inventory.test.ts`
- Modify: `src/App.tsx`
- Modify: `src/components/Header.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Produces Trade URL validation, mock withdrawal transition, and `/inventory`.

- [ ] **Step 1: Write failing inventory tests**

Cover image/name/status/COINS value, missing/invalid Trade URL, valid `https://steamcommunity.com/tradeoffer/new/?partner=...&token=...`, withdrawal pending state, disabled resale with explanation, and empty inventory.

- [ ] **Step 2: Confirm RED**

Run: `npm test -- --run src/inventory src/marketplace/inventory.test.ts`

Expected: FAIL.

- [ ] **Step 3: Implement inventory actions**

Persist Trade URL in shared state. Withdrawal is a labeled local mock and moves status from `available` to `withdrawal-pending`. Resale remains disabled and never changes balance.

- [ ] **Step 4: Integrate route and responsive grid**

Header Inventory destination becomes `/inventory` with active state. Cards remain comparable on desktop and single-column on mobile.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- --run src/inventory src/marketplace/inventory.test.ts src/account/AccountPage.test.tsx`

Expected: PASS.

```bash
git add src/inventory src/marketplace/inventory* src/App.tsx src/components/Header.tsx src/styles.css
git commit -m "feat: add NYXO Steam inventory"
```

---

### Task 8: Implement support tickets

**Files:**
- Create: `src/support/SupportPage.tsx`
- Create: `src/support/SupportPage.test.tsx`
- Create: `src/marketplace/support.ts`
- Create: `src/marketplace/support.test.ts`
- Modify: `src/App.tsx`
- Modify: `src/components/Footer.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Produces ticket validation/creation and `/support`.

- [ ] **Step 1: Write failing support tests**

Assert the five exact categories, required email/subject/message, conditional order number, validation feedback, ticket creation, unique ticket number, and honest local confirmation.

- [ ] **Step 2: Confirm RED**

Run: `npm test -- --run src/support src/marketplace/support.test.ts`

Expected: FAIL.

- [ ] **Step 3: Implement form and mock ticket**

Store ticket with status `Черновик принят локально`; confirmation explicitly says no real message was sent. Footer Support link opens `/support`.

- [ ] **Step 4: Verify and commit**

Run: `npm test -- --run src/support src/marketplace/support.test.ts src/components/Footer.test.tsx`

Expected: PASS.

```bash
git add src/support src/marketplace/support* src/App.tsx src/components/Footer.tsx src/styles.css
git commit -m "feat: add NYXO support tickets"
```

---

### Task 9: Implement legal document status pages

**Files:**
- Create: `src/legal/LegalPage.tsx`
- Create: `src/legal/LegalPage.test.tsx`
- Create: `src/legal/legalDocuments.ts`
- Modify: `src/App.tsx`
- Modify: `src/components/Footer.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Produces four honest document routes without fabricated legal text.

- [ ] **Step 1: Write failing legal-route tests**

Assert all four routes, correct titles, “готовится заказчиком” status, support mail link, 18+, Valve non-affiliation notice, no invented requisites, and working Home/Footer links.

- [ ] **Step 2: Confirm RED**

Run: `npm test -- --run src/legal src/components/Footer.test.tsx src/App.test.tsx`

Expected: FAIL.

- [ ] **Step 3: Implement document metadata and page**

Use titles `Политика конфиденциальности`, `Пользовательское соглашение (Оферта)`, `Условия возврата`, `Честная игра`. Scope bullets describe topics the customer must supply but contain no legal promises or clauses.

- [ ] **Step 4: Wire every footer/legal link**

Remove `#` document destinations. Keep payment-method labels, support address, 18+, and Valve disclaimer in the shared footer.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- --run src/legal src/components/Footer.test.tsx src/App.test.tsx`

Expected: PASS.

```bash
git add src/legal src/App.tsx src/components/Footer.tsx src/styles.css
git commit -m "feat: add NYXO legal status pages"
```

---

### Task 10: Verify the complete cross-page user flow

**Files:**
- Create: `src/marketplace/marketplaceFlow.test.tsx`
- Modify only if a verified defect requires it.

**Interfaces:**
- Verifies the entire local marketplace handoff.

- [ ] **Step 1: Add the complete flow integration test**

Drive: add skin → Cart insufficient → Top-up consent disabled → consent/top-up → return Cart → Steam gate → Steam auth → return Cart → purchase → Purchases contains order → Inventory contains skin → Trade URL gate → withdrawal pending.

- [ ] **Step 2: Run static verification**

Run: `npm run typecheck`

Run: `npm test -- --run`

Run: `npm run build`

Expected: all exit 0.

- [ ] **Step 3: Browser QA**

At 1440, 820, and exact 390 CSS pixels verify every route, Back/Forward, reload persistence, active navigation, no dead controls, 44px mobile targets, and `scrollWidth === innerWidth`. Confirm Home section order and rifle canvas/runtime are unchanged.

- [ ] **Step 4: Final review and commit**

```bash
git add src/marketplace/marketplaceFlow.test.tsx
git commit -m "test: verify complete NYXO marketplace flow"
```
