import type { Hotel, HotelFilters } from '../../types/hotel'

// Pure search rules. Semantics (recorded in TRADEOFFS.md):
// - city: exact, case-insensitive match on address.city; undefined = any city.
// - stars: exact match against any selected rating; empty or undefined = all.
// - price: a hotel matches when ANY room's nightly price is inside
//   [minPrice, maxPrice]; an undefined bound is open on that side.

function matchesCity(hotel: Hotel, city: string | undefined): boolean {
  return city === undefined || hotel.address.city.toLowerCase() === city.toLowerCase()
}

function matchesStars(hotel: Hotel, stars: number[] | undefined): boolean {
  return !stars || stars.length === 0 || stars.includes(hotel.star_rating)
}

function inPriceRange(price: number, { minPrice, maxPrice }: HotelFilters): boolean {
  return (
    (minPrice === undefined || price >= minPrice) && (maxPrice === undefined || price <= maxPrice)
  )
}

/** Lowest nightly price among the hotel's rooms inside the price bounds, or
 *  undefined when no room qualifies. */
export function lowestPriceInRange(hotel: Hotel, filters: HotelFilters): number | undefined {
  const prices = hotel.rooms.map((r) => r.price_per_night).filter((p) => inPriceRange(p, filters))
  return prices.length ? Math.min(...prices) : undefined
}

export function filterHotels(hotels: Hotel[], filters: HotelFilters): Hotel[] {
  return hotels.filter(
    (hotel) =>
      matchesCity(hotel, filters.city) &&
      matchesStars(hotel, filters.stars) &&
      lowestPriceInRange(hotel, filters) !== undefined,
  )
}

export interface CityOption {
  city: string
  country: string
  count: number
}

/** Distinct cities with their country and hotel count, sorted by city name. */
export function cityOptions(hotels: Hotel[]): CityOption[] {
  const byCity = new Map<string, CityOption>()
  for (const { address } of hotels) {
    const option = byCity.get(address.city) ?? {
      city: address.city,
      country: address.country,
      count: 0,
    }
    option.count += 1
    byCity.set(address.city, option)
  }
  return [...byCity.values()].sort((a, b) => a.city.localeCompare(b.city))
}

export interface StarOption {
  stars: number
  /** Lowest in-range price among hotels with this rating that match the other
   *  filters; undefined when none match. */
  fromPrice: number | undefined
}

export const STAR_RATINGS = [5, 4, 3, 2, 1] as const

/** One entry per rating, 5 down to 1, priced against the current city and
 *  price filters (the star selection itself is ignored so every toggle stays
 *  informative). */
export function starOptions(hotels: Hotel[], filters: HotelFilters): StarOption[] {
  const candidates = filterHotels(hotels, { ...filters, stars: undefined })
  return STAR_RATINGS.map((stars) => {
    const prices = candidates
      .filter((h) => h.star_rating === stars)
      .map((h) => lowestPriceInRange(h, filters))
      .filter((p): p is number => p !== undefined)
    return { stars, fromPrice: prices.length ? Math.min(...prices) : undefined }
  })
}
