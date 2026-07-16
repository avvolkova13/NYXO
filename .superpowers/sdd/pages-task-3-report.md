# Task 3 report — cart and COINS purchase flow

## Status

Implemented the `/cart` route and its pure purchase transaction. Home and Catalog composition/selectors were preserved; the shared Header now exposes a synchronized cart count and only marks Cart current on `/cart`.

## Delivered

- `calculateCart(products, ids)` resolves unique known products from shared catalog data, rounds each displayed COINS price consistently, and reports subtotal/skin presence.
- `completePurchase(state, products, options?)` provides deterministic clock/ID injection and returns explicit empty, insufficient, Steam-required, or success results.
- A successful transaction deducts COINS, creates exactly one order and one payment, transfers only skins to inventory, and clears the cart in one next-state value.
- Repeating the transaction against the successful state is protected by the now-empty cart.
- Cart rows render shared product data, keep prices/removal visible on mobile, and persist removals.
- Insufficient funds show the exact integer shortage and link to `/balance/top-up?returnTo=%2Fcart&needed=<integer>`.
- Funded skin orders without a Steam session link to `/auth?returnTo=%2Fcart&required=steam`.
- Successful persistence shows a receipt with the order number and links to `/account/purchases` and `/inventory`.
- Failed persistence rolls the in-memory transaction back, shows an alert, and never shows a false receipt.
- Empty cart links back to `/catalog`.

## TDD evidence

- Initial focused run: RED because `purchase.ts` and `CartPage.tsx` did not exist.
- Transaction/cart GREEN: 11 tests passed.
- Persistence rollback assertion: RED with an empty in-memory cart, then GREEN after rollback implementation.
- Final focused run: 3 files, 23 tests passed.
- Final full run: 22 files, 172 tests passed.

## Verification

- `npm test -- --run src/checkout src/marketplace/purchase.test.ts src/App.test.tsx` — passed (23/23).
- `npm test -- --run` — passed (172/172).
- `npm run typecheck` — passed.
- `npm run build` — passed.
- `git diff --check` for Task 3 files — passed.

The test environment still logs its existing jsdom Canvas `getContext()` notice. The production build still reports the existing large Three.js chunk warning; neither is a test/build failure and neither is introduced by this cart flow.
