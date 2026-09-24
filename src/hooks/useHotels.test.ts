import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Hotel } from '../types/hotel'
import { useHotels } from './useHotels'

const answer: Array<(hotels: Hotel[]) => void> = []
const searchHotels = vi.fn(
  (_filters: unknown, options?: { signal?: AbortSignal }) =>
    new Promise<Hotel[]>((resolve, reject) => {
      answer.push(resolve)
      options?.signal?.addEventListener('abort', () => reject(options.signal!.reason))
    }),
)
vi.mock('../api/hotelApi', () => ({
  searchHotels: (filters: unknown, options?: { signal?: AbortSignal }) =>
    searchHotels(filters, options),
}))

afterEach(() => {
  answer.length = 0
  searchHotels.mockClear()
  vi.useRealTimers()
})

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

describe('useHotels debounce', () => {
  it('sends only the last of a burst of changes, after the quiet period, while reading as refreshing', async () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook((filters) => useHotels(filters, { debounceMs: 250 }), {
      initialProps: {} as object,
    })
    await act(async () => vi.advanceTimersByTime(250))
    await act(async () => answer.shift()!([hotel('a')]))
    expect(result.current.status).toBe('success')
    expect(searchHotels).toHaveBeenCalledTimes(1)

    rerender({ maxPrice: 100 })
    rerender({ maxPrice: 105 })
    rerender({ maxPrice: 110 })
    expect(result.current).toEqual({ hotels: [hotel('a')], status: 'refreshing' })
    await act(async () => vi.advanceTimersByTime(249))
    expect(searchHotels).toHaveBeenCalledTimes(1) // still waiting

    await act(async () => vi.advanceTimersByTime(1))
    expect(searchHotels).toHaveBeenCalledTimes(2)
    expect(searchHotels).toHaveBeenLastCalledWith({ maxPrice: 110 }, expect.anything())
  })

  it('aborts a query that a newer change supersedes', async () => {
    const { rerender } = renderHook((filters) => useHotels(filters), { initialProps: {} as object })
    const first = searchHotels.mock.calls[0][1]!.signal!
    rerender({ city: 'Seattle' })
    expect(first.aborted).toBe(true)
    expect(searchHotels.mock.calls[1][1]!.signal!.aborted).toBe(false)
  })
})
