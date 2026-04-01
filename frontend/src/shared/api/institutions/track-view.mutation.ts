import { baseApi } from '@/shared/api/rtk/base-api'

export const institutionsTrackViewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    trackInstitutionView: builder.mutation<{ success: true }, string>({
      query: (id) => ({
        url: `/institutions/${id}/view`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Institution', id },
        { type: 'InstitutionList', id: 'LIST' },
      ],
    }),
  }),
})

export const { useTrackInstitutionViewMutation } = institutionsTrackViewApi
