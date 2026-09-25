import { useEffect } from 'react'

const APP = 'StayFinder'

/** Sets the browser tab title for the current page; restored on unmount. */
export function useDocumentTitle(title: string | undefined) {
  useEffect(() => {
    if (title === undefined) return
    const previous = document.title
    document.title = `${title} · ${APP}`
    return () => {
      document.title = previous
    }
  }, [title])
}
