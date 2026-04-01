import type { UserRole } from '@/entities/user/types'
import { baseApi } from '@/shared/api/rtk/base-api'

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

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminUsers: builder.query<AdminUser[], void>({
      query: () => '/admin/users',
      providesTags: (result) =>
        result
          ? [
              { type: 'AdminUsers', id: 'LIST' },
              ...result.map((user) => ({ type: 'AdminUsers' as const, id: user.id })),
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

    getPendingInstitutions: builder.query<PendingInstitution[], void>({
      query: () => '/admin/institutions/pending',
      providesTags: (result) =>
        result
          ? [
              { type: 'PendingInstitutions', id: 'LIST' },
              ...result.map((institution) => ({
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

    getAdminTopCategories: builder.query<AdminTopCategory[], void>({
      query: () => '/admin/top-categories',
      providesTags: (result) =>
        result
          ? [
              { type: 'AdminTopCategories', id: 'LIST' },
              ...result.map((category) => ({
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
      invalidatesTags: [{ type: 'AdminTopCategories', id: 'LIST' }],
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
      ],
    }),

    deleteTopCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/top-categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'AdminTopCategories', id: 'LIST' }],
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
      ],
    }),

    getInstitutionAnalytics: builder.query<InstitutionAnalyticsItem[], void>({
      query: () => '/admin/analytics/institutions',
      providesTags: [{ type: 'AdminAnalytics', id: 'LIST' }],
    }),

    getInstitutionAnalyticsById: builder.query<InstitutionViewsByDateItem[], string>({
      query: (id) => `/admin/analytics/institutions/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'AdminAnalyticsDetail', id }],
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
