import type { IsoDate } from '../lib/dates'
import type { Hotel, HotelFilters, Room } from '../types/hotel'
import * as mock from './mockHotelApi'

// The one module hooks import. It speaks the UI's vocabulary (HotelFilters,
// camelCase) and maps to the backend contract, so replacing the mock with a
// real client touches only this file and mockHotelApi.ts.

export type { RequestOptions } from './mockHotelApi'

/** Rejects with an AbortError when `options.signal` fires, like fetch(). */
export function searchHotels(
  filters: HotelFilters,
  options?: mock.RequestOptions,
): Promise<Hotel[]> {
  return mock.getHotels(
    {
      city: filters.city,
      star_rating: filters.stars,
      min_price: filters.minPrice,
      max_price: filters.maxPrice,
    },
    options,
  )
}

export function getHotel(id: string): Promise<Hotel | undefined> {
  return mock.getHotelById(id)
}

export function getAvailableRooms(
  id: string,
  checkIn: IsoDate,
  checkOut: IsoDate,
): Promise<Room[] | undefined> {
  return mock.getHotelRooms(id, checkIn, checkOut)
}
