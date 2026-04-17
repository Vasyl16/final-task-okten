import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

function setOrDelete(params: URLSearchParams, key: string, value: string) {
  const trimmed = value.trim()
  if (trimmed === '') {
    params.delete(key)
  } else {
    params.set(key, trimmed)
  }
}

/** Reset page when filters change (omit page key = delete page). */
function clearPage(params: URLSearchParams, pageKey: string) {
  params.delete(pageKey)
}

export function useInstitutionsListingParams(pageKey = 'page') {
  const [searchParams, setSearchParams] = useSearchParams()

  const search = searchParams.get('q') ?? ''
  const city = searchParams.get('city') ?? ''
  const sortParam = searchParams.get('sort')
  const sort =
    sortParam === 'views' || sortParam === 'rating' ? sortParam : 'rating'
  const page = useMemo(() => {
    const raw = searchParams.get(pageKey)
    const n = raw ? Number.parseInt(raw, 10) : 1
    return Number.isFinite(n) && n >= 1 ? n : 1
  }, [searchParams, pageKey])

  const setPage = useCallback(
    (next: number | ((current: number) => number)) => {
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev)
        const current =
          Number.parseInt(nextParams.get(pageKey) || '1', 10) || 1
        const resolved = typeof next === 'function' ? next(current) : next
        const clamped = Math.max(1, Math.floor(resolved))
        if (clamped <= 1) {
          nextParams.delete(pageKey)
        } else {
          nextParams.set(pageKey, String(clamped))
        }
        return nextParams
      }, { replace: true })
    },
    [pageKey, setSearchParams],
  )

  const setSearch = useCallback(
    (value: string) => {
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev)
        setOrDelete(nextParams, 'q', value)
        clearPage(nextParams, pageKey)
        return nextParams
      }, { replace: true })
    },
    [pageKey, setSearchParams],
  )

  const setCity = useCallback(
    (value: string) => {
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev)
        setOrDelete(nextParams, 'city', value)
        clearPage(nextParams, pageKey)
        return nextParams
      }, { replace: true })
    },
    [pageKey, setSearchParams],
  )

  const setSort = useCallback(
    (value: 'rating' | 'views') => {
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev)
        nextParams.set('sort', value)
        clearPage(nextParams, pageKey)
        return nextParams
      }, { replace: true })
    },
    [pageKey, setSearchParams],
  )

  return { search, city, sort, page, setPage, setSearch, setCity, setSort }
}

export function useNewsListingParams(pageKey = 'page') {
  const [searchParams, setSearchParams] = useSearchParams()

  const search = searchParams.get('q') ?? ''
  const categoryParam = searchParams.get('cat')
  const category =
    categoryParam === 'GENERAL' ||
    categoryParam === 'PROMOTION' ||
    categoryParam === 'EVENT'
      ? categoryParam
      : ''
  const sortParam = searchParams.get('sort')
  const sort = sortParam === 'asc' || sortParam === 'desc' ? sortParam : 'desc'

  const page = useMemo(() => {
    const raw = searchParams.get(pageKey)
    const n = raw ? Number.parseInt(raw, 10) : 1
    return Number.isFinite(n) && n >= 1 ? n : 1
  }, [searchParams, pageKey])

  const setPage = useCallback(
    (next: number | ((current: number) => number)) => {
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev)
        const current =
          Number.parseInt(nextParams.get(pageKey) || '1', 10) || 1
        const resolved = typeof next === 'function' ? next(current) : next
        const clamped = Math.max(1, Math.floor(resolved))
        if (clamped <= 1) {
          nextParams.delete(pageKey)
        } else {
          nextParams.set(pageKey, String(clamped))
        }
        return nextParams
      }, { replace: true })
    },
    [pageKey, setSearchParams],
  )

  const setSearch = useCallback(
    (value: string) => {
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev)
        setOrDelete(nextParams, 'q', value)
        clearPage(nextParams, pageKey)
        return nextParams
      }, { replace: true })
    },
    [pageKey, setSearchParams],
  )

  const setCategory = useCallback(
    (value: 'GENERAL' | 'PROMOTION' | 'EVENT' | '') => {
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev)
        if (value === '') {
          nextParams.delete('cat')
        } else {
          nextParams.set('cat', value)
        }
        clearPage(nextParams, pageKey)
        return nextParams
      }, { replace: true })
    },
    [pageKey, setSearchParams],
  )

  const setSort = useCallback(
    (value: 'asc' | 'desc') => {
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev)
        nextParams.set('sort', value)
        clearPage(nextParams, pageKey)
        return nextParams
      }, { replace: true })
    },
    [pageKey, setSearchParams],
  )

  return { search, category, sort, page, setPage, setSearch, setCategory, setSort }
}

function readPositiveInt(
  searchParams: URLSearchParams,
  key: string,
  fallback: number,
): number {
  const raw = searchParams.get(key)
  const n = raw ? Number.parseInt(raw, 10) : fallback
  return Number.isFinite(n) && n >= 1 ? n : fallback
}

/** URL: `page`, `myPage`, `sortBy` (date|createdAt), `sortOrder` (asc|desc), optional `q` via page effect. */
export function usePiyachokListingParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const page = useMemo(
    () => readPositiveInt(searchParams, 'page', 1),
    [searchParams],
  )
  const myPage = useMemo(
    () => readPositiveInt(searchParams, 'myPage', 1),
    [searchParams],
  )

  const sortByParam = searchParams.get('sortBy')
  const sortBy: 'date' | 'createdAt' =
    sortByParam === 'date' ? 'date' : 'createdAt'

  const orderParam = searchParams.get('sortOrder')
  const sortOrder: 'asc' | 'desc' =
    orderParam === 'asc' || orderParam === 'desc' ? orderParam : 'desc'

  const setPage = useCallback(
    (next: number | ((current: number) => number)) => {
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev)
        const current = readPositiveInt(nextParams, 'page', 1)
        const resolved = typeof next === 'function' ? next(current) : next
        const clamped = Math.max(1, Math.floor(resolved))
        if (clamped <= 1) {
          nextParams.delete('page')
        } else {
          nextParams.set('page', String(clamped))
        }
        return nextParams
      }, { replace: true })
    },
    [setSearchParams],
  )

  const setMyPage = useCallback(
    (next: number | ((current: number) => number)) => {
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev)
        const current = readPositiveInt(nextParams, 'myPage', 1)
        const resolved = typeof next === 'function' ? next(current) : next
        const clamped = Math.max(1, Math.floor(resolved))
        if (clamped <= 1) {
          nextParams.delete('myPage')
        } else {
          nextParams.set('myPage', String(clamped))
        }
        return nextParams
      }, { replace: true })
    },
    [setSearchParams],
  )

  const setSortBy = useCallback(
    (value: 'date' | 'createdAt') => {
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev)
        nextParams.set('sortBy', value)
        nextParams.delete('page')
        return nextParams
      }, { replace: true })
    },
    [setSearchParams],
  )

  const setSortOrder = useCallback(
    (value: 'asc' | 'desc') => {
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev)
        nextParams.set('sortOrder', value)
        nextParams.delete('page')
        return nextParams
      }, { replace: true })
    },
    [setSearchParams],
  )

  const setQueryInUrl = useCallback(
    (q: string) => {
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev)
        const trimmed = q.trim()
        if (trimmed === '') {
          nextParams.delete('q')
        } else {
          nextParams.set('q', trimmed)
        }
        nextParams.delete('page')
        return nextParams
      }, { replace: true })
    },
    [setSearchParams],
  )

  return {
    page,
    myPage,
    sortBy,
    sortOrder,
    setPage,
    setMyPage,
    setSortBy,
    setSortOrder,
    setQueryInUrl,
  }
}

/** `/profile`: вкладка + окремі сторінки списків (`ipage`, `fpage`, `mrpage`, `pypage`). */
export const PROFILE_TAB_IDS = [
  'info',
  'institutions',
  'favorites',
  'reviews',
  'piyachok',
] as const
export type ProfileTab = (typeof PROFILE_TAB_IDS)[number]

function isProfileTab(value: string): value is ProfileTab {
  return (PROFILE_TAB_IDS as readonly string[]).includes(value)
}

function makeProfilePageSetter(
  setSearchParams: ReturnType<typeof useSearchParams>[1],
  key: string,
) {
  return (next: number | ((current: number) => number)) => {
    setSearchParams(
      (prev) => {
        const nextParams = new URLSearchParams(prev)
        const current = readPositiveInt(nextParams, key, 1)
        const resolved = typeof next === 'function' ? next(current) : next
        const clamped = Math.max(1, Math.floor(resolved))
        if (clamped <= 1) {
          nextParams.delete(key)
        } else {
          nextParams.set(key, String(clamped))
        }
        return nextParams
      },
      { replace: true },
    )
  }
}

export function useProfileListingParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const tab = useMemo((): ProfileTab => {
    const raw = searchParams.get('tab')
    if (raw && isProfileTab(raw)) {
      return raw
    }
    return 'info'
  }, [searchParams])

  const institutionsPage = useMemo(
    () => readPositiveInt(searchParams, 'ipage', 1),
    [searchParams],
  )
  const favoritesPage = useMemo(
    () => readPositiveInt(searchParams, 'fpage', 1),
    [searchParams],
  )
  const reviewsPage = useMemo(
    () => readPositiveInt(searchParams, 'mrpage', 1),
    [searchParams],
  )
  const piyachokPage = useMemo(
    () => readPositiveInt(searchParams, 'pypage', 1),
    [searchParams],
  )

  const setTab = useCallback(
    (next: ProfileTab) => {
      setSearchParams(
        (prev) => {
          const nextParams = new URLSearchParams(prev)
          if (next === 'info') {
            nextParams.delete('tab')
          } else {
            nextParams.set('tab', next)
          }
          return nextParams
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setInstitutionsPage = useMemo(
    () => makeProfilePageSetter(setSearchParams, 'ipage'),
    [setSearchParams],
  )
  const setFavoritesPage = useMemo(
    () => makeProfilePageSetter(setSearchParams, 'fpage'),
    [setSearchParams],
  )
  const setReviewsPage = useMemo(
    () => makeProfilePageSetter(setSearchParams, 'mrpage'),
    [setSearchParams],
  )
  const setPiyachokPage = useMemo(
    () => makeProfilePageSetter(setSearchParams, 'pypage'),
    [setSearchParams],
  )

  return {
    tab,
    institutionsPage,
    favoritesPage,
    reviewsPage,
    piyachokPage,
    setTab,
    setInstitutionsPage,
    setFavoritesPage,
    setReviewsPage,
    setPiyachokPage,
  }
}

/** `/admin`: вкладка + пагінація таблиць і аналітики (`upage`, `mpage`, `apage`, `dpage`, `aid`). */
export const ADMIN_TAB_IDS = [
  'users',
  'institutions',
  'topCategories',
  'analytics',
] as const
export type AdminTab = (typeof ADMIN_TAB_IDS)[number]

function isAdminTab(value: string): value is AdminTab {
  return (ADMIN_TAB_IDS as readonly string[]).includes(value)
}

function makeAdminPageSetter(
  setSearchParams: ReturnType<typeof useSearchParams>[1],
  key: string,
) {
  return (next: number | ((current: number) => number)) => {
    setSearchParams(
      (prev) => {
        const nextParams = new URLSearchParams(prev)
        const current = readPositiveInt(nextParams, key, 1)
        const resolved = typeof next === 'function' ? next(current) : next
        const clamped = Math.max(1, Math.floor(resolved))
        if (clamped <= 1) {
          nextParams.delete(key)
        } else {
          nextParams.set(key, String(clamped))
        }
        return nextParams
      },
      { replace: true },
    )
  }
}

export function useAdminListingParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const tab = useMemo((): AdminTab => {
    const raw = searchParams.get('tab')
    if (raw && isAdminTab(raw)) {
      return raw
    }
    return 'users'
  }, [searchParams])

  const usersPage = useMemo(
    () => readPositiveInt(searchParams, 'upage', 1),
    [searchParams],
  )
  const modPage = useMemo(
    () => readPositiveInt(searchParams, 'mpage', 1),
    [searchParams],
  )
  const analyticsListPage = useMemo(
    () => readPositiveInt(searchParams, 'apage', 1),
    [searchParams],
  )
  const analyticsDetailPage = useMemo(
    () => readPositiveInt(searchParams, 'dpage', 1),
    [searchParams],
  )
  const analyticsInstitutionId = searchParams.get('aid') ?? ''

  const setTab = useCallback(
    (next: AdminTab) => {
      setSearchParams(
        (prev) => {
          const nextParams = new URLSearchParams(prev)
          if (next === 'users') {
            nextParams.delete('tab')
          } else {
            nextParams.set('tab', next)
          }
          return nextParams
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setUsersPage = useMemo(
    () => makeAdminPageSetter(setSearchParams, 'upage'),
    [setSearchParams],
  )
  const setModPage = useMemo(
    () => makeAdminPageSetter(setSearchParams, 'mpage'),
    [setSearchParams],
  )
  const setAnalyticsListPage = useMemo(
    () => makeAdminPageSetter(setSearchParams, 'apage'),
    [setSearchParams],
  )
  const setAnalyticsDetailPage = useMemo(
    () => makeAdminPageSetter(setSearchParams, 'dpage'),
    [setSearchParams],
  )

  const setAnalyticsInstitutionId = useCallback(
    (id: string) => {
      setSearchParams(
        (prev) => {
          const nextParams = new URLSearchParams(prev)
          if (id.trim() === '') {
            nextParams.delete('aid')
          } else {
            nextParams.set('aid', id)
          }
          nextParams.delete('dpage')
          return nextParams
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  return {
    tab,
    usersPage,
    modPage,
    analyticsListPage,
    analyticsDetailPage,
    analyticsInstitutionId,
    setTab,
    setUsersPage,
    setModPage,
    setAnalyticsListPage,
    setAnalyticsDetailPage,
    setAnalyticsInstitutionId,
  }
}
