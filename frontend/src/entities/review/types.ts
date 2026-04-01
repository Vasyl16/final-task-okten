export type Review = {
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
  comment: string | null
  /** Середній чек / бюджет відвідування, ₴ */
  averageCheck: number | null
  createdAt: string
}

export type CreateReviewPayload = {
  institutionId: string
  rating: number
  comment: string
  averageCheck?: number
}
