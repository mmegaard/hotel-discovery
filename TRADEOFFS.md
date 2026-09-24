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

## UI states

Documented here as they are built.

- **404** (`/anything`): mono "404", "Page not found", one-line explanation, "Search hotels" button link.

Still to build: no hotels match; availability idle; invalid date range; no rooms
available; hotel has no open dates; hotel not found; 404; one-line loading.

## Out of scope

Per-night prices in the calendar, mobile layout, dates in the URL, real backend or fetch, error boundaries,
form/state libraries, sorting, free-text name search, amenity filters, pagination, real images or maps, booking flow,
guest count, currency conversion, dark mode, Storybook, E2E tests, CI, deployment.
