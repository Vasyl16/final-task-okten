import { useEffect, useState } from 'react'

/** Debounce delay for text search / filter fields (ms). */
export const SEARCH_DEBOUNCE_MS = 300

/**
 * Returns a value that updates `delayMs` after `value` stops changing (trailing debounce).
 * Initial render uses `value` immediately so the first paint matches the source.
 */
export function useDebouncedValue<T>(value: T, delayMs = SEARCH_DEBOUNCE_MS): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebounced(value)
    }, delayMs)

    return () => window.clearTimeout(handle)
  }, [value, delayMs])

  return debounced
}
