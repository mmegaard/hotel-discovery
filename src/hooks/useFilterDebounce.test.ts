import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { HotelFilters } from '../types/hotel'
import { useFilterDebounce } from './useFilterDebounce'

describe('useFilterDebounce', () => {
  it('debounces price-only changes and nothing else', () => {
    const { result, rerender } = renderHook((f: HotelFilters) => useFilterDebounce(f, 250), {
      initialProps: { city: 'Seattle' } as HotelFilters,
    })
    expect(result.current).toBe(0)

    rerender({ city: 'Seattle', maxPrice: 300 })
    expect(result.current).toBe(250)
    rerender({ city: 'Seattle', maxPrice: 295 })
    expect(result.current).toBe(250)

    rerender({ city: 'Seattle', maxPrice: 295, stars: [5] })
    expect(result.current).toBe(0) // a click, not a drag
    rerender({ city: 'Chicago', maxPrice: 295, stars: [5] })
    expect(result.current).toBe(0)
  })
})
