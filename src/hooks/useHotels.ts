import { searchHotels } from '../api/hotelApi'
import type { Hotel, HotelFilters } from '../types/hotel'
import { useFilterDebounce } from './useFilterDebounce'
import { useQuery, type QueryStatus } from './useQuery'

export interface HotelsState {
  hotels: Hotel[]
  /** Matches across all pages; 0 until the first answer. */
  total: number
  status: QueryStatus
}

/** Hotels matching the filters. Price changes are debounced; other filter
 *  changes query at once (see useFilterDebounce). */
export function useHotels(filters: HotelFilters): HotelsState {
  const key = JSON.stringify(filters) // compare by value, not object identity
  const debounceMs = useFilterDebounce(filters)
  const { data, status } = useQuery(key, (signal) => searchHotels(JSON.parse(key), { signal }), {
    debounceMs,
  })
  return { hotels: data?.hotels ?? [], total: data?.total ?? 0, status }
}
