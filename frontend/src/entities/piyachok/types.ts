export type Piyachok = {
  id: string
  message: string
  createdAt: string
  date: string
  institutionId?: string
  institutionName?: string
  peopleCount?: number
  budget?: number | null
  user?: {
    name?: string
  } | null
}

export type PiyachokDetail = Piyachok & {
  institutionId: string
  institutionName: string
  institutionLat: number
  institutionLng: number
  genderPreference?: string | null
  whoPays?: string | null
}

export type CreatePiyachokPayload = {
  institutionId: string
  date: string
  peopleCount: number
  message: string
  budget?: number
}
