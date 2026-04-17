import type {
  CreatePiyachokPayload,
  Piyachok,
  PiyachokDetail,
} from '@/entities/piyachok/types'
import { baseApi } from '@/shared/api/rtk/base-api'
import type { PaginatedList } from '@/shared/api/paginated.types'

type BackendPublicPiyachok = {
  id: string
  user: {
    name: string
  }
  institution: {
    id: string
    name: string
  }
  date: string
  description: string
  peopleCount: number
  budget: number | null
  createdAt: string
}

type BackendPiyachokDetail = {
  id: string
  user: {
    name: string
  }
  institution: {
    id: string
    name: string
    lat: number
    lng: number
  }
  date: string
  description: string
  peopleCount: number
  genderPreference: string | null
  budget: number | null
  whoPays: string | null
  createdAt: string
}

type BackendMyPiyachok = {
  id: string
  user: {
    name: string
  }
  institutionId: string
  date: string
  description: string
  peopleCount: number
  budget: number | null
  createdAt: string
}

type BackendPaginated = {
  items: BackendPublicPiyachok[]
  total: number
  page: number
  limit: number
  pageCount: number
}

export type PiyachokListQueryParams = {
  page?: number
  limit?: number
  sortBy?: 'date' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  institutionId?: string
  /** Підрядок у тексті запиту (без окремого поля «заголовок» у моделі) */
  search?: string
}

export type PaginatedPiyachok = {
  items: Piyachok[]
  total: number
  page: number
  limit: number
  pageCount: number
}

function mapPublicPiyachok(item: BackendPublicPiyachok): Piyachok {
  return {
    id: item.id,
    message: item.description,
    createdAt: item.createdAt,
    date: item.date,
    institutionId: item.institution.id,
    institutionName: item.institution.name,
    peopleCount: item.peopleCount,
    budget: item.budget,
    user: {
      name: item.user.name,
    },
  }
}

function mapPiyachokDetail(item: BackendPiyachokDetail): PiyachokDetail {
  return {
    id: item.id,
    message: item.description,
    createdAt: item.createdAt,
    date: item.date,
    institutionId: item.institution.id,
    institutionName: item.institution.name,
    institutionLat: item.institution.lat,
    institutionLng: item.institution.lng,
    peopleCount: item.peopleCount,
    budget: item.budget,
    genderPreference: item.genderPreference,
    whoPays: item.whoPays,
    user: {
      name: item.user.name,
    },
  }
}

function mapMyPiyachok(item: BackendMyPiyachok): Piyachok {
  return {
    id: item.id,
    message: item.description,
    createdAt: item.createdAt,
    date: item.date,
    institutionId: item.institutionId,
    peopleCount: item.peopleCount,
    budget: item.budget,
    user: {
      name: item.user.name,
    },
  }
}

function normalizePaginated(response: BackendPaginated): PaginatedPiyachok {
  return {
    items: response.items.map((item) => mapPublicPiyachok(item)),
    total: response.total,
    page: response.page,
    limit: response.limit,
    pageCount: response.pageCount,
  }
}

export const piyachokApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllPiyachok: builder.query<PaginatedPiyachok, PiyachokListQueryParams | void>({
      query: (params) => ({
        url: '/piyachok',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
          institutionId: params?.institutionId,
          ...(params?.search?.trim()
            ? { search: params.search.trim() }
            : {}),
        },
      }),
      transformResponse: (response: BackendPaginated): PaginatedPiyachok =>
        normalizePaginated(response),
      providesTags: [{ type: 'PiyachokFeed', id: 'LIST' }],
    }),

    getPiyachokById: builder.query<PiyachokDetail, string>({
      query: (id) => `/piyachok/${id}`,
      transformResponse: (response: BackendPiyachokDetail): PiyachokDetail =>
        mapPiyachokDetail(response),
      providesTags: (_result, _error, id) => [{ type: 'Piyachok', id }],
    }),

    getMyPiyachok: builder.query<
      PaginatedList<Piyachok>,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: '/piyachok/my',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 12,
        },
      }),
      transformResponse: (response: {
        items: BackendMyPiyachok[]
        total: number
        page: number
        limit: number
        pageCount: number
      }): PaginatedList<Piyachok> => ({
        items: response.items.map((item) => mapMyPiyachok(item)),
        total: response.total,
        page: response.page,
        limit: response.limit,
        pageCount: response.pageCount,
      }),
      providesTags: [{ type: 'PiyachokMine', id: 'LIST' }],
    }),

    createPiyachok: builder.mutation<void, CreatePiyachokPayload>({
      query: ({ institutionId, date, peopleCount, message, budget }) => ({
        url: '/piyachok',
        method: 'POST',
        body: {
          institutionId,
          date,
          peopleCount,
          description: message,
          budget,
        },
      }),
      invalidatesTags: [
        { type: 'PiyachokFeed', id: 'LIST' },
        { type: 'PiyachokMine', id: 'LIST' },
      ],
    }),

    deletePiyachok: builder.mutation<void, string>({
      query: (id) => ({
        url: `/piyachok/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'PiyachokFeed', id: 'LIST' },
        { type: 'PiyachokMine', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetAllPiyachokQuery,
  useGetPiyachokByIdQuery,
  useGetMyPiyachokQuery,
  useCreatePiyachokMutation,
  useDeletePiyachokMutation,
} = piyachokApi
