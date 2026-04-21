import { useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

function readPage(searchParams: URLSearchParams, key: string, fallback: number): number {
  const raw = searchParams.get(key)
  if (raw === null || raw === '') {
    return fallback
  }

  const n = Number.parseInt(raw, 10)
  if (!Number.isFinite(n) || n < 1) {
    return fallback
  }

  return n
}

/**
 * Keeps current page in the URL (?page=2) so lists are shareable and back/forward works.
 * When page is 1, the param is removed for a cleaner URL.
 */
export function useSearchParamPage(
  paramKey = 'page',
  options?: { replace?: boolean },
): [page: number, setPage: (next: number | ((current: number) => number)) => void] {
  const replace = options?.replace ?? true
  const [searchParams, setSearchParams] = useSearchParams()

  const page = useMemo(
    () => readPage(searchParams, paramKey, 1),
    [searchParams, paramKey],
  )

  const setPage = useCallback(
    (next: number | ((current: number) => number)) => {
      setSearchParams(
        (prev) => {
          const nextParams = new URLSearchParams(prev)
          const current = readPage(nextParams, paramKey, 1)
          const resolved = typeof next === 'function' ? next(current) : next
          const clamped = Math.max(1, Math.floor(resolved))

          if (clamped <= 1) {
            nextParams.delete(paramKey)
          } else {
            nextParams.set(paramKey, String(clamped))
          }

          return nextParams
        },
        { replace },
      )
    },
    [paramKey, replace, setSearchParams],
  )

  return [page, setPage]
}

/** When total pages shrink (e.g. after filter), clamp current page into range. */
export function useClampPage(
  page: number,
  pageCount: number | undefined,
  setPage: (next: number | ((current: number) => number)) => void,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) {
      return
    }
    if (typeof pageCount !== 'number') {
      return
    }
    if (pageCount >= 1 && page > pageCount) {
      setPage(pageCount)
    }
  }, [page, pageCount, setPage, enabled])
}
