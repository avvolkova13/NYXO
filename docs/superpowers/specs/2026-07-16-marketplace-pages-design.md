# NYXO Marketplace Pages Design

## Scope

Complete the remaining NYXO marketplace routes after the approved Home and Catalog: product detail, cart, balance top-up, authentication, account, inventory, support, and legal-document status pages. Home remains the visual and compositional reference and is not redesigned.

## Chosen approach

Use one dependency-free client-side marketplace store backed by `localStorage` and browser events. Every page consumes the same cart, balance, session, orders, payments, inventory, Steam Trade URL, and support-ticket state. Mock behavior is complete and honest: it demonstrates the final user flow without claiming that Steam, payment, resale, or legal backends are connected.

## Route map

- `/catalog` — approved catalog.
- `/catalog/:slug` — complete product detail.
- `/cart` — cart and purchase gate.
- `/balance/top-up` — COINS top-up flow.
- `/auth` — Steam or email authorization mock.
- `/account` — account overview.
- `/account/purchases` — previous purchases.
- `/account/payments` — payment history.
- `/account/steam` — Steam connection and Trade URL.
- `/account/settings` — local profile preferences.
- `/inventory` — owned digital items and withdrawal state.
- `/support` — support form and submitted-ticket status.
- `/legal/privacy`, `/legal/terms`, `/legal/refunds`, `/legal/fair-play` — honest document-status pages without invented legal clauses.

Unknown application paths render a working not-found state with links to Home and Catalog rather than silently returning Home.

## Shared state model

`MarketplaceState` contains:

- `balanceCoins`, default `2_500` COINS;
- unique `cartProductIds`;
- optional session with method `steam` or `email`;
- Steam connection state and Trade URL;
- mock purchases, payments, inventory items, and support tickets;
- a version number for safe future migrations.

The store validates parsed local data, falls back safely after malformed or unavailable storage, writes atomically, and dispatches a single `nyxo:marketplace-state` event. Hooks subscribe/unsubscribe cleanly so every mounted page updates immediately after a top-up or purchase.

## Product detail

The existing product preview becomes the final mock product page. It keeps image/fallback, category, description, all available properties, COINS price, availability, delivery terms, and a product-specific add-to-cart action. It also exposes working links to Cart and Catalog and reflects whether the item is already in the cart.

## Cart and purchase flow

The cart renders complete product rows, COINS subtotal, current COINS balance, remove actions, and an empty state. Purchase rules:

1. Empty cart cannot be purchased.
2. Insufficient balance shows the exact shortage and routes to `/balance/top-up?returnTo=/cart&needed=<coins>`.
3. Skin products require a Steam session; otherwise CTA routes to `/auth?returnTo=/cart&required=steam`.
4. Successful purchase deducts COINS, creates an order and payment record, moves skin products into inventory, clears the cart, and shows a receipt state with links to Purchases and Inventory.

No fiat currency appears in cart, account balance, purchase history, or inventory.

## Balance top-up

Top-up offers fixed COINS packages and a custom COINS amount. The payment-provider step remains an explicit mock. Before activation the user must check:

“Я принимаю условия Пользовательского соглашения (Оферты) и даю согласие на обработку персональных данных в соответствии с Политикой конфиденциальности.”

Both document names are links. The submit button is disabled until the checkbox is checked and the amount is valid. Submission adds COINS, records a mock payment, displays confirmation, and provides a working return action to the validated same-origin `returnTo` route, defaulting to `/cart`.

## Authentication

The page provides Steam and email modes. Steam completes an honest local mock session and satisfies the skin-purchase gate. Email validates the address and creates an email session, but clearly explains that Steam is still required for skin delivery. `returnTo` is restricted to internal application routes.

## Account

The account shell exposes Overview, Purchases, Payment History, Inventory, Steam, Settings, and Support. Overview shows balance only in COINS, session status, recent purchases, inventory count, and working shortcuts.

Purchases always renders the required historical list using seeded mock orders plus locally completed purchases. Each order shows number, date, product, COINS cost, status, and relevant actions. Payment history shows COINS movements and statuses. Steam owns connection status and Trade URL editing. Settings contains functional local preferences and a logout action.

## Inventory

Inventory cards show image/fallback, name, status, COINS value, and actions. Steam Trade URL is required before withdrawal. “Вывести в Steam” provides honest validation and a mock pending state. “Продать сайту за Coins” remains disabled with a concise explanation because resale backend is unavailable.

## Support

The form contains category, order number when relevant, email, subject, and message. Categories are Оплата, Steam, Игровые предметы, Возврат, Другая проблема. Client validation is visible and accessible. Submission creates a local ticket number and confirmation state; it does not claim that a real message was sent.

## Legal pages

The four URLs are real and linked throughout the product. Because approved legal copy is absent, each page states that the corresponding document is being prepared by the customer before launch, lists the scope the future document must cover without presenting clauses, shows support contact, Valve non-affiliation notice, 18+ notice, and routes back to Home. No fabricated company requisites or legal promises are used.

## Shared shell and visual system

- Reuse the approved Header/Footer, Alumni Sans/Golos Text, dark plum station panels, orange actions, toxic-yellow status signals, square controls, and existing density.
- Add route-aware navigation for Cart, Account, and Inventory without changing Home composition.
- Pages use one content maximum, consistent panel borders, comparison-friendly metadata, visible focus, 44px mobile targets, and no horizontal overflow.
- Page states are operational screens, not landing-page hero compositions.

## Accessibility and error handling

- Native labels, fieldsets, validation messages, `aria-current`, polite status regions, and real anchors.
- Disabled actions explain why.
- Storage failures never crash the UI; actions show a recoverable error.
- Malformed query parameters and unsafe return routes fall back to safe internal routes.
- Reduced motion remains supported by the existing global rule.

## Testing and verification

- Unit tests: store validation, cart totals, balance gating, purchase transaction, return-route sanitization.
- Route tests: every path and not-found behavior.
- Component tests: cart-to-top-up-to-cart-to-purchase, consent gate, Steam gate, previous purchases, inventory Trade URL gate, disabled resale, support confirmation, legal links.
- Regression tests: Home component order and Hero remain unchanged.
- Browser QA: 1440, 820, and 390 CSS viewports; no horizontal overflow; route back/forward; persisted state across reload.
- Final typecheck, complete test suite, and production build.

## Non-goals

- Real Steam OAuth or trade-bot calls.
- Real payment processing or fiat conversion.
- Real email delivery or support integration.
- Working item resale.
- Invented legal copy, company data, or provider URLs.
- Redesign of the approved Home or Catalog visual system.
