import { baseApi } from '@/shared/api/rtk/base-api'
import {
  normalizePaginatedInstitutions,
  type BackendPaginatedInstitutions,
  type InstitutionsQueryParams,
  type PaginatedInstitutions,
} from './institutions.shared'

export const institutionsGetAllApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInstitutions: builder.query<PaginatedInstitutions, InstitutionsQueryParams | void>({
      query: (params) => ({
        url: '/institutions',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 12,
          search: params?.search?.trim() || undefined,
          city: params?.city?.trim() || undefined,
          sort:
            params?.sort === 'views'
              ? 'views'
              : params?.sort === 'rating'
                ? 'rating'
                : undefined,
        },
      }),
      transformResponse: (response: BackendPaginatedInstitutions): PaginatedInstitutions =>
        normalizePaginatedInstitutions(response),
      providesTags: (result) =>
        result
          ? [
              { type: 'InstitutionList', id: 'LIST' },
              ...result.items.map((institution) => ({
                type: 'Institution' as const,
                id: institution.id,
              })),
            ]
          : [{ type: 'InstitutionList', id: 'LIST' }],
    }),
  }),
})

export const { useGetInstitutionsQuery } = institutionsGetAllApi
