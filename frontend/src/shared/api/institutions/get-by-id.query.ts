import type { Institution } from '@/entities/institution/types'
import { baseApi } from '@/shared/api/rtk/base-api'
import {
  normalizeInstitution,
  type BackendInstitution,
} from './institutions.shared'

export const institutionsGetByIdApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInstitutionById: builder.query<Institution, string>({
      query: (id) => `/institutions/${id}`,
      transformResponse: (response: BackendInstitution): Institution =>
        normalizeInstitution(response),
      providesTags: (_result, _error, id) => [{ type: 'Institution', id }],
    }),
  }),
})

export const { useGetInstitutionByIdQuery } = institutionsGetByIdApi
