import type { User } from '@/entities/user/types'
import { api } from '@/shared/api/base-api'
import { baseApi } from '@/shared/api/rtk/base-api'

export type ProfileUser = User & {
  createdAt: string
}

type UpdateProfilePayload = {
  name: string
}

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUser: builder.query<ProfileUser, void>({
      query: () => '/users/me',
      providesTags: [{ type: 'CurrentUser', id: 'ME' }],
    }),
  }),
})

export async function updateCurrentUser(payload: UpdateProfilePayload) {
  const { data } = await api.patch<ProfileUser>('/users/me', {
    name: payload.name.trim(),
  })

  return data
}

export const { useGetCurrentUserQuery } = profileApi
