import type { CreateReviewPayload, Review } from '@/entities/review/types'
import { baseApi } from '@/shared/api/rtk/base-api'

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

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReviewsByInstitution: builder.query<Review[], string>({
      query: (institutionId) => `/institutions/${institutionId}/reviews`,
      transformResponse: (response: BackendReview[]): Review[] =>
        response.map((review) => normalizeReview(review)),
      providesTags: (_result, _error, institutionId) => [
        { type: 'ReviewList', id: institutionId },
      ],
    }),

    getMyReviews: builder.query<Review[], void>({
      query: () => '/reviews/my',
      transformResponse: (response: BackendReview[]): Review[] =>
        response.map((review) => normalizeReview(review)),
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
