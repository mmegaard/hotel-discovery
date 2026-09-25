# AI usage

I used Claude Code and Claude Design as a pair programmer. I started by iterating on a component map with Claude Code, then designed the UI with Claude Design, walking back decisions it made that didn’t match what I wanted while letting it own choices that didn’t affect UX or accessibility. From the component map and design, Claude Code built a plan, and each feature followed the same loop: it restated the feature in a few bullets, I signed off or steered, it built and opened a PR scoped to that feature, and I reviewed and adjusted. A skills file captured my preferences and intent so I didn’t have to restate them every session. I didn’t read every line of generated code; I focused my review on the high-level decisions, structure, and anything touching UX or accessibility, verified by tests and by keeping each PR small enough to review meaningfully. Below is what I asked claude to track that we did for AI usage. This paragraph was my take on it.

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

## PR 8 — room availability

- **AI produced:** `ui/DateInput`, `useRoomAvailability`, `RoomAvailability` with its five states, `RoomCard`, the
  `enabled`/idle option on `useQuery`, `EmptyState` compact mode, nine tests, and the availability notes in
  TRADEOFFS.md.
- **I decided:** dates as panel-local state; live-apply typed dates with fallback on blur; ask the API for open
  rooms rather than filtering the in-memory hotel; skeletons sized to room cards.
- **I changed:** reviewed the PR before merge.

## PR 9 — date picker

- **AI produced:** `ui/DatePicker` over react-day-picker with Tailwind slot classes and a custom caption, the
  open/close wiring in `RoomAvailability`, `toLocalDate`/`fromLocalDate`, five tests, and the picker notes in
  TRADEOFFS.md.
- **I decided:** library for the grid, our own selection rule; inline placement per the wireframe; drop per-night
  prices in the calendar.
- **I changed:** reviewed the PR before merge.

## PR 10 — README and final docs pass

- **AI produced:** this README, the consistency pass over TRADEOFFS.md (tenses, hook names after the `useQuery`
  refactor, React Router version, out-of-scope list), and the collaboration summary above.
- **I decided:** README structure (run, try it, how it is built, state, contract, component map, tests); flip
  the repository public before the interview.
- **I changed:** reviewed the PR before merge.

## PR 11 — query hardening

- **AI produced:** the production-readiness review, `status: 'error'` in `useQuery` with the three one-line
  error states, `useFilterDebounce`, the env-configurable mock latency, three tests, and the first hardening
  notes in TRADEOFFS.md.
- **I decided:** no error boundary or retry UI (the brief does not ask for them; documented error states only);
  keep the fake today ungated so a demo build still books.
- **I changed:** reviewed the PR before merge.

## PR 12 — small production fixes

- **AI produced:** `useDocumentTitle`, the `state.fromSearch` back link, the "No rooms listed" card state, and
  three tests.
- **I decided:** which of the review's findings were worth fixing before the interview.
- **I changed:** reviewed the PR before merge.

## PR 13 — no layout jumps on load

- **AI produced:** the lazy-loaded calendar with a same-height fallback, star-row placeholders while filter
  options load, the empty state kept during a refresh, and the tests.
- **I decided:** the star row must never grow on load (I spotted the jump); keep the no-jumps rule absolute.
- **I changed:** reviewed the PR before merge.

## PR 14 — CI

- **AI produced:** the GitHub Actions workflow.
- **I decided:** run the same four checks as the local definition of done, plus a format check.
- **I changed:** reviewed the PR before merge.

## PR 15 — prefilled availability dates

- **AI produced:** the prefilled one-night stay and the test changes.
- **I decided:** the panel should answer on load with today → tomorrow rather than wait for input.
- **I changed:** reviewed the PR before merge.
