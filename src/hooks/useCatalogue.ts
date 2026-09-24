import { useEffect, useState } from 'react'
import { searchHotels } from '../api/hotelApi'
import type { Hotel } from '../types/hotel'

/** Every hotel, unfiltered, loaded once. The filter bar derives its city
 *  options and per-rating "from $X" prices from this; the backend brief has no
 *  endpoint for either, so an unfiltered search stands in. */
export function useCatalogue(): Hotel[] {
  const [hotels, setHotels] = useState<Hotel[]>([])
  useEffect(() => {
    let ignore = false
    searchHotels({}).then((all) => {
      if (!ignore) setHotels(all)
    })
    return () => {
      ignore = true
    }
  }, [])
  return hotels
}
