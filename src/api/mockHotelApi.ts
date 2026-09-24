import type { IsoDate } from '../lib/dates'
import type { Hotel, Room } from '../types/hotel'
import seed from '../data/hotels.json'
import { roomsAvailableFor } from './logic/availability'
import { filterHotels } from './logic/filters'

// In-memory stand-in for the backend brief's three endpoints. Parameter names
// are the backend's (snake_case); hotelApi.ts translates from the UI's filters.
// Every call returns a Promise so swapping in fetch() changes nothing upstream.

const hotels: Hotel[] = seed

export interface GetHotelsParams {
  city?: string
  /** The brief takes one star_rating; the mock accepts several so the UI's
   *  multi-select needs one request (TRADEOFFS.md). */
  star_rating?: number[]
  min_price?: number
  max_price?: number
}

/** GET /hotels */
export async function getHotels(params: GetHotelsParams = {}): Promise<Hotel[]> {
  return filterHotels(hotels, {
    city: params.city,
    stars: params.star_rating,
    minPrice: params.min_price,
    maxPrice: params.max_price,
  })
}

/** GET /hotels/:id — undefined stands in for a 404. */
export async function getHotelById(id: string): Promise<Hotel | undefined> {
  return hotels.find((h) => h.id === id)
}

/** GET /hotels/:id/rooms?check_in&check_out — rooms open every night of the
 *  stay; undefined for an unknown hotel. */
export async function getHotelRooms(
  id: string,
  check_in: IsoDate,
  check_out: IsoDate,
): Promise<Room[] | undefined> {
  const hotel = await getHotelById(id)
  return hotel && roomsAvailableFor(hotel, check_in, check_out).open
}
