import type { User } from '@/entities/user/types'
import { getAccessToken, type AuthTokens } from '@/shared/lib/auth-storage'
import { decodeJwtPayload } from '@/shared/lib/jwt'
import { refreshAuthSession } from '@/shared/lib/refresh-auth-session'
import { api } from './base-api'

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  name: string
  email: string
  password: string
  passwordConfirm: string
}

export type GoogleAuthPayload = {
  credential: string
}

type AuthResponse = AuthTokens & {
  user?: User
}

function mapTokenPayloadToUser(): User {
  const accessToken = getAccessToken()

  if (!accessToken) {
    throw new Error('Немає access token')
  }

  const payload = decodeJwtPayload(accessToken)

  if (!payload) {
    throw new Error('Не вдалося прочитати дані користувача з токена')
  }

  if (payload.exp && payload.exp * 1000 <= Date.now()) {
    throw new Error('Термін дії access token завершився')
  }

  return {
    id: payload.sub,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    isCritic: payload.isCritic,
  }
}

function isTokenExpired(token: string) {
  const payload = decodeJwtPayload(token)

  if (!payload?.exp) {
    return false
  }

  return payload.exp * 1000 <= Date.now()
}

export const authApi = {
  async login(payload: LoginPayload) {
    const { data } = await api.post<AuthResponse>('/auth/login', payload)

    return data
  },

  async register(payload: RegisterPayload) {
    const { data } = await api.post<AuthResponse>('/auth/register', {
      ...payload,
      name: payload.name.trim(),
    })

    return data
  },

  async googleLogin(payload: GoogleAuthPayload) {
    const { data } = await api.post<AuthResponse>('/auth/google', {
      credential: payload.credential,
    })

    return data
  },

  async getMe() {
    const accessToken = getAccessToken()

    if (!accessToken) {
      throw new Error('Немає access token')
    }

    if (isTokenExpired(accessToken)) {
      const refreshedAccessToken = await refreshAuthSession()

      if (!refreshedAccessToken) {
        throw new Error('Сесію завершено, увійдіть знову')
      }
    }

    return mapTokenPayloadToUser()
  },

  async logout() {
    await api.post('/auth/logout')
  },
}
