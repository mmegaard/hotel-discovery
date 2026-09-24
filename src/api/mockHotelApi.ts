import type { IsoDate } from '../lib/dates'
import type { Hotel, Room } from '../types/hotel'
import seed from '../data/hotels.json'
import { roomsAvailableFor } from './logic/availability'
import { cityOptions, filterHotels, starOptions, type CityOption } from './logic/filters'

// In-memory stand-in for the backend brief's endpoints. Parameter names are the
// backend's (snake_case); hotelApi.ts translates from the UI's filters. Every
// call returns a Promise and honours an AbortSignal so fetch() can replace it.

const hotels: Hotel[] = seed

/** Simulated network latency so loading states are visible in the browser.
 *  Zero under test so the suite stays fast. */
const LATENCY_MS = import.meta.env.MODE === 'test' ? 0 : 400

/** Resolves after the simulated latency, or rejects with an AbortError if the
 *  caller gave up first, exactly as fetch() would. */
function delay(signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason)
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, LATENCY_MS)
    function onAbort() {
      clearTimeout(timer)
      reject(signal!.reason)
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

export interface RequestOptions {
  signal?: AbortSignal
}

export interface HotelSearchParams {
  city?: string
  /** The brief takes one star_rating; the mock accepts several so the UI's
   *  multi-select needs one request (TRADEOFFS.md). */
  star_rating?: number[]
  min_price?: number
  max_price?: number
  page?: number
  page_size?: number
}

export interface HotelPage {
  hotels: Hotel[]
  /** Hotels matching the filters across all pages. */
  total: number
  page: number
  page_size: number
}

export const DEFAULT_PAGE_SIZE = 50

/** GET /hotels — one page of matches plus the total, so the UI never needs the
 *  whole catalogue to know how many there are. */
export async function getHotels(
  params: HotelSearchParams = {},
  options: RequestOptions = {},
): Promise<HotelPage> {
  await delay(options.signal)
  const matches = filterHotels(hotels, {
    city: params.city,
    stars: params.star_rating,
    minPrice: params.min_price,
    maxPrice: params.max_price,
  })
  const page = params.page ?? 1
  const page_size = params.page_size ?? DEFAULT_PAGE_SIZE
  const start = (page - 1) * page_size
  return { hotels: matches.slice(start, start + page_size), total: matches.length, page, page_size }
}

export interface HotelFacets {
  /** Every city in the catalogue, regardless of filters. */
  cities: CityOption[]
  /** Lowest in-range price per rating under the city and price filters. */
  star_prices: Array<{ star_rating: number; from_price: number | null }>
  /** Size of the whole catalogue. */
  total_hotels: number
}

/** GET /hotels/facets?city&min_price&max_price — what the filter bar needs,
 *  computed server-side instead of by downloading every hotel. */
export async function getHotelFacets(
  params: Pick<HotelSearchParams, 'city' | 'min_price' | 'max_price'> = {},
  options: RequestOptions = {},
): Promise<HotelFacets> {
  await delay(options.signal)
  const filters = { city: params.city, minPrice: params.min_price, maxPrice: params.max_price }
  return {
    cities: cityOptions(hotels),
    star_prices: starOptions(hotels, filters).map((o) => ({
      star_rating: o.stars,
      from_price: o.fromPrice ?? null,
    })),
    total_hotels: hotels.length,
  }
}

/** GET /hotels/:id — undefined stands in for a 404. */
export async function getHotelById(
  id: string,
  options: RequestOptions = {},
): Promise<Hotel | undefined> {
  await delay(options.signal)
  return hotels.find((h) => h.id === id)
}

/** GET /hotels/:id/rooms?check_in&check_out — rooms open every night of the
 *  stay; undefined for an unknown hotel. */
export async function getHotelRooms(
  id: string,
  check_in: IsoDate,
  check_out: IsoDate,
  options: RequestOptions = {},
): Promise<Room[] | undefined> {
  await delay(options.signal)
  const hotel = hotels.find((h) => h.id === id)
  return hotel && roomsAvailableFor(hotel, check_in, check_out).open
}
