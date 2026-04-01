import type { Institution } from '@/entities/institution/types'
import type { BackendInstitution } from '@/shared/api/institutions/institutions.shared'
import { normalizeInstitution } from '@/shared/api/institutions/institutions.shared'

export type FavoriteResponseItem = {
  institution: BackendInstitution
}

export function mapFavoritesToInstitutions(items: FavoriteResponseItem[]): Institution[] {
  return items.map((item) => ({
    ...normalizeInstitution(item.institution),
    isFavorite: true,
  }))
}
