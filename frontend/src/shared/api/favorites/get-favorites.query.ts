import type { Institution } from '@/entities/institution/types'
import { baseApi } from '@/shared/api/rtk/base-api'
import {
  mapFavoritesToInstitutions,
  type FavoriteResponseItem,
} from './favorites.shared'

export const favoritesGetAllApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFavorites: builder.query<Institution[], void>({
      query: () => '/favorites',
      transformResponse: (response: FavoriteResponseItem[]): Institution[] =>
        mapFavoritesToInstitutions(response),
      providesTags: [{ type: 'FavoriteList', id: 'LIST' }],
    }),
  }),
})

export const { useGetFavoritesQuery } = favoritesGetAllApi
