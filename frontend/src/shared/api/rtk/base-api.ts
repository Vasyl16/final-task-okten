import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { useAuthStore } from '@/entities/user/model/auth.store'
import { clearAuthTokens, getAccessToken } from '@/shared/lib/auth-storage'
import { refreshAuthSession } from '@/shared/lib/refresh-auth-session'
import { getApiBaseUrl } from '@/shared/lib/runtime-env'

const rawBaseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),
  prepareHeaders: (headers) => {
    const accessToken = getAccessToken()

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`)
    }

    headers.set('Content-Type', 'application/json')

    return headers
  },
})

export const baseQuery: typeof rawBaseQuery = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  const url =
    typeof args === 'string'
      ? args
      : typeof args === 'object' && 'url' in args
        ? args.url
        : undefined

  const shouldAttemptRefresh =
    !!url &&
    !['/auth/login', '/auth/register', '/auth/refresh', '/auth/google'].some((path) =>
      url.includes(path),
    )

  if ('error' in result && result.error && result.error.status === 401 && shouldAttemptRefresh) {
    const nextAccessToken = await refreshAuthSession()

    if (nextAccessToken) {
      result = await rawBaseQuery(args, api, extraOptions)
    }
  }

  if ('error' in result && result.error && result.error.status === 401) {
    clearAuthTokens()
    useAuthStore.getState().clearAuthState()
  }

  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: [
    'Institution',
    'InstitutionList',
    'FavoriteList',
    'FavoriteIds',
    'CurrentUser',
    'MyReviews',
    'NewsList',
    'ReviewList',
    'PiyachokFeed',
    'Piyachok',
    'PiyachokMine',
    'MyInstitutions',
    'AdminUsers',
    'PendingInstitutions',
    'AdminTopCategories',
    'AdminAnalytics',
    'AdminAnalyticsDetail',
    'PublicTopCategories',
  ],
  endpoints: () => ({}),
})
