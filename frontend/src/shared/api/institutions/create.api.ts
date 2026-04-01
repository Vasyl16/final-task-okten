import type { Institution } from '@/entities/institution/types'
import { api } from '@/shared/api/base-api'
import { toFormData } from '@/shared/lib/to-form-data'
import {
  normalizeInstitution,
  type BackendInstitution,
} from './institutions.shared'

export type CreateInstitutionPayload = {
  name: string
  description?: string
  city?: string
  lat: number
  lng: number
  images?: File[]
}

export async function createInstitution(payload: CreateInstitutionPayload) {
  const formData = toFormData({
    name: payload.name.trim(),
    description: payload.description?.trim() || undefined,
    city: payload.city?.trim() || undefined,
    lat: payload.lat,
    lng: payload.lng,
    images: payload.images ?? [],
  })

  const { data } = await api.post<BackendInstitution>('/institutions', formData)

  return normalizeInstitution(data)
}

export async function updateInstitution(
  id: string,
  payload: CreateInstitutionPayload & {
    replaceImages?: boolean
    existingImages?: string[]
  },
): Promise<Institution> {
  const formData = new FormData()
  formData.append('name', payload.name.trim())
  formData.append('lat', String(payload.lat))
  formData.append('lng', String(payload.lng))

  if (payload.city?.trim()) {
    formData.append('city', payload.city.trim())
  }

  if (payload.description?.trim()) {
    formData.append('description', payload.description.trim())
  }

  const shouldReplaceImages =
    payload.replaceImages ?? (payload.existingImages?.length === 0)

  if (shouldReplaceImages) {
    formData.append('replaceImages', 'true')
  }

  payload.existingImages?.forEach((imageUrl) => {
    formData.append('existingImages', imageUrl)
  })

  payload.images?.forEach((image) => {
    formData.append('images', image)
  })

  const { data } = await api.patch<BackendInstitution>(`/institutions/${id}`, formData)

  return normalizeInstitution(data)
}
