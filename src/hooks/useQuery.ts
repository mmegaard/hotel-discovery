import { useEffect, useRef, useState } from 'react'

export type QueryStatus = 'loading' | 'refreshing' | 'success'

export interface QueryState<T> {
  /** The latest answer; undefined only while `loading`. */
  data: T | undefined
  /** loading: nothing yet. refreshing: the key changed, showing the previous
   *  answer until the new one lands. */
  status: QueryStatus
}

export interface UseQueryOptions {
  /** Quiet time before a key change is sent. A slider drag fires dozens of
   *  changes a second; only the last one should reach the server. Zero
   *  queries synchronously (the test default). */
  debounceMs?: number
}

export const DEFAULT_DEBOUNCE_MS = import.meta.env.MODE === 'test' ? 0 : 250

/** Runs `fetch` whenever `key` changes, after `debounceMs` of quiet. Status is
 *  derived from whether the last answer matches the current key. A superseded
 *  request is aborted; if it answers anyway, the ignore flag drops it. This is
 *  the only place `useEffect` talks to the API. */
export function useQuery<T>(
  key: string,
  fetch: (signal: AbortSignal) => Promise<T>,
  { debounceMs = DEFAULT_DEBOUNCE_MS }: UseQueryOptions = {},
): QueryState<T> {
  const [result, setResult] = useState<{ key: string; data: T } | null>(null)
  // Callers pass a fresh closure every render; only `key` should re-run the
  // query, so the latest fetch is read through a ref. Effects run in order,
  // so the ref is current before the query effect below reads it.
  const fetchRef = useRef(fetch)
  useEffect(() => {
    fetchRef.current = fetch
  })

  useEffect(() => {
    let ignore = false
    const controller = new AbortController()
    const run = () => {
      fetchRef
        .current(controller.signal)
        .then((data) => {
          if (!ignore) setResult({ key, data })
        })
        .catch((error: unknown) => {
          if (!controller.signal.aborted) throw error
        })
    }
    const timer = debounceMs > 0 ? setTimeout(run, debounceMs) : (run(), undefined)
    return () => {
      ignore = true
      clearTimeout(timer)
      controller.abort()
    }
  }, [key, debounceMs])

  if (!result) return { data: undefined, status: 'loading' }
  return { data: result.data, status: result.key === key ? 'success' : 'refreshing' }
}
