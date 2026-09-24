# Tradeoffs

Decisions made while building the Hotel Discovery UI, appended as they land. Each bullet says
what was chosen, and why, so a reviewer can disagree with the reasoning rather than guess at it.

## Bootstrap

- **Stack: React 19 + TypeScript + Vite, Tailwind v4, React Router v7, react-day-picker, Vitest + Testing Library.**
  Small, current, and boring on purpose. No state or data-fetching library: the URL owns page identity and filters,
  and a 40-hotel in-memory dataset does not justify a cache layer.
- **oxlint instead of ESLint.** Vite's current React template ships oxlint. It runs the rules-of-hooks check we
  care about and is much faster; swapping to ESLint would cost setup time and buy nothing at this size.
- **Design tokens live in `src/index.css` as Tailwind `@theme` values** (accent, ink, muted, line, page, panel,
  IBM Plex Sans/Mono). Components use utilities like `bg-page` and `text-muted`, never raw hex, so the palette
  can change in one place.
- **Seed data is copied verbatim** from the design handoff into `src/data/hotels.json` and excluded from Prettier.
  It is identical to the seed in the assignment PDF. The apparent "invalid JSON" in the PDF (repeated room objects,
  a duplicated `city` key) are page-break artifacts from copying text, not defects in the dataset.
- **Types mirror the backend brief's snake_case keys** (`star_rating`, `price_per_night`, `available_dates`).
  Keeping the wire shape means the mock API and a real one return identical objects; no mapping layer to maintain.
- **Dataset facts the UI relies on:** 40 hotels across 10 cities (4 each), 42 rooms (max 2 per hotel), prices $75–$590,
  star ratings 2–5 (no 1-star hotels), every `available_dates` value between 2026-07-10 and 2026-07-14, and six
  hotels (04, 10, 17, 24, 31, 36) with no open dates at all. A seed test pins the counts and the date window.
- **Currency is USD everywhere.** The data has no currency field. Hotels span six countries (USA, UK, France,
  Japan, Australia, Italy) but every price is shown as USD; no conversion or locale-specific formatting.
- **Desktop-only layout (1280px).** The design handoff covers desktop only; a mobile layout is out of scope for the
  3-hour framing and is the first thing to add afterwards.

## Routing and URL design

- **React Router v7 (`react-router` package) in data-router mode, no loaders.** `createBrowserRouter` over a plain
  route table exported from `src/routes.tsx`; tests bind the same table to `createMemoryRouter`, so route
  behaviour is tested without touching `window.location`. Loaders are skipped because data comes from a
  synchronous in-memory seed; page-level hooks keep the layering simpler to read.
- **URL owns page identity and filters:** `/hotels?city=…&stars=…&minPrice=…&maxPrice=…` and `/hotels/:id`.
  `/` redirects to `/hotels` so there is one canonical search URL. Unknown paths render the 404 page with a
  "Search hotels" link; an unknown hotel id is handled by the detail page, not the router, because the route
  is valid and only the data is missing.
- **No in-app URL strip.** The wireframes show a mono "URL /hotels…" bar under the header; that is a wireframe
  annotation for reviewers. The browser's address bar already shows the route, so the app renders only the header.
- **Layout:** one `AppLayout` with the StayFinder header and an `<Outlet />`. No navigation links yet; the header
  is a brand mark until a feature needs more.

## Data layer

- **Mock API mirrors the backend brief, one module deep.** `api/mockHotelApi.ts` exposes the three endpoints
  (`GET /hotels`, `/hotels/:id`, `/hotels/:id/rooms`) with the brief's snake_case params and returns Promises.
  `api/hotelApi.ts` is the only import hooks use; it maps the UI's `HotelFilters` onto those params. Swapping in
  `fetch()` touches two files and nothing above them.
- **Multi-star search in one request.** The brief's `star_rating` is a single value; the UI multi-selects. The mock
  accepts an array. A real backend would need either repeated `star_rating` params or one request per rating.
- **Unknown hotel id resolves to `undefined`,** standing in for a 404, rather than throwing. Pages render "not found"
  from a value, not from a catch block.
- **Filter semantics:** city is an exact, case-insensitive match; stars match any selected rating and an empty
  selection means all; price matches a hotel when ANY room is inside `[minPrice, maxPrice]` and an unset bound is
  open. Cards will show the lowest in-range price. Star toggles are priced against the current city and price
  filters with the star selection ignored, so every toggle stays informative.
- **Night semantics:** a stay covers `[checkIn, checkOut)`; the guest leaves on check-out morning, so the check-out
  date never needs to be available. A room is open only when every night is in `available_dates`. Check-out on
  or before check-in is invalid and opens nothing.
- **Dates are ISO strings, not Date objects.** Arithmetic goes through `Date.UTC` so time zones never shift a day.
  No date library: the maths is a few lines and `Intl.DateTimeFormat` does the formatting. The design suggested
  date-fns; react-day-picker will pull it in transitively later, but the app's own code stays independent of it.
- **Fake "today" is 2026-07-09,** the day before the seed's only open dates, so the demo can book. `lib/dates.ts#today()`
  is the single switch: `VITE_TODAY=now` uses the wall clock, `VITE_TODAY=YYYY-MM-DD` pins another day.
- **Amenity labels are humanized, not mapped.** `fitness_center` → "Fitness center" by replacing underscores and
  capitalizing the first letter; brand casing like "free Wi-Fi" survives. A lookup table would be more polished
  and is not worth its maintenance for 40 hotels.

## Search list

- **Loading is derived, not stored.** `useHotels` keeps the last result with the filter key it answered; "loading"
  means the current key differs. No `setState` inside the effect, and a stale response is dropped by the cleanup
  flag.
- **Skeleton cards while loading.** Every card is the same box, so `HotelList` renders six `HotelCardSkeleton`s
  (aria-hidden, `aria-busy` on the region) and swaps them for real cards without the page jumping. Six fills a
  1280×900 viewport. The count line reads "Loading hotels…" for screen readers.
- **The mock API waits 400ms in the browser, 0ms under test.** Without latency the skeletons would never be seen;
  the delay is the one place the mock is deliberately unlike an in-memory lookup.
- **Search results are time-agnostic.** DESIGN.md puts a "No open dates" tag on cards for hotels with empty
  `available_dates`. Matt's call: the list is about place, stars and price; dates belong to the detail page. The
  tag is dropped here and "This hotel has no open dates" will appear only in the availability panel.
- **Cards advertise the lowest in-range price.** `HotelList` computes it with `lowestPriceInRange` and passes a
  number to `HotelCard`, so the card stays a dumb renderer. With no price filter that is simply the cheapest room.
- **"N of 40 hotels" hard-codes the total.** The dataset is fixed and the copy is from the design; deriving it
  would mean a second query.
- **Amenities show three plus "+N more".** Per the design; the full list is on the detail page.
- **Placeholder image is a crossed box.** The data has no images; a box keeps the card's shape honest.

## Filters and the city combobox

- **Filters live in the URL, nowhere else.** `useHotelFilters` is the only reader and writer of the query string;
  `lib/filterParams.ts` does the parsing and serializing as pure functions. Malformed values are dropped, not
  thrown; defaults are omitted so `/hotels` stays clean and equal filters give equal URLs. Filter changes use
  `replace` so the back button leaves the search page instead of stepping through every keystroke.
- **The typed city text lives on the page, not in the combobox.** Draft text is transient UI state, but two
  buttons (the panel's Reset and the empty state's Reset) must clear it together with the URL, so `SearchPage` is
  its closest common owner. `ui/Combobox` stays fully controlled and reusable.
- **Combobox matching is a generic prefix match** on label, description, or selected text. For cities that gives
  the design's rules (city, country, or "City, Country") without the component knowing what a city is.
- **Typing after a selection keeps the text and drops the filter,** per DESIGN.md. The input then reads
  "Seattle, USAx" with "No cities match" beneath; the list returns to all 40 hotels until a new option is picked.
- **City options come from an unfiltered search.** The backend brief has no cities endpoint, so `useCityOptions`
  derives them once from `GET /hotels`; a real API could swap in a dedicated call.
- **A city in the URL that is not in the catalogue** (`?city=Nowhere`) filters to zero and shows the empty state
  with a blank input, since there is no option to display. The URL is honoured rather than silently dropped.
- **Two Reset buttons.** The panel's ghost "Reset filters" is always present; the empty state's primary one is
  where the user is looking when nothing matches. Both call the same handler.
- **Layout:** the dropdown overlays the results instead of pushing them, and the empty state takes the results
  slot while the count line and filter panel stay put, so nothing above the user's focus moves.

## Price range

- **Bounds $50–$600 in $5 steps,** from the design; the data spans $75–$590 so both ends have slack. The rule
  stays "a hotel matches when ANY room is in range" and cards show the lowest in-range price.
- **Two native `<input type="range">` stacked on one track** instead of a slider library: keyboard, screen-reader
  and touch support come free, and the only trick is `pointer-events: none` on the inputs with `auto` on the
  thumbs. Thumb styling uses Tailwind's pseudo-element variants inline, so no CSS file is touched.
- **Number inputs apply live, but only valid values.** Every keystroke or spin that yields a value inside the
  box's bounds is snapped to the $5 step and applied at once, moving the slider and the list. Out-of-range drafts
  ("1" on the way to "100", or "9999") stay in the box while typing and are discarded on blur or Enter, so the
  box falls back to its last applied value. Nothing is ever clamped; an invalid entry is simply not taken.
- **No debounce.** Each applied value is one `replace` navigation and one in-memory query; the refreshing state
  keeps the list stable. With a real API the fetch inside `useHotels` would be debounced, not the URL update.
- **Handles cannot cross.** The slider keeps min ≤ max − $5. Each box takes the other handle as its bound, so a
  typed value past it is discarded on blur and the box falls back to its last applied value, the way Expedia
  does. Clamping it to the other handle would silently collapse the range to a single price.
- **The price boxes are `type="text"` with `inputMode="numeric"`, not `type="number"`.** The number spinner
  stepped from the on-screen draft and could walk a min past the max; it also accepts "e" and "-". Digits-only
  parsing in the component, a numeric keyboard on touch, and the slider for coarse changes cover the need.
- **Values at the bounds are written as `undefined`,** so an untouched slider leaves the URL clean and does not
  trigger a refetch with a different key.
- **Stale results stay visible while a filter change is answered.** `useHotels` now distinguishes `loading`
  (nothing yet, skeletons) from `refreshing` (previous list dimmed with `aria-busy`), so dragging the slider
  never collapses the page into skeletons. Every step still hits the mock; no debounce, because a 40-hotel
  in-memory query is cheaper than the added latency and code.

## UI states

Documented here as they are built.

- **404** (`/anything`): mono "404", "Page not found", one-line explanation, "Search hotels" button link.

- **Loading** (search page): "Loading hotels…" in the `aria-live` count region plus six skeleton cards.
- **Refreshing** (search page): previous cards stay, dimmed to 60%, `aria-busy` on the results region.
- **No hotels match** (search page, `role="status"`): dashed panel, "No hotels match these filters", hint, primary
  Reset filters button. The count line reads "0 of 40 hotels".
- **No cities match** (combobox): one line inside the list, `No cities match "…"`; the input keeps its text.

Still to build: availability idle; invalid date range; no rooms
available; hotel has no open dates; hotel not found; 404; one-line loading.

## Out of scope

Per-night prices in the calendar, mobile layout, dates in the URL, real backend or fetch, error boundaries,
form/state libraries, sorting, free-text name search, amenity filters, pagination, real images or maps, booking flow,
guest count, currency conversion, dark mode, Storybook, E2E tests, CI, deployment.
