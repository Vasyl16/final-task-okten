import type { CreateReviewPayload, Review } from '@/entities/review/types'
import { baseApi } from '@/shared/api/rtk/base-api'
import type { PaginatedList } from '@/shared/api/paginated.types'

type BackendReview = {
  id: string
  institution?: {
    id: string
    name: string
  }
  user: {
    id: string
    name: string
    email: string
    isCritic: boolean
  }
  rating: number
  text: string | null
  averageCheck: number | null
  createdAt: string
}

type BackendPaginatedReviews = {
  items: BackendReview[]
  total: number
  page: number
  limit: number
  pageCount: number
}

function normalizeReview(review: BackendReview): Review {
  return {
    id: review.id,
    institution: review.institution,
    user: review.user,
    rating: review.rating,
    comment: review.text,
    averageCheck: review.averageCheck ?? null,
    createdAt: review.createdAt,
  }
}

function normalizePaginatedReviews(
  response: BackendPaginatedReviews,
): PaginatedList<Review> {
  return {
    items: response.items.map((review) => normalizeReview(review)),
    total: response.total,
    page: response.page,
    limit: response.limit,
    pageCount: response.pageCount,
  }
}

export type ReviewsByInstitutionParams = {
  institutionId: string
  page?: number
  limit?: number
}

export type MyReviewsParams = {
  page?: number
  limit?: number
  institutionId?: string
}

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReviewsByInstitution: builder.query<
      PaginatedList<Review>,
      ReviewsByInstitutionParams
    >({
      query: ({ institutionId, page = 1, limit = 12 }) => ({
        url: `/institutions/${institutionId}/reviews`,
        params: { page, limit },
      }),
      transformResponse: (response: BackendPaginatedReviews): PaginatedList<Review> =>
        normalizePaginatedReviews(response),
      providesTags: (_result, _error, { institutionId }) => [
        { type: 'ReviewList', id: institutionId },
      ],
    }),

    getMyReviews: builder.query<PaginatedList<Review>, MyReviewsParams | void>({
      query: (args) => ({
        url: '/reviews/my',
        params: {
          page: args?.page ?? 1,
          limit: args?.limit ?? 12,
          ...(args?.institutionId ? { institutionId: args.institutionId } : {}),
        },
      }),
      transformResponse: (response: BackendPaginatedReviews): PaginatedList<Review> =>
        normalizePaginatedReviews(response),
      providesTags: [{ type: 'MyReviews', id: 'LIST' }],
    }),

    createReview: builder.mutation<void, CreateReviewPayload>({
      query: ({ institutionId, rating, comment, averageCheck }) => ({
        url: '/reviews',
        method: 'POST',
        body: {
          institutionId,
          rating,
          text: comment || undefined,
          averageCheck:
            averageCheck !== undefined && !Number.isNaN(averageCheck)
              ? averageCheck
              : undefined,
        },
      }),
      invalidatesTags: (_result, _error, { institutionId }) => [
        { type: 'MyReviews', id: 'LIST' },
        { type: 'ReviewList', id: institutionId },
        { type: 'Institution', id: institutionId },
        { type: 'InstitutionList', id: 'LIST' },
      ],
    }),

    deleteReview: builder.mutation<void, { reviewId: string; institutionId: string }>({
      query: ({ reviewId }) => ({
        url: `/reviews/${reviewId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { institutionId }) => [
        { type: 'MyReviews', id: 'LIST' },
        { type: 'ReviewList', id: institutionId },
        { type: 'Institution', id: institutionId },
        { type: 'InstitutionList', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetMyReviewsQuery,
  useGetReviewsByInstitutionQuery,
  useCreateReviewMutation,
  useDeleteReviewMutation,
} = reviewsApi
