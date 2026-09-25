# TRADEOFFS

# Tradeoffs and assumptions

Built in about three hours against the design handoff and the backend brief. This file lists the decisions worth discussing; the code and tests carry the rest.

## Assumptions

- **Desktop only (1280px).** The handoff covers desktop. A mobile layout is the first thing to add.
- **No real API yet.** The API contract is production-shaped (paged responses, a facets endpoint, abort signals) but the UI is sized for the 40-hotel seed: one page of 50, no paging controls.
- **Fake “today” is 2026-07-09,** the day before the seed’s only open dates (Jul 10–14), so the demo can book. `lib/dates.ts#today()` is the one switch; `VITE_TODAY=now` uses the wall clock. Deliberately not gated on production builds so a demo deploy still works.
- **Three-hour budget.** Several of the shortcuts below exist because of it.

## Architecture

- **The URL is the single source of truth for page and filters** (`/hotels?city=&stars=&minPrice=&maxPrice=`). Reload, share and back all restore the same view without passing state around. Query params are untrusted input, so malformed values are dropped rather than thrown. Defaults are omitted so equal filters give equal URLs, and filter changes use `replace` so the back button leaves the page instead of stepping through every slider tick. Cost: only serializable state can live there.
- **Loading is derived, not stored.** `useQuery` keeps the last result and the key it answered. No result means loading; a key that has moved on means refreshing. One stored key, no separate flags that can drift out of sync.
- **Layering: page → hook → api → pure logic.** Filtering, availability, date math and URL parsing (`src/api/logic/`, `src/lib/`) contain no React and get plain unit tests. Pages are the only components that read the URL; `components/ui` knows nothing about hotels.
- **Not found and request failure are values** (`status: 'not-found' | 'error'`), not exceptions. An unknown hotel is a normal answer, not a bug, so it stays in the render path, and the status union makes every caller handle each case. No error boundary; the brief only asks that any shown error state be documented.
- **Dates are local state on the availability panel, not in the URL.** Sharing a stay was not in the brief; it is the next thing I would add. Cost: dates do not survive back/forward or a shared link.

## Built for a real API

- **A facets endpoint** (`GET /hotels/facets`) supplies the city list, the lowest in-range price per star rating, and the catalogue size, so the filter bar never downloads every hotel. Cost: one more endpoint and one extra request on load.
- **Superseded requests are aborted.** `searchHotels` takes an `AbortSignal` like `fetch()`. The hook aborts the previous controller on every change, and an ignore flag drops any answer that resolves anyway. The mock honours the signal, so swapping in `fetch` touches two files.
- **Only price changes are debounced** (250ms in the hook, 0 under test). Clicks go at once; a slider drag costs one request instead of dozens. Against a live API I would tune this further.
- **Availability asks `GET /hotels/:id/rooms`** rather than reading the in-memory hotel, because a real backend will not embed availability in the hotel.
- **Mock latency (400ms) is a property of the mock,** 0 under test, so it cannot ship with a real client.

## Deliberate shortcuts

- **No state or data-fetching library.** The URL plus a 40-hotel dataset does not justify a cache layer.
- **react-day-picker for the calendar.** Keyboard navigation and ARIA grid semantics come free. It is styled through `classNames` with the app’s tokens, and the selection rule is ours (first click sets check-in, second sets check-out).
- **Hand-built combobox, price slider (two native range inputs) and star toggles.** In hindsight a headless component library such as Radix would have covered these with less custom code.
- **Out of scope:** mobile layout, paging UI, dates in the URL, sorting, name search, amenity filters, booking flow, E2E tests.
