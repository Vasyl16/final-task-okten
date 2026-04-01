import { baseApi } from '@/shared/api/rtk/base-api'

export const favoritesAddApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    addToFavorites: builder.mutation<void, string>({
      query: (id) => ({
        url: `/favorites/${id}`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'FavoriteList', id: 'LIST' },
        { type: 'Institution', id },
        { type: 'InstitutionList', id: 'LIST' },
      ],
    }),
  }),
})

export const { useAddToFavoritesMutation } = favoritesAddApi
