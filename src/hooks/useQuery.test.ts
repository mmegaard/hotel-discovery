import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useQuery } from './useQuery'

// A fetch whose answers are released by the test.
const answer: Array<(value: string) => void> = []
const signals: AbortSignal[] = []
const fetch = (signal: AbortSignal) =>
  new Promise<string>((resolve, reject) => {
    answer.push(resolve)
    signals.push(signal)
    signal.addEventListener('abort', () => reject(signal.reason))
  })

afterEach(() => {
  answer.length = 0
  signals.length = 0
  vi.useRealTimers()
})

describe('useQuery', () => {
  it('stays idle and fetches nothing while disabled, then loads once enabled', async () => {
    const spy = vi.fn(fetch)
    const { result, rerender } = renderHook((enabled: boolean) => useQuery('a', spy, { enabled }), {
      initialProps: false,
    })
    expect(result.current).toEqual({ data: undefined, status: 'idle' })
    expect(spy).not.toHaveBeenCalled()

    rerender(true)
    expect(result.current.status).toBe('loading')
    await act(async () => answer.shift()!('A'))
    expect(result.current).toEqual({ data: 'A', status: 'success' })
  })

  it('shows loading first, then keeps the previous answer while a key change is refreshing', async () => {
    const { result, rerender } = renderHook((key: string) => useQuery(key, fetch), {
      initialProps: 'a',
    })
    expect(result.current).toEqual({ data: undefined, status: 'loading' })

    await act(async () => answer.shift()!('A'))
    expect(result.current).toEqual({ data: 'A', status: 'success' })

    rerender('b')
    expect(result.current).toEqual({ data: 'A', status: 'refreshing' })

    await act(async () => answer.shift()!('B'))
    expect(result.current).toEqual({ data: 'B', status: 'success' })
  })

  it('aborts a superseded request and ignores its answer if it arrives anyway', async () => {
    const { result, rerender } = renderHook((key: string) => useQuery(key, fetch), {
      initialProps: 'a',
    })
    rerender('b')
    expect(signals[0].aborted).toBe(true)
    expect(signals[1].aborted).toBe(false)

    const [first, second] = [answer.shift()!, answer.shift()!]
    await act(async () => second('B'))
    await act(async () => first('A'))
    expect(result.current).toEqual({ data: 'B', status: 'success' })
  })

  it('sends only the last of a burst of changes, after the quiet period', async () => {
    vi.useFakeTimers()
    const spy = vi.fn(fetch)
    const { result, rerender } = renderHook(
      (key: string) => useQuery(key, spy, { debounceMs: 250 }),
      {
        initialProps: 'a',
      },
    )
    await act(async () => vi.advanceTimersByTime(250))
    await act(async () => answer.shift()!('A'))
    expect(spy).toHaveBeenCalledTimes(1)

    rerender('b')
    rerender('c')
    rerender('d')
    expect(result.current).toEqual({ data: 'A', status: 'refreshing' })
    await act(async () => vi.advanceTimersByTime(249))
    expect(spy).toHaveBeenCalledTimes(1) // still waiting

    await act(async () => vi.advanceTimersByTime(1))
    expect(spy).toHaveBeenCalledTimes(2)
    await act(async () => answer.shift()!('D'))
    expect(result.current).toEqual({ data: 'D', status: 'success' })
  })
})
