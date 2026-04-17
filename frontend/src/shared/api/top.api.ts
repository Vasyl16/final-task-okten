import type { TopCategory } from '@/entities/institution/types'
import { baseApi } from '@/shared/api/rtk/base-api'
import type { PaginatedList } from '@/shared/api/paginated.types'
import {
  normalizeInstitution,
  type BackendInstitution,
} from '@/shared/api/institutions/institutions.shared'

type BackendTopCategory = {
  id: string
  name: string
  institutions: BackendInstitution[]
}

type BackendTopCategoriesPage = {
  items: BackendTopCategory[]
  total: number
  page: number
  limit: number
  pageCount: number
}

function normalizeTopCategory(category: BackendTopCategory): TopCategory {
  return {
    id: category.id,
    name: category.name,
    institutions: category.institutions.map((institution) =>
      normalizeInstitution(institution),
    ),
  }
}

export type TopCategoriesParams = {
  page?: number
  limit?: number
  /** Max institutions per category from API (default 12). */
  institutionsLimit?: number
}

export const topApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTopCategories: builder.query<
      PaginatedList<TopCategory>,
      TopCategoriesParams | void
    >({
      query: (params) => ({
        url: '/top-categories',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 12,
          ...(params?.institutionsLimit != null
            ? { institutionsLimit: params.institutionsLimit }
            : {}),
        },
      }),
      transformResponse: (
        response: BackendTopCategoriesPage,
      ): PaginatedList<TopCategory> => ({
        items: response.items.map((category) => normalizeTopCategory(category)),
        total: response.total,
        page: response.page,
        limit: response.limit,
        pageCount: response.pageCount,
      }),
      providesTags: [{ type: 'PublicTopCategories', id: 'LIST' }],
    }),
  }),
})

export const { useGetTopCategoriesQuery } = topApi
