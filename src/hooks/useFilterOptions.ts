import { getFilterOptions, type FilterOptions } from '../api/hotelApi'
import type { HotelFilters } from '../types/hotel'
import { useFilterDebounce } from './useFilterDebounce'
import { useQuery } from './useQuery'

/** City options and per-rating prices for the filter bar, or undefined until
 *  the first answer so the bar can render placeholders of the right size.
 *  Keyed on city and price only, so toggling stars never refetches. Keeps the
 *  last answer on error: the bar is decoration, the list shows the failure. */
export function useFilterOptions(filters: HotelFilters): FilterOptions | undefined {
  const { city, minPrice, maxPrice } = filters
  const scoped = { city, minPrice, maxPrice }
  const key = JSON.stringify(scoped)
  const debounceMs = useFilterDebounce(scoped)
  const { data } = useQuery(key, (signal) => getFilterOptions(JSON.parse(key), { signal }), {
    debounceMs,
  })
  return data
}
