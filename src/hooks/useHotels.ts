import { searchHotels } from '../api/hotelApi'
import type { Hotel, HotelFilters } from '../types/hotel'
import { useQuery, type QueryStatus, type UseQueryOptions } from './useQuery'

export interface HotelsState {
  hotels: Hotel[]
  /** Matches across all pages; 0 until the first answer. */
  total: number
  status: QueryStatus
}

/** Hotels matching the filters, debounced and abortable (see useQuery). */
export function useHotels(filters: HotelFilters, options?: UseQueryOptions): HotelsState {
  const key = JSON.stringify(filters) // compare by value, not object identity
  const { data, status } = useQuery(
    key,
    (signal) => searchHotels(JSON.parse(key), { signal }),
    options,
  )
  return { hotels: data?.hotels ?? [], total: data?.total ?? 0, status }
}
