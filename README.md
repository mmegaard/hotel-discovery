# StayFinder — Hotel Discovery UI

A small hotel search and availability app over a 40-hotel JSON seed, built as a frontend take-home.
Three capabilities: search hotels by city, star rating and price; view a hotel's details; check which room
types are open for a stay.

Live behaviour and visuals follow the design handoff in [`docs/design/DESIGN.md`](docs/design/DESIGN.md).
Every decision that was not obvious is in [`TRADEOFFS.md`](TRADEOFFS.md). How AI was used, per PR, is in
[`AI_USAGE.md`](AI_USAGE.md).

## Run it

Requires Node 20 or newer (built on Node 24).

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script              | What it does                               |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Vite dev server with HMR                   |
| `npm test`          | Vitest + Testing Library, 67 tests, ~2s    |
| `npm run typecheck` | `tsc -b --noEmit`                          |
| `npm run lint`      | oxlint (rules-of-hooks, react, typescript) |
| `npm run format`    | Prettier                                   |
| `npm run build`     | Production build to `dist/`                |
| `npm run preview`   | Serve the production build                 |

Definition of done for every PR was `npm run typecheck && npm run lint && npm test && npm run build`; CI
(`.github/workflows/ci.yml`) runs the same plus a format check on every push and pull request.

### The demo clock

Every `available_dates` value in the seed falls between 2026-07-10 and 2026-07-14, so the app pretends today
is **2026-07-09**. That is the one deliberate demo shortcut. To change it:

```bash
VITE_TODAY=now npm run dev          # use the real date (the seed's nights become past)
VITE_TODAY=2026-07-12 npm run dev   # pin any other day
```

The switch is `today()` in `src/lib/dates.ts`; nothing else knows the date is fake.

## Try it

1. `/hotels` lists 40 hotels. Type "se" in **Where to?**, pick Seattle: 4 hotels, URL becomes `?city=Seattle`.
2. Drag the price slider or type in Min/Max: the list narrows as you go, one request per drag.
3. Press **5 stars**: one hotel. Press **1 star** alone: no 1-star hotels exist, so the empty state appears with
   a Reset button.
4. Reload any filtered URL: the filters come back from the query string.
5. Open **The Grand Luminary**. Availability is prefilled to tonight (July 9 → 10): no rooms, with the hint
   "Try Jul 10–12". Focus **Check-in** to get the calendar; click July 10 then July 12. Two room types, with
   nightly price and stay total. Try July 10 → 13: one room open, the other named as not open.
6. Type `07/12/2026` as check-out with check-in `07/12/2026`: the validation alert. Open hotel-04: "This hotel
   has no open dates."
7. `/hotels/hotel-99` shows "Hotel not found"; `/anything` shows the 404.

## How it is built

React 19, TypeScript, Vite, Tailwind v4, React Router, react-day-picker, Vitest + Testing Library. No state
library and no data-fetching library; the reasons are in TRADEOFFS.md.

### Layering

```
URL  →  page  →  hook  →  api  →  pure logic
```

- **Pages** (`src/features/*/…Page.tsx`) are the only components that read the URL and call data hooks.
- **Hooks** (`src/hooks/`) call `api/hotelApi.ts` and expose `{ data, status }`. `useQuery` is the one
  `useEffect` that talks to the API: it aborts superseded requests, turns a failure into `status: 'error'`,
  and derives `idle | loading | refreshing | success | error` from whether the last answer matches the current
  key. Only price changes are debounced (`useFilterDebounce`); clicks query at once.
- **API** (`src/api/hotelApi.ts`) speaks the UI's vocabulary and maps onto the backend contract.
  `mockHotelApi.ts` is an in-memory server behind the same contract, with simulated latency
  (`VITE_MOCK_LATENCY_MS`, default 400ms, 0 under test) and an `AbortSignal` like `fetch()`. Replacing it with
  a real client touches these two files only.
- **Pure logic** (`src/api/logic/`, `src/lib/`) holds every rule: filtering, availability, date maths,
  URL parsing, formatting. All unit-tested with no React.
- **`components/ui/`** are props-only and know nothing about hotels or the router. **`features/`** components
  compose them and receive data as props.

### State management

| State                      | Owner                        | Why                                                         |
| -------------------------- | ---------------------------- | ----------------------------------------------------------- |
| Which page, which hotel    | URL path                     | Shareable, back button works                                |
| Search filters             | URL query string             | Reload and share restore the same view; one source of truth |
| Server data                | `useQuery` result per key    | Derived status, no duplicated loading flags                 |
| Check-in / check-out dates | `RoomAvailability` component | A question asked of one hotel, not a view worth sharing     |
| Typed-but-unapplied text   | The input, or its page       | Transient; the page owns it when two buttons must clear it  |

There is no global store. Everything below a page is props down, callbacks up.

### Backend contract the UI targets

The backend brief defines the API; it is mocked, not implemented. Parameter names on the wire are the
brief's snake_case; the UI's `HotelFilters` are camelCase and mapped in `hotelApi.ts`.

| Endpoint                                                          | Returns                                              |
| ----------------------------------------------------------------- | ---------------------------------------------------- |
| `GET /hotels?city&star_rating&min_price&max_price&page&page_size` | `{ hotels, total, page, page_size }`                 |
| `GET /hotels/facets?city&min_price&max_price`                     | cities, lowest price per star rating, catalogue size |
| `GET /hotels/:id`                                                 | `Hotel`, or nothing (rendered as "not found")        |
| `GET /hotels/:id/rooms?check_in&check_out`                        | rooms open every night of `[check_in, check_out)`    |

The facets endpoint exists so the filter bar never downloads the whole catalogue; totals come from the API,
never from the seed's size. See "Design for production data" in TRADEOFFS.md.

### Component map

```
AppLayout                        header + <Outlet />
├── /hotels  SearchPage          useHotelFilters, useFilterOptions, useHotels
│   ├── FilterBar
│   │   ├── ui/Combobox          city typeahead (ARIA combobox, prefix match, clear)
│   │   ├── PriceRange           ui/NumberInput ×2 + ui/RangeSlider, kept in sync
│   │   └── StarToggle ×5        aria-pressed, "from $X" per rating, never disabled
│   ├── HotelList → HotelCard    or HotelCardSkeleton ×6 while loading
│   └── ui/EmptyState            "No hotels match these filters" + Reset
├── /hotels/:id  HotelDetailPage useHotel
│   ├── BackLink                 history back if arrived from search, else /hotels?city=<city>
│   ├── HotelHeader              image, name, stars, address, rating, policies, contact
│   ├── AmenityList
│   ├── RoomAvailability         useRoomAvailability; dates as local state
│   │   ├── ui/DateInput ×2      typed MM/DD/YYYY, opens the picker on focus
│   │   ├── ui/DatePicker        react-day-picker range mode, styled with theme tokens, lazy-loaded
│   │   ├── RoomCard ×N          type, $/night, beds · sleeps · sq ft, stay total
│   │   └── ui/EmptyState        no rooms / no open dates
│   └── ui/EmptyState            "Hotel not found"
└── *  NotFoundPage
```

### Design rules that shaped the code

- **No layout jumps.** Every async state reserves the space its content will take: skeletons match the real
  boxes, refreshing dims the old list instead of replacing it, empty states take the results slot.
- **Design for production data.** Nothing derives from "there are 40 hotels": options and totals come from
  endpoints, responses are paged, queries are abortable, continuous inputs are debounced, failures are a
  documented state, and the calendar is code-split. Bundle: 116 KB gzipped plus 21 KB for the calendar on demand.
- **One accent, states never differ by hue alone.** 44px targets, a 3px focus ring, `aria-pressed`,
  `aria-live`, `role="alert"` and `role="status"` where the design calls for them.

These live in `.claude/skills/hotel-discovery/SKILL.md`, the conventions file the AI worked from.

## Tests

72 tests in ~2 seconds, colocated with the code they cover.

- **Pure logic**: one test per rule in TRADEOFFS.md (city match, any-room price rule, multi-star, night
  semantics, date parsing edge cases, URL round-trips).
- **Hooks**: `useQuery` for loading → refreshing → success, error status, debounce timing with fake timers,
  abort of superseded requests, idle while disabled; `useFilterDebounce` for price-only changes.
- **UI leaves with logic**: Combobox keyboard and matching, NumberInput live apply and fallback, DateInput,
  DatePicker selection rule and disabled days.
- **Pages**: rendered inside a memory router against the real mock: filters write the URL and narrow the
  list, the empty state resets, the detail page renders every field, availability shows each state.

Queries go through roles and labels, interactions through `userEvent`, and tests pass `today` explicitly
rather than reading the wall clock.

## Repository

Eleven PRs, one per feature, merged with merge commits so the history reads as the roadmap:
bootstrap → app shell → api layer → search list → city filter → price filter → star filter → hotel detail →
room availability → date picker → README → production hardening.
