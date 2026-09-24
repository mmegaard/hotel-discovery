import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { parseFilters, serializeFilters } from '../lib/filterParams'
import type { HotelFilters } from '../types/hotel'

export interface HotelFiltersState {
  filters: HotelFilters
  /** Merge a partial change into the URL. Pass `undefined` to drop a key. */
  updateFilters: (patch: Partial<HotelFilters>) => void
  reset: () => void
}

/** The URL is the single owner of search filters. This is the only place the
 *  query string is read or written. */
export function useHotelFilters(): HotelFiltersState {
  const [searchParams, setSearchParams] = useSearchParams()
  const key = searchParams.toString()
  const filters = useMemo(() => parseFilters(new URLSearchParams(key)), [key])

  const updateFilters = useCallback(
    (patch: Partial<HotelFilters>) => {
      setSearchParams(serializeFilters({ ...filters, ...patch }), { replace: true })
    },
    [filters, setSearchParams],
  )
  const reset = useCallback(
    () => setSearchParams(new URLSearchParams(), { replace: true }),
    [setSearchParams],
  )

  return { filters, updateFilters, reset }
}
