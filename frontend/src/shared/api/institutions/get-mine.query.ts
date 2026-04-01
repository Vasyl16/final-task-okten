import type { Institution } from '@/entities/institution/types'
import { baseApi } from '@/shared/api/rtk/base-api'
import {
  normalizeInstitution,
  type BackendInstitution,
} from './institutions.shared'

export const institutionsGetMineApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyInstitutions: builder.query<Institution[], void>({
      query: () => '/institutions/mine',
      transformResponse: (response: BackendInstitution[]): Institution[] =>
        response.map((institution) => normalizeInstitution(institution)),
      providesTags: [{ type: 'MyInstitutions', id: 'LIST' }],
    }),
  }),
})

export const { useGetMyInstitutionsQuery } = institutionsGetMineApi
