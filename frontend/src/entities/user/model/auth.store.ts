import { create } from 'zustand'
import type { User } from '@/entities/user/types'
import {
  authApi,
  type GoogleAuthPayload,
  type LoginPayload,
  type RegisterPayload,
} from '@/shared/api/auth.api'
import {
  clearAuthTokens,
  getAccessToken,
  saveAuthTokens,
} from '@/shared/lib/auth-storage'

type AuthState = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isSubmitting: boolean
  setUser: (user: User | null) => void
  login: (payload: LoginPayload) => Promise<void>
  loginWithGoogle: (payload: GoogleAuthPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
  clearAuthState: () => void
}

const defaultState = {
  user: null,
  isAuthenticated: false,
}

export const useAuthStore = create<AuthState>()((set) => ({
  ...defaultState,
  isLoading: true,
  isSubmitting: false,

  setUser: (user) => {
    set({
      user,
      isAuthenticated: Boolean(user),
    })
  },

  login: async (payload) => {
    set({ isSubmitting: true })

    try {
      const response = await authApi.login(payload)
      saveAuthTokens(response)
      const user = response.user ?? (await authApi.getMe())

      set({
        user,
        isAuthenticated: true,
        isSubmitting: false,
      })
    } catch (error) {
      clearAuthTokens()
      set({
        ...defaultState,
        isSubmitting: false,
      })

      throw error
    }
  },

  loginWithGoogle: async (payload: GoogleAuthPayload) => {
    set({ isSubmitting: true })

    try {
      const response = await authApi.googleLogin(payload)
      saveAuthTokens(response)
      const user = response.user ?? (await authApi.getMe())

      set({
        user,
        isAuthenticated: true,
        isSubmitting: false,
      })
    } catch (error) {
      clearAuthTokens()
      set({
        ...defaultState,
        isSubmitting: false,
      })

      throw error
    }
  },

  register: async (payload) => {
    set({ isSubmitting: true })

    try {
      const response = await authApi.register(payload)
      saveAuthTokens(response)
      const user = response.user ?? (await authApi.getMe())

      set({
        user,
        isAuthenticated: true,
        isSubmitting: false,
      })
    } catch (error) {
      clearAuthTokens()
      set({
        ...defaultState,
        isSubmitting: false,
      })

      throw error
    }
  },

  logout: async () => {
    set({ isSubmitting: true })

    try {
      if (getAccessToken()) {
        await authApi.logout()
      }
    } catch {
      // Clear local auth state even if the logout request fails.
    } finally {
      clearAuthTokens()
      set({
        ...defaultState,
        isSubmitting: false,
      })
    }
  },

  fetchMe: async () => {
    if (!getAccessToken()) {
      set({
        ...defaultState,
        isLoading: false,
        isSubmitting: false,
      })

      return
    }

    set({ isLoading: true })

    try {
      const user = await authApi.getMe()

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        isSubmitting: false,
      })
    } catch {
      clearAuthTokens()
      set({
        ...defaultState,
        isLoading: false,
        isSubmitting: false,
      })
    }
  },

  clearAuthState: () => {
    clearAuthTokens()
    set({
      ...defaultState,
      isLoading: false,
      isSubmitting: false,
    })
  },
}))
