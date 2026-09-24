import { getFilterOptions, type FilterOptions } from '../api/hotelApi'
import type { HotelFilters } from '../types/hotel'
import { useFilterDebounce } from './useFilterDebounce'
import { useQuery } from './useQuery'

const EMPTY: FilterOptions = { cities: [], stars: [], totalHotels: 0 }

/** City options and per-rating prices for the filter bar. Keyed on city and
 *  price only, so toggling stars never refetches. Falls back to the last
 *  answer on error: the bar is decoration, the list shows the failure. */
export function useFilterOptions(filters: HotelFilters): FilterOptions {
  const { city, minPrice, maxPrice } = filters
  const scoped = { city, minPrice, maxPrice }
  const key = JSON.stringify(scoped)
  const debounceMs = useFilterDebounce(scoped)
  const { data } = useQuery(key, (signal) => getFilterOptions(JSON.parse(key), { signal }), {
    debounceMs,
  })
  return data ?? EMPTY
}
