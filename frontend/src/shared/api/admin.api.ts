import type { UserRole } from '@/entities/user/types'
import { baseApi } from '@/shared/api/rtk/base-api'
import type { PaginatedList } from '@/shared/api/paginated.types'

export type AdminUser = {
  id: string
  name: string
  email: string
  role: UserRole
  isCritic: boolean
  createdAt: string
}

export type PendingInstitution = {
  id: string
  name: string
  description?: string | null
  ownerId: string
  createdAt: string
  city?: string | null
  owner?: {
    name?: string
    email?: string
  } | null
}

export type AdminTopCategoryInstitution = {
  id: string
  name: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
}

export type AdminTopCategory = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  institutions: AdminTopCategoryInstitution[]
}

export type InstitutionAnalyticsItem = {
  institutionId: string
  name: string
  viewsCount: number
}

export type InstitutionViewsByDateItem = {
  date: string
  viewsCount: number
}

type UpdateAdminUserPayload = {
  id: string
  role?: UserRole
  isCritic?: boolean
}

type TopCategoryMutationPayload = {
  id: string
  name: string
}

type CategoryInstitutionPayload = {
  categoryId: string
  institutionId: string
}

export type AdminListParams = {
  page?: number
  limit?: number
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminUsers: builder.query<PaginatedList<AdminUser>, AdminListParams | void>({
      query: (params) => ({
        url: '/admin/users',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 12,
        },
      }),
      providesTags: (result) =>
        result?.items?.length
          ? [
              { type: 'AdminUsers', id: 'LIST' },
              ...result.items.map((user) => ({ type: 'AdminUsers' as const, id: user.id })),
            ]
          : [{ type: 'AdminUsers', id: 'LIST' }],
    }),

    updateAdminUser: builder.mutation<AdminUser, UpdateAdminUserPayload>({
      query: ({ id, ...body }) => ({
        url: `/admin/users/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'AdminUsers', id },
        { type: 'AdminUsers', id: 'LIST' },
      ],
    }),

    deleteAdminUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'AdminUsers', id: 'LIST' }],
    }),

    getPendingInstitutions: builder.query<
      PaginatedList<PendingInstitution>,
      AdminListParams | void
    >({
      query: (params) => ({
        url: '/admin/institutions/pending',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 12,
        },
      }),
      providesTags: (result) =>
        result?.items?.length
          ? [
              { type: 'PendingInstitutions', id: 'LIST' },
              ...result.items.map((institution) => ({
                type: 'PendingInstitutions' as const,
                id: institution.id,
              })),
            ]
          : [{ type: 'PendingInstitutions', id: 'LIST' }],
    }),

    approveInstitution: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/institutions/${id}/approve`,
        method: 'PATCH',
      }),
      invalidatesTags: [
        { type: 'PendingInstitutions', id: 'LIST' },
        { type: 'InstitutionList', id: 'LIST' },
      ],
    }),

    rejectInstitution: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/institutions/${id}/reject`,
        method: 'PATCH',
      }),
      invalidatesTags: [{ type: 'PendingInstitutions', id: 'LIST' }],
    }),

    getAdminTopCategories: builder.query<
      PaginatedList<AdminTopCategory>,
      AdminListParams | void
    >({
      query: (params) => ({
        url: '/admin/top-categories',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 50,
        },
      }),
      providesTags: (result) =>
        result?.items?.length
          ? [
              { type: 'AdminTopCategories', id: 'LIST' },
              ...result.items.map((category) => ({
                type: 'AdminTopCategories' as const,
                id: category.id,
              })),
            ]
          : [{ type: 'AdminTopCategories', id: 'LIST' }],
    }),

    createTopCategory: builder.mutation<AdminTopCategory, { name: string }>({
      query: (body) => ({
        url: '/admin/top-categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'AdminTopCategories', id: 'LIST' },
        { type: 'PublicTopCategories', id: 'LIST' },
      ],
    }),

    updateTopCategory: builder.mutation<AdminTopCategory, TopCategoryMutationPayload>({
      query: ({ id, ...body }) => ({
        url: `/admin/top-categories/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'AdminTopCategories', id },
        { type: 'AdminTopCategories', id: 'LIST' },
        { type: 'PublicTopCategories', id: 'LIST' },
      ],
    }),

    deleteTopCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/top-categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'AdminTopCategories', id: 'LIST' },
        { type: 'PublicTopCategories', id: 'LIST' },
      ],
    }),

    addInstitutionToTopCategory: builder.mutation<
      AdminTopCategory,
      CategoryInstitutionPayload
    >({
      query: ({ categoryId, institutionId }) => ({
        url: `/admin/top-categories/${categoryId}/institutions/${institutionId}`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { categoryId }) => [
        { type: 'AdminTopCategories', id: categoryId },
        { type: 'AdminTopCategories', id: 'LIST' },
        { type: 'PublicTopCategories', id: 'LIST' },
      ],
    }),

    removeInstitutionFromTopCategory: builder.mutation<
      AdminTopCategory,
      CategoryInstitutionPayload
    >({
      query: ({ categoryId, institutionId }) => ({
        url: `/admin/top-categories/${categoryId}/institutions/${institutionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { categoryId }) => [
        { type: 'AdminTopCategories', id: categoryId },
        { type: 'AdminTopCategories', id: 'LIST' },
        { type: 'PublicTopCategories', id: 'LIST' },
      ],
    }),

    getInstitutionAnalytics: builder.query<
      PaginatedList<InstitutionAnalyticsItem>,
      AdminListParams | void
    >({
      query: (params) => ({
        url: '/admin/analytics/institutions',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 12,
        },
      }),
      providesTags: [{ type: 'AdminAnalytics', id: 'LIST' }],
    }),

    getInstitutionAnalyticsById: builder.query<
      PaginatedList<InstitutionViewsByDateItem>,
      { id: string } & AdminListParams
    >({
      query: ({ id, page = 1, limit = 12 }) => ({
        url: `/admin/analytics/institutions/${id}`,
        params: { page, limit },
      }),
      providesTags: (_result, _error, { id }) => [{ type: 'AdminAnalyticsDetail', id }],
    }),
  }),
})

export const {
  useApproveInstitutionMutation,
  useCreateTopCategoryMutation,
  useDeleteAdminUserMutation,
  useDeleteTopCategoryMutation,
  useGetAdminTopCategoriesQuery,
  useGetAdminUsersQuery,
  useGetInstitutionAnalyticsByIdQuery,
  useGetInstitutionAnalyticsQuery,
  useGetPendingInstitutionsQuery,
  useRejectInstitutionMutation,
  useRemoveInstitutionFromTopCategoryMutation,
  useAddInstitutionToTopCategoryMutation,
  useUpdateAdminUserMutation,
  useUpdateTopCategoryMutation,
} = adminApi
