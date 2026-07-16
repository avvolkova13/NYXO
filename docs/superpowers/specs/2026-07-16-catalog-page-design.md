# NYXO Catalog Page Design

## Scope

Build the first post-homepage route: a complete catalog for skins, Steam balance top-ups, GPT balance top-ups, and future digital-product categories. The approved homepage remains unchanged and is the visual reference for every catalog state.

## Chosen approach

Use a lightweight route state inside the existing React application instead of adding a routing dependency. The header and homepage catalog links open `/catalog`; browser back/forward and direct page loading must work. This keeps the current Vite deployment simple while creating a real independent page rather than another homepage section.

## Visual system

- Reuse the existing dark plum station background, orange action state, acid-yellow signal state, Alumni Sans headings, Golos Text interface copy, panel borders, product media treatment, and square controls.
- Use the homepage density and spacing scale. The catalog must feel like a broader operating surface of the same marketplace, not a new design.
- Keep one dominant activity: scanning and comparing products. Filters and metadata remain visually quieter than the product grid.
- Responsive behavior collapses the sidebar into an expandable filter panel without changing the control language.

## Page structure

1. Shared header with a clear route back to the homepage and an active Catalog state.
2. Compact catalog masthead: title, result count, search, and category tabs.
3. Main workspace:
   - left sidebar with product type, game/service, availability, condition, and price range filters;
   - right toolbar with active-filter chips, sorting, view status, and reset;
   - responsive product grid.
4. Empty result state with a working reset action.
5. Shared legal footer.

## Product model and mock data

Extend the existing product model so one catalog can represent skins and digital top-ups. Each entry has a stable id, name, product kind, category, searchable aliases, description, price in COINS, image or service artwork, availability status, acquisition terms, and optional skin-specific properties such as game, condition, float, rarity, and weapon type.

The mock catalog includes enough entries to prove all required searches:

- Steam
- GPT
- Пистолет
- Автомат
- category names
- exact and partial product names

## Interaction and state

- Search is case-insensitive and matches name, aliases, category, product type, and game/service.
- Category tabs and sidebar filters combine using AND logic across groups and OR logic inside a group.
- Sorting supports popularity, newest, price ascending, and price descending.
- Active filters appear as removable chips.
- Reset clears the entire query and filter state.
- Product CTA opens a working product-detail route prepared for the next implementation stage; until that page is built, it displays a complete in-app mock preview panel rather than a dead link.
- Adding an item stores it in a local mock cart and gives immediate visual confirmation.
- URL query parameters persist search, category, sort, and filters so reload/back/forward retain the catalog state.

## Responsive behavior

- Desktop: fixed-width filter column and flexible 3-column product grid.
- Tablet: narrower filter column and 2-column grid.
- Mobile: filter panel becomes an explicit open/close disclosure; toolbar stacks; product grid becomes one column; all controls retain at least 44px touch targets.

## Accessibility

- Search has a visible label.
- Filter groups use fieldsets and legends.
- Active tabs expose `aria-pressed`.
- Result updates use a polite live region.
- Sorting uses a native select.
- Empty and loading states remain readable without animation.

## Error and loading states

- Initial loading skeleton simulates API loading briefly only when explicitly triggered in tests or mock controls; normal direct navigation renders immediately.
- Broken product images fall back to a branded category tile.
- No-results state explains which filters caused it and offers reset.
- Mock cart actions never fail silently and always show confirmation.

## Testing

- Unit tests cover search terms, combined filters, sorting, URL-state parsing, reset, and empty results.
- Component tests cover category switching, filter disclosure, add-to-cart feedback, and product preview navigation.
- Existing homepage tests remain unchanged and passing.
- Verify production build and responsive layout at desktop, tablet, and mobile widths.

## Explicit non-goals for this stage

- Backend API integration.
- Checkout and real payments.
- Authentication.
- Final product-detail page implementation.
- Changes to the approved homepage composition or visual system.
