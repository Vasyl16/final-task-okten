import type { TopCategory } from '@/entities/institution/types'
import { baseApi } from '@/shared/api/rtk/base-api'
import {
  normalizeInstitution,
  type BackendInstitution,
} from '@/shared/api/institutions/institutions.shared'

type BackendTopCategory = {
  id: string
  name: string
  institutions: BackendInstitution[]
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

export const topApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTopCategories: builder.query<TopCategory[], void>({
      query: () => '/top-categories',
      transformResponse: (response: BackendTopCategory[]): TopCategory[] =>
        response.map((category) => normalizeTopCategory(category)),
    }),
  }),
})

export const { useGetTopCategoriesQuery } = topApi
