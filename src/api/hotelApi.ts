import type { IsoDate } from '../lib/dates'
import type { Hotel, HotelFilters, Room } from '../types/hotel'
import type { CityOption, StarOption } from './logic/filters'
import * as mock from './mockHotelApi'

// The one module hooks import. It speaks the UI's vocabulary (HotelFilters,
// camelCase) and maps to the backend contract, so replacing the mock with a
// real client touches only this file and mockHotelApi.ts.

export type { RequestOptions } from './mockHotelApi'

export interface HotelSearchResult {
  hotels: Hotel[]
  /** Matches across all pages. */
  total: number
}

/** First page of hotels matching the filters. Rejects with an AbortError when
 *  `options.signal` fires, like fetch(). */
export async function searchHotels(
  filters: HotelFilters,
  options?: mock.RequestOptions,
): Promise<HotelSearchResult> {
  const page = await mock.getHotels(
    {
      city: filters.city,
      star_rating: filters.stars,
      min_price: filters.minPrice,
      max_price: filters.maxPrice,
      page: 1,
      page_size: mock.DEFAULT_PAGE_SIZE,
    },
    options,
  )
  return { hotels: page.hotels, total: page.total }
}

export interface FilterOptions {
  cities: CityOption[]
  stars: StarOption[]
  totalHotels: number
}

/** What the filter bar shows: city options and per-rating prices under the
 *  current city and price filters. The star selection does not affect it. */
export async function getFilterOptions(
  filters: HotelFilters,
  options?: mock.RequestOptions,
): Promise<FilterOptions> {
  const facets = await mock.getHotelFacets(
    { city: filters.city, min_price: filters.minPrice, max_price: filters.maxPrice },
    options,
  )
  return {
    cities: facets.cities,
    stars: facets.star_prices.map((s) => ({
      stars: s.star_rating,
      fromPrice: s.from_price ?? undefined,
    })),
    totalHotels: facets.total_hotels,
  }
}

export function getHotel(id: string, options?: mock.RequestOptions): Promise<Hotel | undefined> {
  return mock.getHotelById(id, options)
}

export function getAvailableRooms(
  id: string,
  checkIn: IsoDate,
  checkOut: IsoDate,
): Promise<Room[] | undefined> {
  return mock.getHotelRooms(id, checkIn, checkOut)
}
