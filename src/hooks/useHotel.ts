import { getHotel } from '../api/hotelApi'
import type { Hotel } from '../types/hotel'
import { useQuery } from './useQuery'

export interface HotelState {
  hotel: Hotel | undefined
  status: 'loading' | 'success' | 'not-found'
}

/** One hotel by id. "not-found" is a value, not an error: the route is valid,
 *  only the data is missing. */
export function useHotel(id: string): HotelState {
  const { data, status } = useQuery(id, (signal) =>
    getHotel(id, { signal }).then((hotel) => ({ hotel })),
  )
  if (status === 'loading') return { hotel: undefined, status: 'loading' }
  if (data?.hotel === undefined) return { hotel: undefined, status: 'not-found' }
  return { hotel: data.hotel, status: 'success' }
}
