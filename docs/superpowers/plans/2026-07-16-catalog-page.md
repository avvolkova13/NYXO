# NYXO Catalog Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete responsive `/catalog` page with searchable mock products, combined filters, sorting, URL-persisted state, product preview, and a working mock cart while leaving the approved homepage unchanged.

**Architecture:** Keep the existing dependency-light React/Vite application and add a small History API route layer instead of a routing package. Catalog state is derived by pure functions in `src/catalog/catalogModel.ts`, while `CatalogPage.tsx` owns URL synchronization and UI state. Shared header/footer and existing product presentation primitives preserve the homepage visual system.

**Tech Stack:** React 19, TypeScript 7, Vite 8, Vitest, Testing Library, existing CSS design tokens and components.

## Global Constraints

- Do not change the approved homepage composition or visual system.
- Reuse the existing NYXO colors, Alumni Sans / Golos Text typography, station panels, product cards, states, density, and marketplace language.
- All prices and cart totals use COINS; no dollar symbol appears.
- Search must match Steam, GPT, Пистолет, Автомат, categories, and product names.
- Every link opens a real route or state; every button has visible feedback.
- Backend-free behavior uses complete mock scenarios.
- Catalog supports desktop, tablet, and mobile layouts.

---

### Task 1: Expand the catalog product model and mock inventory

**Files:**
- Modify: `src/types/product.ts`
- Modify: `src/data/products.ts`
- Modify: `src/data/products.test.ts`

**Interfaces:**
- Produces: `ProductKind`, `AvailabilityStatus`, and an expanded `Product` interface.
- Produces: `products: Product[]` containing skin, Steam, and GPT products.
- Consumes: existing `ProductTone` and product image rendering.

- [ ] **Step 1: Write failing coverage for required catalog terms**

Add to `src/data/products.test.ts`:

```ts
it.each(['steam', 'gpt', 'пистолет', 'автомат'])('contains searchable mock data for %s', (term) => {
  const normalized = term.toLowerCase()
  expect(products.some((product) =>
    [product.name, product.category, product.game, ...product.searchAliases]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(normalized),
  )).toBe(true)
})

it('stores all marketplace prices in COINS', () => {
  expect(products.every((product) => product.currency === 'COINS')).toBe(true)
})
```

- [ ] **Step 2: Run the data test and confirm failure**

Run: `npm test -- --run src/data/products.test.ts`

Expected: FAIL because `searchAliases` and service products do not exist.

- [ ] **Step 3: Extend the product interface**

Update `src/types/product.ts` with these fields:

```ts
export type ProductKind = 'skin' | 'steam-topup' | 'gpt-topup'
export type AvailabilityStatus = 'available' | 'instant' | 'limited'

export interface Product {
  id: string
  slug: string
  name: string
  kind: ProductKind
  game?: string
  category: string
  description: string
  searchAliases: string[]
  price: number
  currency: 'COINS'
  condition?: string
  rarity?: string
  weaponType?: string
  attributeLabel?: string
  attribute?: string
  tone: ProductTone
  imageUrl: string
  availability: AvailabilityStatus
  delivery: string
  popularity: number
  createdAt: string
  featured?: boolean
}
```

- [ ] **Step 4: Expand mock inventory**

Keep the five current skin entries and add at least seven entries so the final list includes:

```ts
{
  id: 'usp-s-kill-confirmed',
  slug: 'usp-s-kill-confirmed',
  name: 'USP-S | Извилины',
  kind: 'skin',
  game: 'Counter-Strike 2',
  category: 'Пистолет',
  description: 'Коллекционный пистолет с проверенным float и моментальной передачей через Steam.',
  searchAliases: ['пистолет', 'usp', 'скин', 'counter-strike'],
  price: 8_640,
  currency: 'COINS',
  condition: 'Немного поношенное',
  rarity: 'Засекреченное',
  weaponType: 'Пистолет',
  attributeLabel: 'Float',
  attribute: '0,0812',
  tone: 'magenta',
  imageUrl: 'https://assets.lis-skins.com/market_images/11240_s.png',
  availability: 'available',
  delivery: 'Steam-трейд после подтверждения покупки',
  popularity: 82,
  createdAt: '2026-07-12',
}
```

Add an automatic-rifle entry whose aliases include `автомат`; add Steam top-up denominations and GPT top-up denominations with service artwork URLs, `kind`, delivery text, popularity, and dates.

- [ ] **Step 5: Run the data tests**

Run: `npm test -- --run src/data/products.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit the model increment**

Run:

```bash
git add src/types/product.ts src/data/products.ts src/data/products.test.ts
git commit -m "feat: expand NYXO catalog inventory"
```

---

### Task 2: Implement pure catalog search, filtering, sorting, and URL state

**Files:**
- Create: `src/catalog/catalogModel.ts`
- Create: `src/catalog/catalogModel.test.ts`

**Interfaces:**
- Consumes: `Product`, `ProductKind`, `AvailabilityStatus` from `src/types/product.ts`.
- Produces: `CatalogFilters`, `CatalogSort`, `filterProducts`, `parseCatalogState`, and `serializeCatalogState`.

- [ ] **Step 1: Write failing search and filter tests**

Create `src/catalog/catalogModel.test.ts` with focused cases:

```ts
import { describe, expect, it } from 'vitest'
import { products } from '../data/products'
import { defaultCatalogFilters, filterProducts } from './catalogModel'

describe('filterProducts', () => {
  it.each(['Steam', 'GPT', 'Пистолет', 'Автомат'])('finds %s', (query) => {
    const result = filterProducts(products, { ...defaultCatalogFilters, query }, 'popular')
    expect(result.length).toBeGreaterThan(0)
  })

  it('combines category, availability, and maximum price', () => {
    const result = filterProducts(products, {
      ...defaultCatalogFilters,
      kinds: ['skin'],
      categories: ['Пистолет'],
      availability: ['available'],
      maxPrice: 10_000,
    }, 'price-asc')
    expect(result.every((item) => item.kind === 'skin' && item.category === 'Пистолет' && item.price <= 10_000)).toBe(true)
  })

  it('sorts by descending price', () => {
    const result = filterProducts(products, defaultCatalogFilters, 'price-desc')
    expect(result[0].price).toBeGreaterThanOrEqual(result[1].price)
  })
})
```

- [ ] **Step 2: Run the model test and confirm failure**

Run: `npm test -- --run src/catalog/catalogModel.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the pure model**

Create `src/catalog/catalogModel.ts` with:

```ts
export type CatalogSort = 'popular' | 'newest' | 'price-asc' | 'price-desc'

export interface CatalogFilters {
  query: string
  kinds: ProductKind[]
  categories: string[]
  availability: AvailabilityStatus[]
  conditions: string[]
  maxPrice: number
}

export const defaultCatalogFilters: CatalogFilters = {
  query: '', kinds: [], categories: [], availability: [], conditions: [], maxPrice: 50_000,
}

const searchableText = (product: Product) => [
  product.name, product.category, product.game, product.weaponType,
  product.description, ...product.searchAliases,
].filter(Boolean).join(' ').toLocaleLowerCase('ru-RU')

export function filterProducts(items: Product[], filters: CatalogFilters, sort: CatalogSort) {
  const query = filters.query.trim().toLocaleLowerCase('ru-RU')
  const filtered = items.filter((product) =>
    (!query || searchableText(product).includes(query)) &&
    (!filters.kinds.length || filters.kinds.includes(product.kind)) &&
    (!filters.categories.length || filters.categories.includes(product.category)) &&
    (!filters.availability.length || filters.availability.includes(product.availability)) &&
    (!filters.conditions.length || Boolean(product.condition && filters.conditions.includes(product.condition))) &&
    product.price <= filters.maxPrice,
  )
  return [...filtered].sort(sorters[sort])
}
```

Define `sorters` for popularity, newest date, ascending price, and descending price. Implement URL parsing/serialization using `URLSearchParams` with repeated comma-separated values for arrays.

- [ ] **Step 4: Add URL round-trip coverage**

Add:

```ts
it('round-trips filters through URL parameters', () => {
  const filters = { ...defaultCatalogFilters, query: 'Steam', kinds: ['steam-topup'] as const, maxPrice: 9_000 }
  const restored = parseCatalogState(serializeCatalogState(filters, 'price-asc'))
  expect(restored).toEqual({ filters, sort: 'price-asc' })
})
```

- [ ] **Step 5: Run the catalog model tests**

Run: `npm test -- --run src/catalog/catalogModel.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit the model increment**

Run:

```bash
git add src/catalog/catalogModel.ts src/catalog/catalogModel.test.ts
git commit -m "feat: add catalog filtering model"
```

---

### Task 3: Add route-aware application shell without changing Home

**Files:**
- Create: `src/router/useAppRoute.ts`
- Create: `src/router/useAppRoute.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/Header.tsx`
- Modify: `src/components/Footer.tsx`

**Interfaces:**
- Produces: `AppRoute = { name: 'home' } | { name: 'catalog' } | { name: 'product'; slug: string }`.
- Produces: `navigate(href: string): void` and a popstate-aware `useAppRoute()` hook.
- Consumes: `CatalogPage` created in Task 4.

- [ ] **Step 1: Write route parsing tests**

Create `src/router/useAppRoute.test.tsx` and assert:

```ts
expect(parseAppRoute('/')).toEqual({ name: 'home' })
expect(parseAppRoute('/catalog')).toEqual({ name: 'catalog' })
expect(parseAppRoute('/product/ak47-wild-lotus')).toEqual({ name: 'product', slug: 'ak47-wild-lotus' })
```

- [ ] **Step 2: Run the route test and confirm failure**

Run: `npm test -- --run src/router/useAppRoute.test.tsx`

Expected: FAIL because the router module does not exist.

- [ ] **Step 3: Implement the History API route hook**

Create `src/router/useAppRoute.ts`:

```ts
export function navigate(href: string) {
  window.history.pushState({}, '', href)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0, behavior: 'auto' })
}

export function parseAppRoute(pathname: string): AppRoute {
  if (pathname === '/catalog') return { name: 'catalog' }
  const productMatch = pathname.match(/^\/product\/([^/]+)$/)
  if (productMatch) return { name: 'product', slug: decodeURIComponent(productMatch[1]) }
  return { name: 'home' }
}
```

`useAppRoute()` initializes from `window.location.pathname` and subscribes to `popstate`.

- [ ] **Step 4: Make internal links route-aware**

Add an `onClick` handler helper that prevents default only for unmodified left-clicks, then update Catalog links in Header/Footer and homepage CTAs to use `/catalog`. Keep ordinary anchor `href` attributes so links still work without JavaScript.

- [ ] **Step 5: Route in App without editing Home markup**

Extract the existing exact homepage markup to an internal `HomePage` function without changing its order or components. Render `CatalogPage` only when `route.name === 'catalog'`; render a `ProductPreviewPage` from Task 4 for product routes.

- [ ] **Step 6: Run existing homepage tests and route tests**

Run: `npm test -- --run src/App.test.tsx src/router/useAppRoute.test.tsx`

Expected: PASS, including the unchanged homepage heading and section assertions.

- [ ] **Step 7: Commit the routing increment**

Run:

```bash
git add src/router src/App.tsx src/components/Header.tsx src/components/Footer.tsx
git commit -m "feat: add NYXO catalog routes"
```

---

### Task 4: Build the full catalog page and product preview state

**Files:**
- Create: `src/catalog/CatalogPage.tsx`
- Create: `src/catalog/CatalogPage.test.tsx`
- Create: `src/catalog/ProductPreviewPage.tsx`
- Create: `src/catalog/CatalogProductCard.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `filterProducts`, `CatalogFilters`, `CatalogSort`, URL state helpers, `products`, `Header`, `Footer`, `ProductMedia`, and `formatPrice`.
- Produces: `CatalogPage`, `ProductPreviewPage`, and a mock cart stored in `localStorage` key `nyxo:cart`.

- [ ] **Step 1: Write failing interaction tests**

Create `src/catalog/CatalogPage.test.tsx` with cases that:

```ts
it('searches for Steam and shows only matching products', async () => {
  const user = userEvent.setup()
  render(<CatalogPage />)
  await user.type(screen.getByRole('searchbox', { name: 'Поиск по каталогу' }), 'Steam')
  expect(screen.getAllByTestId('catalog-product').every((card) => card.textContent?.includes('Steam'))).toBe(true)
})

it('clears filters from the empty state', async () => {
  const user = userEvent.setup()
  render(<CatalogPage />)
  await user.type(screen.getByRole('searchbox', { name: 'Поиск по каталогу' }), 'несуществующий товар')
  await user.click(screen.getByRole('button', { name: 'Сбросить фильтры' }))
  expect(screen.getAllByTestId('catalog-product').length).toBeGreaterThan(0)
})

it('adds a product to the mock cart with confirmation', async () => {
  const user = userEvent.setup()
  render(<CatalogPage />)
  const buttons = screen.getAllByRole('button', { name: 'Добавить в корзину' })
  await user.click(buttons[0])
  expect(screen.getByRole('status')).toHaveTextContent('Добавлено в корзину')
})
```

- [ ] **Step 2: Run the component test and confirm failure**

Run: `npm test -- --run src/catalog/CatalogPage.test.tsx`

Expected: FAIL because the components do not exist.

- [ ] **Step 3: Implement catalog state and controls**

`CatalogPage` initializes filters from `window.location.search`, computes results with `useMemo`, and updates the query string with `history.replaceState`. It renders:

- search input labelled `Поиск по каталогу`;
- four category controls: `Все`, `Скины`, `Steam`, `GPT`;
- fieldsets for type/category, game/service, availability, condition, and maximum COINS;
- active filter chips with remove actions;
- native sort select;
- live result count;
- reset action;
- responsive filter disclosure button.

- [ ] **Step 4: Implement catalog cards and mock cart reaction**

`CatalogProductCard` renders image/fallback, category, name, description, price, availability, delivery, detail link, and `Добавить в корзину`. Persist cart ids as JSON:

```ts
const ids = JSON.parse(localStorage.getItem('nyxo:cart') ?? '[]') as string[]
localStorage.setItem('nyxo:cart', JSON.stringify([...new Set([...ids, product.id])]))
setNotice(`${product.name} — добавлено в корзину`)
```

- [ ] **Step 5: Implement complete product preview route**

`ProductPreviewPage` resolves `slug`, shows all available product attributes, price, delivery conditions, status, `Добавить в корзину`, and a route link back to `/catalog`. Unknown slugs show `Товар не найден` and a working return link.

- [ ] **Step 6: Run catalog interaction tests**

Run: `npm test -- --run src/catalog/CatalogPage.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit the catalog UI increment**

Run:

```bash
git add src/catalog src/App.tsx
git commit -m "feat: build working NYXO catalog page"
```

---

### Task 5: Extend the existing visual system and responsive behavior

**Files:**
- Modify: `src/styles.css`
- Modify: `src/catalog/CatalogPage.test.tsx`

**Interfaces:**
- Consumes: catalog class names defined in Task 4.
- Produces: desktop sidebar/grid, tablet grid, and mobile filter disclosure layouts.

- [ ] **Step 1: Add structural CSS assertions**

Import `styles.css?raw` in the catalog test and assert the presence of:

```ts
expect(styles).toMatch(/\.catalog-page__workspace\s*{[\s\S]*grid-template-columns:/)
expect(styles).toMatch(/@media \(max-width: 860px\)[\s\S]*\.catalog-page__grid/)
expect(styles).toMatch(/@media \(max-width: 600px\)[\s\S]*\.catalog-page__filters/)
```

- [ ] **Step 2: Run the CSS assertions and confirm failure**

Run: `npm test -- --run src/catalog/CatalogPage.test.tsx`

Expected: FAIL because catalog styles do not exist.

- [ ] **Step 3: Add desktop and tablet layouts**

Extend `src/styles.css` using current variables and classes:

```css
.catalog-page {
  width: min(100%, var(--page-width));
  margin-inline: auto;
  padding: clamp(2.5rem, 6vw, 5rem) var(--page-pad) var(--section-gap);
}

.catalog-page__workspace {
  display: grid;
  grid-template-columns: minmax(220px, 280px) minmax(0, 1fr);
  gap: clamp(1rem, 2vw, 1.6rem);
}

.catalog-page__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.7rem;
}
```

Style filters, toolbar, chips, states, cards, preview panel, and notices only with existing NYXO variables and squared controls.

- [ ] **Step 4: Add responsive layout**

At `860px`, switch to two product columns and allow the filter disclosure. At `600px`, use one column, stack toolbar controls, make filters a full-width collapsible panel, and keep control heights at 44px or greater.

- [ ] **Step 5: Run catalog and full tests**

Run: `npm test -- --run src/catalog/CatalogPage.test.tsx`

Expected: PASS.

Run: `npm test -- --run`

Expected: all tests PASS.

- [ ] **Step 6: Commit the responsive increment**

Run:

```bash
git add src/styles.css src/catalog/CatalogPage.test.tsx
git commit -m "style: match catalog to NYXO visual system"
```

---

### Task 6: Final verification and local handoff

**Files:**
- Modify only if verification reveals a catalog-specific defect.

**Interfaces:**
- Consumes: completed catalog route and all test suites.
- Produces: a verified local catalog ready for product-page implementation.

- [ ] **Step 1: Run static verification**

Run: `npm run typecheck`

Expected: exit code 0.

Run: `npm test -- --run`

Expected: all tests PASS.

Run: `npm run build`

Expected: Vite build succeeds.

- [ ] **Step 2: Verify desktop behavior at 1440px**

Open `/catalog` and confirm search for `Steam`, `GPT`, `Пистолет`, and `Автомат`; combine filters; change sort; remove chips; reset; open a product; add it to the mock cart; use browser back.

- [ ] **Step 3: Verify tablet and mobile behavior**

At 820px confirm two columns and expandable filters. At 390px confirm one column, readable card content, working filter disclosure, no horizontal overflow, and 44px controls.

- [ ] **Step 4: Confirm Home regression boundary**

Open `/` and confirm the Hero, rotating rifle, homepage block order, animations, and footer remain visually unchanged.

- [ ] **Step 5: Record final repository state**

Run: `git status --short`

Expected: clean worktree after implementation commits.
