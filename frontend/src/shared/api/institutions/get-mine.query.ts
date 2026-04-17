import type { Institution } from '@/entities/institution/types'
import { baseApi } from '@/shared/api/rtk/base-api'
import type { PaginatedList } from '@/shared/api/paginated.types'
import {
  normalizeInstitution,
  type BackendInstitution,
} from './institutions.shared'

export type GetMyInstitutionsParams = {
  page?: number
  limit?: number
}

type BackendPaginatedMine = {
  items: BackendInstitution[]
  total: number
  page: number
  limit: number
  pageCount: number
}

export const institutionsGetMineApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyInstitutions: builder.query<
      PaginatedList<Institution>,
      GetMyInstitutionsParams | void
    >({
      query: (params) => ({
        url: '/institutions/mine',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 12,
        },
      }),
      transformResponse: (response: BackendPaginatedMine): PaginatedList<Institution> => ({
        items: response.items.map((institution) => normalizeInstitution(institution)),
        total: response.total,
        page: response.page,
        limit: response.limit,
        pageCount: response.pageCount,
      }),
      providesTags: [{ type: 'MyInstitutions', id: 'LIST' }],
    }),
  }),
})

export const { useGetMyInstitutionsQuery } = institutionsGetMineApi
