import { useEffect, useState } from 'react'
import { searchHotels } from '../api/hotelApi'
import type { Hotel, HotelFilters } from '../types/hotel'

export interface HotelsState {
  hotels: Hotel[]
  /** loading: nothing to show yet. refreshing: filters changed, showing the
   *  previous result until the new one lands. */
  status: 'loading' | 'refreshing' | 'success'
}

interface Result {
  key: string
  hotels: Hotel[]
}

export interface UseHotelsOptions {
  /** Quiet time before a filter change is sent. A slider drag fires dozens of
   *  changes a second; only the last one should reach the server. Zero
   *  queries synchronously (the test default). */
  debounceMs?: number
}

const DEFAULT_DEBOUNCE_MS = import.meta.env.MODE === 'test' ? 0 : 250

/** Hotels matching the filters. Re-queries when the filter values change,
 *  after `debounceMs` of quiet. Status is derived from whether the last result
 *  answers the current key, so the list reads as refreshing from the first
 *  keystroke even while the query is still waiting. A superseded query is
 *  aborted; if it answers anyway, the ignore flag drops it. */
export function useHotels(
  filters: HotelFilters,
  { debounceMs = DEFAULT_DEBOUNCE_MS }: UseHotelsOptions = {},
): HotelsState {
  const key = JSON.stringify(filters) // compare by value, not object identity
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    let ignore = false
    const controller = new AbortController()
    const query = () => {
      searchHotels(JSON.parse(key), { signal: controller.signal })
        .then((hotels) => {
          if (!ignore) setResult({ key, hotels })
        })
        .catch((error: unknown) => {
          if (!controller.signal.aborted) throw error
        })
    }
    const timer = debounceMs > 0 ? setTimeout(query, debounceMs) : (query(), undefined)
    return () => {
      ignore = true
      clearTimeout(timer)
      controller.abort()
    }
  }, [key, debounceMs])

  if (!result) return { hotels: [], status: 'loading' }
  return { hotels: result.hotels, status: result.key === key ? 'success' : 'refreshing' }
}
