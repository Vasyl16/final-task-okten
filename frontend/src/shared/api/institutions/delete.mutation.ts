import { baseApi } from '@/shared/api/rtk/base-api'

export const institutionsDeleteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    deleteInstitution: builder.mutation<void, string>({
      query: (id) => ({
        url: `/institutions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'InstitutionList', id: 'LIST' },
        { type: 'MyInstitutions', id: 'LIST' },
      ],
    }),
  }),
})

export const { useDeleteInstitutionMutation } = institutionsDeleteApi
