import type { News } from '@/entities/news/types'
import { api } from '@/shared/api/base-api'
import { baseApi } from '@/shared/api/rtk/base-api'
import { toFormData } from '@/shared/lib/to-form-data'

type BackendNews = {
  id: string
  title: string
  content: string
  imageUrl?: string | null
  createdAt: string
}

export type CreateNewsPayload = {
  title: string
  content: string
  category: 'GENERAL' | 'PROMOTION' | 'EVENT'
  institutionId: string
  image?: File | null
}

export type NewsListQueryParams = {
  page?: number
  limit?: number
  search?: string
  sort?: 'asc' | 'desc'
  category?: 'GENERAL' | 'PROMOTION' | 'EVENT'
}

export type PaginatedNews = {
  items: News[]
  total: number
  page: number
  limit: number
  pageCount: number
}

type BackendPaginatedNews = {
  items: BackendNews[]
  total: number
  page: number
  limit: number
  pageCount: number
}

function normalizeNews(item: BackendNews): News {
  return {
    id: item.id,
    title: item.title,
    content: item.content,
    image: item.imageUrl ?? null,
    createdAt: item.createdAt,
  }
}

function normalizePaginatedNews(response: BackendPaginatedNews): PaginatedNews {
  return {
    items: response.items.map((item) => normalizeNews(item)),
    total: response.total,
    page: response.page,
    limit: response.limit,
    pageCount: response.pageCount,
  }
}

export const newsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllNews: builder.query<PaginatedNews, NewsListQueryParams | void>({
      query: (params) => ({
        url: '/news',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 12,
          search: params?.search?.trim() || undefined,
          sort: params?.sort,
          category: params?.category,
        },
      }),
      transformResponse: (response: BackendPaginatedNews): PaginatedNews =>
        normalizePaginatedNews(response),
      providesTags: [{ type: 'NewsList', id: 'LIST' }],
    }),

    getNewsById: builder.query<News, string>({
      query: (id) => `/news/${id}`,
      transformResponse: (response: BackendNews): News => normalizeNews(response),
      providesTags: (_result, _error, id) => [{ type: 'NewsList', id }],
    }),
  }),
})

export async function createNews(payload: CreateNewsPayload) {
  const formData = toFormData({
    title: payload.title.trim(),
    content: payload.content.trim(),
    category: payload.category,
    institutionId: payload.institutionId,
    image: payload.image ?? undefined,
  })

  const { data } = await api.post<BackendNews>('/news', formData)

  return normalizeNews(data)
}

export const { useGetAllNewsQuery, useGetNewsByIdQuery } = newsApi
