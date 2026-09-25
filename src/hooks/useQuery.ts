import { useEffect, useRef, useState } from 'react'

export type QueryStatus = 'idle' | 'loading' | 'refreshing' | 'success' | 'error'

export interface QueryState<T> {
  /** The latest answer; undefined while `idle`, `loading`, or after an error
   *  with no earlier answer. */
  data: T | undefined
  /** idle: not enabled, nothing fetched. loading: nothing yet. refreshing: the
   *  key changed, showing the previous answer until the new one lands.
   *  error: the request for the current key failed. */
  status: QueryStatus
}

export interface UseQueryOptions {
  /** Quiet time before a key change is sent. Zero (the default) queries at
   *  once; callers with continuous inputs such as a slider pass a delay. */
  debounceMs?: number
  /** False skips fetching entirely (status "idle"), e.g. until the user has
   *  filled in every input the query needs. */
  enabled?: boolean
}

/** Runs `fetch` whenever `key` changes, after `debounceMs` of quiet. Status is
 *  derived from whether the last answer matches the current key. A superseded
 *  request is aborted; if it answers anyway, the ignore flag drops it. A
 *  failure becomes `status: 'error'` for that key, never an unhandled
 *  rejection; changing the key tries again. This is the only place
 *  `useEffect` talks to the API. */
export function useQuery<T>(
  key: string,
  fetch: (signal: AbortSignal) => Promise<T>,
  { debounceMs = 0, enabled = true }: UseQueryOptions = {},
): QueryState<T> {
  const [result, setResult] = useState<{ key: string; data: T } | null>(null)
  const [failedKey, setFailedKey] = useState<string | null>(null)
  // Callers pass a fresh closure every render; only `key` should re-run the
  // query, so the latest fetch is read through a ref. Effects run in order,
  // so the ref is current before the query effect below reads it.
  const fetchRef = useRef(fetch)
  useEffect(() => {
    fetchRef.current = fetch
  })

  useEffect(() => {
    if (!enabled) return
    let ignore = false
    const controller = new AbortController()
    const run = () => {
      fetchRef
        .current(controller.signal)
        .then((data) => {
          if (!ignore) setResult({ key, data })
        })
        .catch(() => {
          if (!ignore && !controller.signal.aborted) setFailedKey(key)
        })
    }
    const timer = debounceMs > 0 ? setTimeout(run, debounceMs) : (run(), undefined)
    return () => {
      ignore = true
      clearTimeout(timer)
      controller.abort()
    }
  }, [key, debounceMs, enabled])

  if (!enabled) return { data: undefined, status: 'idle' }
  if (failedKey === key && result?.key !== key) return { data: result?.data, status: 'error' }
  if (!result) return { data: undefined, status: 'loading' }
  return { data: result.data, status: result.key === key ? 'success' : 'refreshing' }
}
