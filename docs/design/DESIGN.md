# Hotel Discovery: design handoff

The artifacts folder holds the artboard
sources for reference; they are readable markup with the filter and availability
logic in plain JavaScript at the bottom of each file. They are not React and are
not meant to be ported line by line.

## Assignment in one paragraph

Lightweight frontend for browsing hotels from a local JSON seed. Three required
capabilities: (1) a search page that filters by city, star rating and price
range and updates as filters change; (2) a hotel detail view showing name,
address, description, rating and review count, and amenities; (3) a room
availability checker on the detail view that takes check-in and check-out dates
and lists the room types open for every night of the stay, with price per night.
Time budget is 3 hours. Reviewers prefer clean and working over ambitious and
incomplete. Deliverables also include a README (install, run, test, state
management approach, component breakdown), a separate tradeoffs file, an AI
tooling section, and unit or component tests where they add value.

## Routes and component map

```
<RouterProvider>                 no app-level store; the URL owns page + filters
├── /hotels → SearchPage         useHotelFilters() → filters from URL; useHotels(filters)
│   ├── FilterBar                props: filters, cities[], onChange, onReset
│   │   ├── ui/Combobox          city typeahead
│   │   ├── PriceRange           min/max number inputs + two-handle slider
│   │   └── StarToggle ×5        aria-pressed toggle buttons
│   ├── HotelList                props: hotels
│   │   └── HotelCard            props: hotel → <Link to="/hotels/:id">
│   └── ui/EmptyState            "No hotels match these filters"
├── /hotels/:id → HotelDetailPage   useParams() → id; useHotel(id)
│   ├── BackLink                 history back; falls back to /hotels?city=<hotel city>
│   ├── HotelHeader
│   ├── AmenityList
│   ├── RoomAvailability         props: hotel; local state: checkIn, checkOut
│   │   ├── ui/DateInput ×2      typed MM/DD/YYYY, opens DatePicker on focus
│   │   ├── ui/DatePicker        wraps react-day-picker, range mode
│   │   ├── RoomCard
│   │   └── ui/EmptyState        "No rooms available for these dates"
│   └── ui/EmptyState            "Hotel not found"
└── * → NotFoundPage
```

## Decisions already made

State

- Filters live in the URL query string (`?city=Seattle&stars=5,4&minPrice=100&maxPrice=300`).
  No global store. `useHotelFilters` reads and writes `useSearchParams`.
- Check-in and check-out are local state on `RoomAvailability`, not in the URL.
- Filtering and availability are pure functions with no React in them, so they
  can be unit tested directly.

Search page

- City: combobox with typeahead. Options show "City" with "Country · N hotels"
  underneath. Matching is prefix on city or country. A clear (X) button empties it.
  Typing after a selection drops the city filter until a new option is picked.
- Price: min and max number inputs plus a two-handle slider, kept in sync.
  Range is $50 to $600 in $5 steps. A hotel matches if ANY of its rooms is inside
  the range. The card shows the lowest in-range room price as "from $X".
- Star rating: five toggle buttons (5 down to 1), any combination. Each shows
  star glyphs (aria-hidden) and "N stars · from $X" or "N stars · no matches".
  "From" respects the city and price already chosen. Two visual states only:
  white with grey border, or blue fill with white text. State is announced via
  `aria-pressed`. Nothing is ever disabled; picking a rating with no matches
  shows the empty state.
- Results header: "N of 40 hotels" in an `aria-live="polite"` region.
- Empty state: "No hotels match these filters" with a Reset filters button.
- Hotel card: name (link), "City, Country", star glyphs, rating badge,
  review count, first three amenities plus "+N more", "from $X per night".
  Hotels with no open dates at all get a "No open dates" tag.

Detail page

- Back link: use history back when there is history (`window.history.state?.idx > 0`
  in React Router 6). Otherwise navigate to `/hotels?city=<this hotel's city>`.
- Header: image placeholder, name, star glyphs, full address, rating badge with
  "out of 5" and review count, description, then a three-column block for
  check-in/out times, cancellation policy, and contact.
- Amenities: three-column list with check icons. Snake_case keys are title-cased
  for display (`fitness_center` → "Fitness center").
- Availability panel (right column, 440px):
  - Two typed date inputs (MM/DD/YYYY). Focusing either opens the calendar.
  - Calendar: past days are struck through and not selectable. Today has a
    dark ring. First click sets check-in and prompts for check-out; second
    click sets check-out. Days in between get a light fill. Each open night
    shows the hotel's lowest room price for that night under the day number
    (nice-to-have; drop first if time is short). Footer: Today (jumps the
    calendar back to the current month), Clear, Done.
  - A stay covers every night from check-in up to, but not including,
    check-out. A room is open if every one of those nights is in its
    `available_dates`.
  - Results: "N room types open for M nights · Fri, Jul 10 to Sun, Jul 12",
    then a RoomCard per open room (type, price/night, bed summary, sleeps,
    square footage, room amenities, stay total). Rooms not open are named in
    one line: "Not open for these dates: ...".
  - Empty state: "No rooms available for these dates" with a hint listing the
    hotel's open nights, or "This hotel has no open dates" when there are none.
  - Validation: check-out on or before check-in shows a `role="alert"` message.
- Hotel not found (`/hotels/hotel-99`): empty state with a "Browse all hotels" link.

Not-found route: 404 page with a "Search hotels" link.

Visual

- Colorblind-safe: one accent (#1f5fbf blue) on warm greys. No red/green. Every
  state also differs by lightness or by an icon or text, never by hue alone.
- Type: IBM Plex Sans for UI, IBM Plex Mono for the URL bar and labels.
- Touch targets 44px minimum. Visible 3px focus ring on everything focusable.
- Layout is desktop (1280px). Mobile is out of scope for the 3-hour budget;
  say so in tradeoffs.

Library choices

- react-day-picker for the calendar (keyboard navigation and ARIA built in,
  range mode, `disabled={{ before: today }}`). date-fns for night math.
- No global state library.

## Mock data

`hotels.json` is the cleaned seed. The PDF as delivered has problems that must
be documented in the tradeoffs file:

- hotel-02, 19, 21, 25, 27 each repeat one room object with a missing comma
  between the copies, so the raw text is not valid JSON. Cleaned by
  de-duplicating on `room_id`.
- hotel-40 has the `city` key twice in its address.
- No currency field. All prices treated as USD, including London, Paris, Tokyo,
  Sydney and Rome.
- Every `available_dates` value falls between 2026-07-10 and 2026-07-14.
  Every `available_dates` value falls between 2026-07-10 and 2026-07-14.
  The demo should fake “today" to be July 9th 2026. This should be easy to change in the future to be the actual date.
- 6 of 40 hotels have no open dates at all (04, 10, 17, 24, 31, 36). No hotel is
  1 star. Max 2 rooms per hotel.

## Requirements check

| Requirement                                    | Design                                                                          |
| ---------------------------------------------- | ------------------------------------------------------------------------------- |
| Filter by city                                 | Combobox                                                                        |
| Filter by star rating                          | Five toggles                                                                    |
| Filter by price range                          | Min/max + slider                                                                |
| List updates as filters change                 | Derived state, no submit button                                                 |
| Detail: name, address, description             | HotelHeader                                                                     |
| Detail: reviews/ratings                        | Rating badge + review count (data has no individual reviews; note in tradeoffs) |
| Detail: amenities                              | AmenityList                                                                     |
| Check-in / check-out input                     | DateInput ×2 + DatePicker                                                       |
| Show available room types with price per night | RoomCard list                                                                   |
| Empty states documented                        | Four designed: no hotels, no rooms, hotel not found, 404                        |

## Suggested tests (for later)

- `filterHotels(hotels, filters)`: city match, any-room-in-price-range rule,
  multiple star selections, empty result.
- `openRooms(hotel, checkIn, checkOut)`: two-night stay needs both nights,
  check-out night is not required, empty `available_dates`, invalid range.
- `RoomAvailability` component: picking dates renders the right cards and the
  empty state.
