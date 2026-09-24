import { useEffect, useState } from 'react'
import { searchHotels } from '../api/hotelApi'
import { cityOptions, type CityOption } from '../api/logic/filters'

/** Every city in the catalogue, for the city combobox. Loaded once; the
 *  backend has no cities endpoint so this derives from an unfiltered search. */
export function useCityOptions(): CityOption[] {
  const [options, setOptions] = useState<CityOption[]>([])
  useEffect(() => {
    let ignore = false
    searchHotels({}).then((hotels) => {
      if (!ignore) setOptions(cityOptions(hotels))
    })
    return () => {
      ignore = true
    }
  }, [])
  return options
}
