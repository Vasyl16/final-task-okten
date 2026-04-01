import { baseApi } from '@/shared/api/rtk/base-api'

export const favoritesRemoveApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    removeFromFavorites: builder.mutation<void, string>({
      query: (id) => ({
        url: `/favorites/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'FavoriteList', id: 'LIST' },
        { type: 'Institution', id },
        { type: 'InstitutionList', id: 'LIST' },
      ],
    }),
  }),
})

export const { useRemoveFromFavoritesMutation } = favoritesRemoveApi
