# Task 3 report — route-aware application shell

## Status

Complete. The application now renders Home at `/`, the catalog at `/catalog`, and product previews at canonical `/catalog/:slug` URLs. `/product/:slug` remains a parsing compatibility alias. Home markup composition and component order are unchanged.

## RED/GREEN evidence

### RED

Command:

`npm test -- --run src/router/useAppRoute.test.tsx src/App.test.tsx src/components/Hero.test.tsx`

Result: exit 1. The new router suite failed to resolve `./useAppRoute`, direct catalog/product route assertions still rendered Home, and catalog CTA assertions received the old `#popular` href. This was the expected feature-missing failure before production implementation.

### GREEN

After implementing the History API router, route-aware App shell, and catalog destinations, the same focused command passed:

- 3 test files passed
- 34 tests passed
- 0 failed

Covered behaviors include route parsing, canonical and compatibility product paths, URL-decoded slugs, unknown-path Home fallback, direct catalog/product loads, popstate updates, safe navigation without `scrollTo`, ordinary same-origin left-click interception, and native behavior for modified, targeted, download, hash, mail, and external links.

## Files changed

- `src/router/useAppRoute.ts`
- `src/router/useAppRoute.test.tsx`
- `src/App.tsx`
- `src/App.test.tsx`
- `src/components/Header.tsx`
- `src/components/Footer.tsx`
- `src/components/Hero.tsx`
- `src/components/Hero.test.tsx`
- `src/components/PopularNow.tsx`
- `.superpowers/sdd/task-3-report.md`

No styles or catalog component markup were changed.

## Verification

Focused route, App, and affected Hero tests:

`npm test -- --run src/router/useAppRoute.test.tsx src/App.test.tsx src/components/Hero.test.tsx`

- 3 files passed
- 34 tests passed

Full suite:

`npm test -- --run`

- 16 files passed
- 96 tests passed
- 0 failed
- The output includes the existing jsdom notice that `HTMLCanvasElement.getContext()` is unavailable without the optional canvas package; it does not fail the suite.

Typecheck:

`npm run typecheck`

- Exit 0
- No TypeScript diagnostics

## Self-review

- `HomePage` preserves the original `site-shell` structure and exact order: Header, Hero, MarketplaceTools, PopularNow, Account, Checkout, HowItWorks, Inspection, FAQ, Footer.
- Header and Footer catalog destinations now use `/catalog`; all non-catalog section anchors and mail links remain unchanged.
- The genuine Hero and PopularNow “Перейти в каталог” calls to action now use `/catalog`; “Популярные скины” remains the `#popular` section anchor.
- Product cards already use canonical `/catalog/:slug` hrefs and require no modification.
- Link interception is delegated at the document level by the mounted route hook, so ordinary hrefs remain usable without JavaScript and existing catalog components need no routing props.
- Interception is limited to unmodified left clicks on same-origin HTTP(S) anchors without target, download, or hash behavior. Already-prevented events remain untouched.
- Navigation preserves query strings, publishes a popstate update, and resets scroll only when `scrollTo` is callable, with a guard for partially implemented environments.
- Unknown routes intentionally fall back to Home, matching the specified route union and brief.

## Concerns

- The full test suite still prints the pre-existing jsdom canvas capability notice. It is unrelated to routing and does not represent a test failure.
- Deep-link deployment requires the production host to serve the SPA entry point for `/catalog` and `/catalog/*`; that server configuration is outside this source task.
