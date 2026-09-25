import { useState } from 'react'
import type { HotelFilters } from '../types/hotel'

/** Quiet time before a price change is sent; other filters are discrete
 *  clicks and go at once. Zero under test so the suite stays fast. */
export const PRICE_DEBOUNCE_MS = import.meta.env.MODE === 'test' ? 0 : 250

function priceOnlyChanged(prev: HotelFilters, next: HotelFilters): boolean {
  const same = prev.city === next.city && JSON.stringify(prev.stars) === JSON.stringify(next.stars)
  return same && (prev.minPrice !== next.minPrice || prev.maxPrice !== next.maxPrice)
}

/** How long the next query should wait, given what changed since the last
 *  render: a slider drag fires dozens of price changes a second, so only
 *  price-only changes are debounced. (react.dev "storing information from
 *  previous renders": state, not a ref, so it is set during render.) */
export function useFilterDebounce(filters: HotelFilters, delayMs = PRICE_DEBOUNCE_MS): number {
  const [prev, setPrev] = useState(filters)
  const [debounceMs, setDebounceMs] = useState(0)
  if (JSON.stringify(prev) !== JSON.stringify(filters)) {
    setPrev(filters)
    setDebounceMs(priceOnlyChanged(prev, filters) ? delayMs : 0)
  }
  return debounceMs
}
