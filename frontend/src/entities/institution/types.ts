export type Institution = {
  id: string
  name: string
  description: string
  city: string
  images: string[]
  averageRating: number
  reviewsCount: number
  viewsCount: number
  lat: number
  lng: number
  createdAt: string
  /** Present when API returns it (e.g. detail); used to hide self-review UI for owners */
  ownerId?: string
  isFavorite?: boolean
}

export type TopCategory = {
  id: string
  name: string
  institutions: Institution[]
}

export type InstitutionListParams = {
  search?: string
  category?: string
  city?: string
  sort?: 'rating' | 'views'
}
