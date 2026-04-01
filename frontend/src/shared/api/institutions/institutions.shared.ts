import type { Institution } from '@/entities/institution/types'

export type PaginatedInstitutions = {
  items: Institution[]
  total: number
  page: number
  limit: number
  pageCount: number
}

export type BackendInstitution = {
  id: string
  name: string
  description?: string | null
  averageRating: number
  reviewsCount: number
  viewsCount: number
  lat: number
  lng: number
  createdAt: string
  city?: string | null
  images?: string[] | null
  ownerId?: string
}

export type InstitutionsQueryParams = {
  page?: number
  limit?: number
  search?: string
  category?: string
  city?: string
  sort?: 'rating' | 'views'
}

export type BackendPaginatedInstitutions = {
  items: BackendInstitution[]
  total: number
  page: number
  limit: number
  pageCount: number
}

export function normalizePaginatedInstitutions(
  response: BackendPaginatedInstitutions,
): PaginatedInstitutions {
  return {
    items: response.items.map((institution) => normalizeInstitution(institution)),
    total: response.total,
    page: response.page,
    limit: response.limit,
    pageCount: response.pageCount,
  }
}

export function normalizeInstitution(institution: BackendInstitution): Institution {
  return {
    id: institution.id,
    name: institution.name,
    description: institution.description?.trim() || 'Опис поки що відсутній.',
    city: institution.city?.trim() || 'Місто не вказано',
    images: institution.images ?? [],
    averageRating: institution.averageRating,
    reviewsCount: institution.reviewsCount,
    viewsCount: institution.viewsCount,
    lat: institution.lat,
    lng: institution.lng,
    createdAt: institution.createdAt,
    ownerId: institution.ownerId,
  }
}
