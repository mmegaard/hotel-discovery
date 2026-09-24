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

- **AI produced:** `useHotels`, `SearchPage`, `HotelList`, `HotelCard`, `ui/StarGlyphs`, `ui/RatingBadge`, page and
  card tests, and the search-list notes in TRADEOFFS.md.
- **I decided:** search results do not show availability (the "No open dates" tag from the design is dropped);
  the card receives a price rather than the filters.
- **I changed:** reviewed the PR before merge.
