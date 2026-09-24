import { getFilterOptions, type FilterOptions } from '../api/hotelApi'
import type { HotelFilters } from '../types/hotel'
import { useQuery } from './useQuery'

const EMPTY: FilterOptions = { cities: [], stars: [], totalHotels: 0 }

/** City options and per-rating prices for the filter bar. Keyed on city and
 *  price only, so toggling stars never refetches. */
export function useFilterOptions(filters: HotelFilters): FilterOptions {
  const { city, minPrice, maxPrice } = filters
  const key = JSON.stringify({ city, minPrice, maxPrice })
  const { data } = useQuery(key, (signal) => getFilterOptions(JSON.parse(key), { signal }))
  return data ?? EMPTY
}
