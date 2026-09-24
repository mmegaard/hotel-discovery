# Tradeoffs

Decisions made while building the Hotel Discovery UI, appended as they land. Each bullet says
what was chosen, and why, so a reviewer can disagree with the reasoning rather than guess at it.

## Bootstrap

- **Stack: React 19 + TypeScript + Vite, Tailwind v4, React Router v8, react-day-picker v10, Vitest + Testing Library.**
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
  3-hour framing and is the first thing to add afterwards. The one responsive rule is the detail grid collapsing
  below 1024px (see "Hotel detail").

## Routing and URL design

- **React Router v8 (`react-router` package) in data-router mode, no loaders.** `createBrowserRouter` over a plain
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
- **Search responses are paged.** `GET /hotels` returns `{ hotels, total, page, page_size }`; the UI asks for page 1
  with a page size of 50 and renders it. With the 40-hotel seed that is everything. A paging or infinite-scroll UI
  is out of scope for the 3-hour framing, but the contract already carries what it needs.
- **`useQuery` is the one effect that talks to the API.** Debounce, abort, refreshing status and the ignore flag
  live there; `useHotels` and `useFilterOptions` are thin wrappers that pick a key and a call.
- **Multi-star search in one request.** The brief's `star_rating` is a single value; the UI multi-selects. The mock
  accepts an array. A real backend would need either repeated `star_rating` params or one request per rating.
- **Unknown hotel id resolves to `undefined`,** standing in for a 404, rather than throwing. Pages render "not found"
  from a value, not from a catch block.
- **Filter semantics:** city is an exact, case-insensitive match; stars match any selected rating and an empty
  selection means all; price matches a hotel when ANY room is inside `[minPrice, maxPrice]` and an unset bound is
  open. Cards show the lowest in-range price. Star toggles are priced against the current city and price
  filters with the star selection ignored, so every toggle stays informative.
- **Night semantics:** a stay covers `[checkIn, checkOut)`; the guest leaves on check-out morning, so the check-out
  date never needs to be available. A room is open only when every night is in `available_dates`. Check-out on
  or before check-in is invalid and opens nothing.
- **Dates are ISO strings, not Date objects.** Arithmetic goes through `Date.UTC` so time zones never shift a day.
  No date library: the maths is a few lines and `Intl.DateTimeFormat` does the formatting. The design suggested
  date-fns; react-day-picker pulls it in transitively, but the app's own code stays independent of it.
- **Fake "today" is 2026-07-09,** the day before the seed's only open dates, so the demo can book. `lib/dates.ts#today()`
  is the single switch: `VITE_TODAY=now` uses the wall clock, `VITE_TODAY=YYYY-MM-DD` pins another day.
- **Amenity labels are humanized, not mapped.** `fitness_center` → "Fitness center" by replacing underscores and
  capitalizing the first letter; brand casing like "free Wi-Fi" survives. A lookup table would be more polished
  and is not worth its maintenance for 40 hotels.

## Search list

- **Loading is derived, not stored.** `useQuery` keeps the last result with the key it answered; "loading" means
  there is no result yet and "refreshing" means the key has moved on. No `setState` inside the effect, and a
  stale response is dropped by the cleanup flag.
- **Skeleton cards while loading.** Every card is the same box, so `HotelList` renders six `HotelCardSkeleton`s
  (aria-hidden, `aria-busy` on the region) and swaps them for real cards without the page jumping. Six fills a
  1280×900 viewport. The count line reads "Loading hotels…" for screen readers.
- **The mock API waits 400ms in the browser, 0ms under test.** Without latency the skeletons would never be seen;
  the delay is the one place the mock is deliberately unlike an in-memory lookup.
- **Search results are time-agnostic.** DESIGN.md puts a "No open dates" tag on cards for hotels with empty
  `available_dates`. Matt's call: the list is about place, stars and price; dates belong to the detail page. The
  tag is dropped here and "This hotel has no open dates" appears only in the availability panel.
- **Cards advertise the lowest in-range price.** `HotelList` computes it with `lowestPriceInRange` and passes a
  number to `HotelCard`, so the card stays a dumb renderer. With no price filter that is simply the cheapest room.
- **"N of 40 hotels" reads both numbers from the API.** N is `total` on the search response (matches across all
  pages); 40 is `total_hotels` from the facets response. Nothing about the dataset size is hard-coded.
- **Amenities show three plus "+N more".** Per the design; the full list is on the detail page.
- **The wireframe's "Prices are the lowest nightly rate in your range" line is dropped.** It was wireframe
  annotation; the card's "from $X per night" already says it.
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
- **City options come from the facets endpoint** (see "Star rating"), not from downloading every hotel.
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
- **Debounce in the hook, not the inputs.** Every applied value still writes the URL and moves the slider at
  once, so the UI feels direct, but `useQuery` waits 250ms of quiet before querying (0ms under test). The list
  reads as refreshing from the first change. A slider drag therefore costs one request, not dozens.
- **Superseded queries are aborted.** `searchHotels` takes an `AbortSignal` like `fetch()`; the hook aborts the
  previous controller on every change and drops any answer that still arrives. The mock honours the signal, so
  swapping in `fetch` keeps the same contract.
- **Handles cannot cross.** The slider keeps min ≤ max − $5. Each box takes the other handle as its bound, so a
  typed value past it is discarded on blur and the box falls back to its last applied value, the way Expedia
  does. Clamping it to the other handle would silently collapse the range to a single price.
- **The price boxes are `type="text"` with `inputMode="numeric"`, not `type="number"`.** The number spinner
  stepped from the on-screen draft and could walk a min past the max; it also accepts "e" and "-". Digits-only
  parsing in the component, a numeric keyboard on touch, and the slider for coarse changes cover the need.
- **Values at the bounds are written as `undefined`,** so an untouched slider leaves the URL clean and does not
  trigger a refetch with a different key.
- **Stale results stay visible while a filter change is answered.** `useQuery` distinguishes `loading`
  (nothing yet, skeletons) from `refreshing` (previous list dimmed with `aria-busy`), so dragging the slider
  never collapses the page into skeletons.

## Star rating

- **Five toggles, multi-select, exact match.** `aria-pressed` buttons from 5 down to 1; any combination; an empty
  selection means all ratings. Selected ratings serialize as `stars=5,4`.
- **Each toggle shows "from $X" under the current city and price filters** with the star selection itself ignored,
  so a pressed toggle never hides the price that would justify pressing another. Computed by `starOptions` in
  the pure logic layer, behind the facets endpoint.
- **Nothing is disabled.** A rating with no matches (there are no 1-star hotels) reads "no matches" and stays
  clickable; pressing it alone yields the empty state with its Reset button. Disabled controls are easy to miss
  and read as broken to screen readers; a clear "no matches" plus an honest empty state is friendlier.
- **Filter options come from a facets endpoint, not the whole catalogue.** `GET /hotels/facets?city&min_price&max_price`
  (mocked) returns every city, the lowest in-range price per rating, and the catalogue size. Downloading all
  hotels to derive these would not survive real data volumes. `useFilterOptions` keys on city and price only, so
  toggling stars never refetches.
- **Fixed-size toggles with a 2px border in both states,** so pressing one never shifts its neighbours.

## Hotel detail

- **Not found is a value, not an exception.** `useHotel` returns `status: 'not-found'` when the API answers with
  nothing; the page renders the designed empty state with "Browse all hotels". No error boundary is needed for
  the one failure the UI expects.
- **Back link: history back when the user came from within the app, else `/hotels?city=<city>`.** React Router
  keeps an index in `history.state`; a positive index means there is somewhere to go back to, which restores the
  user's filters. A direct visit or shared link falls back to the search page pre-filtered to the hotel's city.
  Rendered as a real link so the fallback shows in the status bar and works without JavaScript.
- **No individual reviews.** The data has only an aggregate rating and count, so the header shows "4.8 out of 5 ·
  1,240 reviews" and nothing else; a reviews section would be invented content.
- **Address is one line** ("street, city, state zip, country") via `formatAddress`; the data has no locale
  hints and every address is fine in that order.
- **Skeleton mirrors the header and amenity boxes** so the page does not jump when the hotel arrives. The right
  column was reserved at 440px before the availability panel existed, so the layout never changed when it landed.
- **The detail grid collapses to one column below 1024px,** with availability dropping under the amenities.
  Desktop stays the designed layout; this is the one responsive rule in the app, so a narrower window still reads
  in order. A full mobile pass (filter bar, cards, touch targets at 375px) remains out of scope.
- **`RatingBadge` gained a size** rather than a second component; the detail header uses the large one with
  "out of 5" beside it, per the wireframe.

## Room availability

- **Dates are local state on the panel, not in the URL.** A stay is a question the user asks of one hotel, not a
  view worth sharing; keeping it out of the URL keeps `/hotels/:id` canonical. Check-in and check-out reset when
  the user leaves the page.
- **Typed dates apply live once complete and valid,** like the price boxes: a real MM/DD/YYYY on or after today
  for check-in (after today for check-out) applies as typed; anything else stays in the box until blur, then the
  box falls back. Clearing the box clears the date.
- **A new check-in that overtakes the check-out clears the check-out** (per the wireframe), so the only way to
  reach the invalid state is typing a check-out on or before the check-in, which shows the `role="alert"`.
- **The panel asks the API, not the hotel object.** `useRoomAvailability` calls `GET /hotels/:id/rooms` for the
  open rooms even though every room is already in memory, so the layering matches a real backend where
  availability is not embedded in the hotel. The closed list is derived from the hotel's rooms minus the answer.
  The query is disabled (`useQuery` "idle") until both dates form a valid stay.
- **Loading shows room-card-sized skeletons** so the panel does not jump; a re-query for new dates keeps the
  previous cards dimmed.
- **Open-nights hint** ("Open nights at this hotel: Jul 10–12, 2026") stays under the inputs in every state, so
  the user knows what to type before they type it. Runs of consecutive dates come from `spans()`.
- **`EmptyState` gained `compact` and `headingLevel`** rather than a second component: inside the panel it sits
  under an h2, so its title is an h3.

## Date picker

- **react-day-picker for the calendar.** Keyboard navigation, ARIA grid semantics, month navigation and range
  display come from the library; writing those by hand would eat the remaining budget for no design gain. Its
  stylesheet is not imported: every slot is styled through `classNames` with the theme tokens, so the calendar
  looks like the rest of the app (44px day buttons, 3px focus ring, one accent).
- **The selection rule is ours, not the library's.** `onSelect` ignores the library's proposed range and uses
  the clicked day plus which input the user is filling in: from the check-in box any click restarts the range
  and prompts for check-out; from the check-out box a click after check-in completes it, a click on or before
  check-in restarts. This matches the wireframe's "first click sets check-in, second sets check-out" without the
  library's shrink-or-extend behaviour on a complete range.
- **The picker opens on focus of either input and renders inline** below them, per the wireframe, so results
  move down while it is open. That is the one place content below the user's focus shifts; the inputs, hint and
  everything above stay put. It closes on Done, Escape, or focus leaving the dates area.
- **Local `Date` at midnight is the bridge** to the library (`toLocalDate` / `fromLocalDate`); the app's own
  state stays ISO strings. Range is limited to today through one year out.
- **Per-night prices under each day are dropped,** as DESIGN.md allows ("drop first if time is short"); the
  open-nights hint under the inputs carries the same information.
- **date-fns arrives as a transitive dependency** of react-day-picker; the app's own code still does not import it.

## UI states

Documented here as they are built.

- **404** (`/anything`): mono "404", "Page not found", one-line explanation, "Search hotels" button link.
- **Loading** (search page): "Loading hotels…" in the `aria-live` count region plus six skeleton cards.
- **Refreshing** (search page): previous cards stay, dimmed to 60%, `aria-busy` on the results region.
- **No hotels match** (search page, `role="status"`): dashed panel, "No hotels match these filters", hint, primary
  Reset filters button. The count line reads "0 of 40 hotels".
- **Hotel not found** (`/hotels/hotel-99`, `role="status"`): dashed panel, "Hotel not found", one line, "Browse
  all hotels" button link. The back link still works.
- **Loading** (detail page): skeleton of the header and amenity boxes.
- **Availability idle** (detail panel): "Choose your dates to see which rooms are open. This hotel offers N
  room types." in a tinted box.
- **Invalid date range** (`role="alert"`): "Check-out must be after check-in." with an icon, replacing results.
- **Checking availability** (detail panel): one line plus one skeleton per room type.
- **No rooms available** (`role="status"`, compact): "No rooms available for these dates" and "Try Jul 10–12."
- **Hotel has no open dates**: hint reads "This hotel has no open nights right now." and the empty state says
  "This hotel has no open dates. Try another hotel."
- **No cities match** (combobox): one line inside the list, `No cities match "…"`; the input keeps its text.

All designed states are built.

## Out of scope

Per-night prices in the calendar, a full mobile layout, dates in the URL, real backend or fetch, error
boundaries, form/state libraries, sorting, free-text name search, amenity filters, a paging UI (the contract is
paged; the seed fits on one page), real images or maps, booking flow, guest count, currency conversion, dark mode,
Storybook, E2E tests, CI, deployment.
