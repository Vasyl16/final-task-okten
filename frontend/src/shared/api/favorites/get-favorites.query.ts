import type { Institution } from '@/entities/institution/types'
import { baseApi } from '@/shared/api/rtk/base-api'
import type { PaginatedList } from '@/shared/api/paginated.types'
import {
  mapFavoritesToInstitutions,
  type FavoriteResponseItem,
} from './favorites.shared'

export type GetFavoritesParams = {
  page?: number
  limit?: number
}

type BackendFavoritesPage = {
  items: FavoriteResponseItem[]
  total: number
  page: number
  limit: number
  pageCount: number
}

export const favoritesGetAllApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFavorites: builder.query<PaginatedList<Institution>, GetFavoritesParams | void>({
      query: (args) => ({
        url: '/favorites',
        params: {
          page: args?.page ?? 1,
          limit: args?.limit ?? 12,
        },
      }),
      transformResponse: (response: BackendFavoritesPage): PaginatedList<Institution> => ({
        items: mapFavoritesToInstitutions(response.items),
        total: response.total,
        page: response.page,
        limit: response.limit,
        pageCount: response.pageCount,
      }),
      providesTags: (result) =>
        result
          ? [
              { type: 'FavoriteList' as const, id: 'LIST' },
              ...result.items.map((institution) => ({
                type: 'FavoriteList' as const,
                id: institution.id,
              })),
            ]
          : [{ type: 'FavoriteList' as const, id: 'LIST' }],
    }),

    getFavoriteInstitutionIds: builder.query<string[], void>({
      query: () => '/favorites/ids',
      transformResponse: (response: { ids: string[] }) => response.ids,
      providesTags: [{ type: 'FavoriteIds', id: 'LIST' }],
    }),
  }),
})

export const { useGetFavoritesQuery, useGetFavoriteInstitutionIdsQuery } = favoritesGetAllApi
