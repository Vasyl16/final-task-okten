import axios, { type InternalAxiosRequestConfig } from 'axios'
import { clearAuthTokens, getAccessToken } from '@/shared/lib/auth-storage'
import { refreshAuthSession } from '@/shared/lib/refresh-auth-session'
import { getApiBaseUrl } from '@/shared/lib/runtime-env'

let unauthorizedHandler: (() => void) | null = null

type RetryableAxiosRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

function shouldAttemptRefresh(url?: string) {
  if (!url) {
    return true
  }

  return !['/auth/login', '/auth/register', '/auth/refresh', '/auth/google'].some(
    (path) => url.includes(path),
  )
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
})

api.interceptors.request.use((config) => {
  const accessToken = getAccessToken()

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  } else if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json'
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableAxiosRequestConfig | undefined

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      shouldAttemptRefresh(originalRequest.url)
    ) {
      originalRequest._retry = true

      const nextAccessToken = await refreshAuthSession()

      if (nextAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`

        return api(originalRequest)
      }
    }

    if (error.response?.status === 401 && shouldAttemptRefresh(originalRequest?.url)) {
      clearAuthTokens()
      unauthorizedHandler?.()
    }

    return Promise.reject(error)
  },
)
