# StayFinder: Hotel Discovery UI

A React and TypeScript app for searching hotels by city, star rating and price, viewing a hotel’s details, and checking which room types are open for a stay.

## Install

Requires Node 20 or newer.

```bash
npm install
```

## Run

```bash
npm run dev        # http://localhost:5173
```

## Test

```bash
npm test           # Vitest + Testing Library
```
### Date 

For demo purposes to fit the data we are simulating "today" to be July 9th 2026 for the mock data. Set VITE_TODAY=now to default to actual date today.
## State management

- The URL owns which page, which hotel, and the search filters, so a reload or shared link restores the same view.
- Server data lives in the `useQuery` result for the current request key. Loading, refreshing, success and error are derived from that result, not stored as separate flags.
- Check-in and check-out dates are local state in `RoomAvailability`. Typed-but-unapplied text stays in the input.
- No global store and no state or data-fetching library. Below a page it is props down, callbacks up.

## Component breakdown

Layers: `URL → page → hook → api → pure logic`

- **Pages** (`src/features/*/…Page.tsx`) are the only components that read the URL and call data hooks.
- **Hooks** (`src/hooks/`) call `api/hotelApi.ts` and expose `{ data, status }`.
- **API** (`src/api/hotelApi.ts`) maps the UI’s filters onto the backend contract. `mockHotelApi.ts` is an in-memory server behind the same contract.
- **Pure logic** (`src/api/logic/`, `src/lib/`) holds filtering, availability, date maths and URL parsing, with no React.
- **`components/ui/`** are props-only primitives. **`features/`** components compose them and receive data as props.

```
AppLayout
├── /hotels  SearchPage
│   ├── FilterBar: Combobox (city), PriceRange, StarToggle ×5
│   ├── HotelList → HotelCard (skeletons while loading)
│   └── EmptyState with Reset
├── /hotels/:id  HotelDetailPage
│   ├── HotelHeader, AmenityList
│   └── RoomAvailability: DateInput ×2, DatePicker, RoomCard ×N
└── *  NotFoundPage
```
