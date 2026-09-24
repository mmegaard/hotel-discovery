# AI usage

How AI (Claude Code) was used on this project, one entry per PR. Each entry records what the AI produced,
what I decided, and what I changed by hand, so the line between assistance and authorship is visible.

## PR 0 — bootstrap

- **AI produced:** the implementation plan (stack, architecture, PR sequence, conventions), the project skill file
  at `.claude/skills/hotel-discovery/SKILL.md`, the Vite/Vitest/Prettier configuration, the Tailwind theme tokens,
  the `Hotel` types, the seed sanity test, and the first drafts of TRADEOFFS.md and this file.
- **I decided:** MVP scope only; one small, defensible PR per feature; top-down layering (URL → page → hook → api →
  pure logic); reusable props-only UI components; the design handoff as the source of truth for behaviour and visuals;
  a faked "today" of 2026-07-09 so the demo dates are bookable; recording every tradeoff in a single file.
- **I changed:** reviewed each commit before it landed; kept the seed byte-identical to the handoff rather than
  letting the formatter rewrite it.

## PR 1 — app shell

- **AI produced:** the route table, `AppLayout`, placeholder search and detail pages, the 404 page from the
  wireframe, route tests on a memory router, and the routing notes in TRADEOFFS.md.
- **I decided:** data-router mode without loaders; `/` redirects to `/hotels`; the wireframe's URL strip stays out
  of the app; unknown hotel ids are a page concern, not a router concern.
- **I changed:** reviewed the PR before merge.

## PR 2 — api layer

- **AI produced:** the date and format helpers, the pure filter and availability rules, the mock API and
  `hotelApi.ts` entry point, 25 unit tests, and the data-layer section of TRADEOFFS.md.
- **I decided:** the layering (UI filters → api module → backend-shaped mock → pure logic); any-room price
  matching; `[checkIn, checkOut)` night semantics; ISO-string dates with no date library; `undefined` for a
  missing hotel instead of an exception.
- **I changed:** reviewed the PR before merge.

## PR 3 — search list

- **AI produced:** `useHotels`, `SearchPage`, `HotelList`, `HotelCard`, `HotelCardSkeleton`, `ui/StarGlyphs`,
  `ui/RatingBadge`, page and card tests, and the search-list notes in TRADEOFFS.md.
- **I decided:** search results do not show availability (the "No open dates" tag from the design is dropped);
  the card receives a price rather than the filters; skeleton cards while loading, since every card is the same size.
- **I changed:** reviewed the PR before merge.

## PR 4 — search city

- **AI produced:** `lib/filterParams.ts`, `useHotelFilters`, `useCityOptions`, `ui/Combobox` (ARIA pattern,
  keyboard), `ui/EmptyState`, `ui/Button`, `FilterBar`, the URL-backed `SearchPage`, 13 tests, and the filter
  notes in TRADEOFFS.md.
- **I decided:** URL as the only filter store with `replace` navigation; the typed city text owned by the page so
  both Reset buttons clear it; generic prefix matching in the combobox; honouring an unknown city in the URL.
- **I changed:** reviewed the PR before merge.

## PR 5 — search price

- **AI produced:** `ui/NumberInput`, `ui/RangeSlider`, `PriceRange`, the `refreshing` status, debounce and abort
  support in `useHotels`, ten tests, and the price notes in TRADEOFFS.md.
- **I decided:** native range inputs over a library; typed and spun values apply live once valid, so the box, the
  slider and the list always agree; keep stale results while refreshing rather than flashing skeletons; debounce the query
  in the hook rather than the URL, with abortable requests, so a live API sees one request per drag.
- **I changed:** reviewed the PR before merge.

## PR 6 — search stars

- **AI produced:** `StarToggle`, the star row in `FilterBar`, the facets endpoint and paged search in the mock,
  the generic `useQuery` hook, `useFilterOptions`, tests, and the star and data-layer notes in TRADEOFFS.md.
- **I decided:** exact-match multi-select; prices computed against the other filters only; never disable a toggle;
  design for production volumes (no catalogue download, API-provided totals, paged contract) and put that rule in
  the skill; drop the wireframe's price tagline.
- **I changed:** reviewed the PR before merge.

## PR 7 — hotel detail

- **AI produced:** `useHotel`, `HotelDetailPage`, `BackLink`, `HotelHeader`, `AmenityList`, `HotelDetailSkeleton`,
  `formatAddress`, the large `RatingBadge`, page tests, and the detail notes in TRADEOFFS.md.
- **I decided:** not-found as a value; back-link rule (history back, else search pre-filtered to the city); no
  invented reviews section; reserve the availability column now.
- **I changed:** reviewed the PR before merge.
