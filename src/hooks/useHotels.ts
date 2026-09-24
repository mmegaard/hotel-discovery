import { useEffect, useState } from 'react'
import { searchHotels } from '../api/hotelApi'
import type { Hotel, HotelFilters } from '../types/hotel'

export interface HotelsState {
  hotels: Hotel[]
  status: 'loading' | 'success'
}

interface Result {
  key: string
  hotels: Hotel[]
}

/** Hotels matching the filters. Re-queries when the filter values change.
 *  "loading" is derived: the last result was for a different filter key. A
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

  const fresh = result?.key === key
  return { hotels: fresh ? result.hotels : [], status: fresh ? 'success' : 'loading' }
}
