import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Hotel } from '../types/hotel'
import { useHotels } from './useHotels'

const answer: Array<(hotels: Hotel[]) => void> = []
vi.mock('../api/hotelApi', () => ({
  searchHotels: () => new Promise<Hotel[]>((resolve) => answer.push(resolve)),
}))

const hotel = (id: string) => ({ id }) as Hotel

describe('useHotels', () => {
  it('shows loading first, then keeps the previous result while a filter change is refreshing', async () => {
    const { result, rerender } = renderHook((filters) => useHotels(filters), { initialProps: {} })
    expect(result.current).toEqual({ hotels: [], status: 'loading' })

    await act(async () => answer.shift()!([hotel('a'), hotel('b')]))
    expect(result.current).toEqual({ hotels: [hotel('a'), hotel('b')], status: 'success' })

    rerender({ city: 'Seattle' })
    expect(result.current).toEqual({ hotels: [hotel('a'), hotel('b')], status: 'refreshing' })

    await act(async () => answer.shift()!([hotel('a')]))
    expect(result.current).toEqual({ hotels: [hotel('a')], status: 'success' })
  })

  it('ignores a stale answer that arrives after the filters moved on', async () => {
    const { result, rerender } = renderHook((filters) => useHotels(filters), {
      initialProps: {} as object,
    })
    rerender({ city: 'Seattle' })
    const [first, second] = [answer.shift()!, answer.shift()!]

    await act(async () => second([hotel('s')]))
    expect(result.current).toEqual({ hotels: [hotel('s')], status: 'success' })

    await act(async () => first([hotel('a'), hotel('b')]))
    expect(result.current).toEqual({ hotels: [hotel('s')], status: 'success' })
  })
})
