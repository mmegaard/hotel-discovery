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

/** Hotels matching the filters. Re-queries when the filter values change.
 *  Status is derived from whether the last result answers the current key; a
 *  stale response never lands because the effect cleanup sets ignore. */
export function useHotels(filters: HotelFilters): HotelsState {
  const key = JSON.stringify(filters) // compare by value, not object identity
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    let ignore = false
    searchHotels(JSON.parse(key)).then((hotels) => {
      if (!ignore) setResult({ key, hotels })
    })
    return () => {
      ignore = true
    }
  }, [key])

  if (!result) return { hotels: [], status: 'loading' }
  return { hotels: result.hotels, status: result.key === key ? 'success' : 'refreshing' }
}
