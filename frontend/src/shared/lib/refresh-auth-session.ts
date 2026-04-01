import axios from 'axios'
import {
  clearAuthTokens,
  getRefreshToken,
  saveAuthTokens,
  type AuthTokens,
} from '@/shared/lib/auth-storage'
import { getApiBaseUrl } from '@/shared/lib/runtime-env'

type RefreshResponse = AuthTokens & {
  user?: unknown
}

let refreshPromise: Promise<string | null> | null = null

async function requestRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    clearAuthTokens()
    return null
  }

  try {
    const { data } = await axios.post<RefreshResponse>(
      '/auth/refresh',
      { refreshToken },
      {
        baseURL: getApiBaseUrl(),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    saveAuthTokens(data)

    return data.accessToken
  } catch {
    clearAuthTokens()
    return null
  }
}

export async function refreshAuthSession(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = requestRefresh().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}
