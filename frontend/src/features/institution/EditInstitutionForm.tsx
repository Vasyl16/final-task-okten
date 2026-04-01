import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { Institution } from '@/entities/institution/types'
import { InstitutionMapPicker } from '@/features/institution/InstitutionMapPicker'
import {
  updateInstitution,
  type CreateInstitutionPayload,
} from '@/shared/api/institutions/create.api'
import { apiStore } from '@/shared/api/rtk/api-store'
import { baseApi } from '@/shared/api/rtk/base-api'
import { getErrorMessage } from '@/shared/lib/get-error-message'
import { getGoogleMapsApiKey } from '@/shared/lib/runtime-env'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { LoadingSpinner } from '@/shared/ui/loading-spinner'

const MAX_INSTITUTION_IMAGES = 6

const mapsApiKey = getGoogleMapsApiKey()

type ExistingImage = {
  id: string
  url: string
}

type NewImage = {
  id: string
  file: File
  previewUrl: string
}

type EditInstitutionFormProps = {
  institution: Institution
  onCancel: () => void
  onSaved: () => void
}

function buildExistingImages(images: string[]) {
  return images.map((url, index) => ({
    id: `existing-${index}-${url}`,
    url,
  }))
}

export function EditInstitutionForm({
  institution,
  onCancel,
  onSaved,
}: EditInstitutionFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [name, setName] = useState(institution.name)
  const [description, setDescription] = useState(institution.description)
  const [lat, setLat] = useState(institution.lat)
  const [lng, setLng] = useState(institution.lng)
  const [city, setCity] = useState(
    institution.city === 'Місто не вказано' ? '' : institution.city,
  )
  const [existingImages, setExistingImages] = useState<ExistingImage[]>(
    buildExistingImages(institution.images),
  )
  const [newImages, setNewImages] = useState<NewImage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCoordinatesChange = useCallback((nextLat: number, nextLng: number) => {
    setLat(nextLat)
    setLng(nextLng)
  }, [])

  useEffect(() => {
    return () => {
      newImages.forEach((image) => {
        URL.revokeObjectURL(image.previewUrl)
      })
    }
  }, [newImages])

  function cleanupNewImages(images: NewImage[]) {
    images.forEach((image) => {
      URL.revokeObjectURL(image.previewUrl)
    })
  }

  function handleAddImages(files: FileList | null) {
    if (!files) {
      return
    }

    const remainingSlots = Math.max(
      MAX_INSTITUTION_IMAGES - existingImages.length - newImages.length,
      0,
    )

    const filesToAdd = Array.from(files).slice(0, remainingSlots)

    if (filesToAdd.length === 0) {
      return
    }

    setNewImages((currentImages) => [
      ...currentImages,
      ...filesToAdd.map((file, index) => ({
        id: `${Date.now()}-${index}-${file.name}`,
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ])

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleRemoveExistingImage(imageId: string) {
    setExistingImages((currentImages) =>
      currentImages.filter((image) => image.id !== imageId),
    )
  }

  function handleRemoveNewImage(imageId: string) {
    setNewImages((currentImages) => {
      const imageToRemove = currentImages.find((image) => image.id === imageId)

      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl)
      }

      return currentImages.filter((image) => image.id !== imageId)
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const payload: CreateInstitutionPayload & {
      replaceImages?: boolean
      existingImages?: string[]
    } = {
      name,
      description,
      city: city.trim() || undefined,
      lat,
      lng,
      images: newImages.map((image) => image.file),
      existingImages: existingImages.map((image) => image.url),
    }

    try {
      setIsSubmitting(true)
      setError(null)
      await updateInstitution(institution.id, payload)
      apiStore.dispatch(
        baseApi.util.invalidateTags([
          { type: 'InstitutionList', id: 'LIST' },
          { type: 'MyInstitutions', id: 'LIST' },
          { type: 'Institution', id: institution.id },
        ]),
      )
      cleanupNewImages(newImages)
      toast.success('Заклад оновлено')
      onSaved()
    } catch (submitError) {
      const message = getErrorMessage(
        submitError,
        'Не вдалося оновити заклад.',
      )
      setError(message)
      toast.error('Помилка оновлення закладу', {
        description: message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      className="space-y-5 rounded-3xl border bg-card p-6"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <div className="space-y-1">
        <h3 className="text-xl font-semibold">Редагування закладу</h3>
        <p className="text-sm text-muted-foreground">
          Можна прибирати поточні фото і додавати кілька нових перед збереженням.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor={`edit-name-${institution.id}`}>
            Назва
          </label>
          <Input
            id={`edit-name-${institution.id}`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor={`edit-images-${institution.id}`}>
            Додати нові фото
          </label>
          <input
            ref={fileInputRef}
            id={`edit-images-${institution.id}`}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            multiple
            className="block w-full rounded-md border bg-background px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:opacity-90"
            disabled={existingImages.length + newImages.length >= MAX_INSTITUTION_IMAGES}
            onChange={(event) => handleAddImages(event.target.files)}
          />
          <p className="text-xs text-muted-foreground">
            Зараз вибрано {existingImages.length + newImages.length} з{' '}
            {MAX_INSTITUTION_IMAGES} фото.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-medium"
          htmlFor={`edit-description-${institution.id}`}
        >
          Опис
        </label>
        <textarea
          id={`edit-description-${institution.id}`}
          rows={5}
          className="flex w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      {mapsApiKey.trim() ? (
        <>
          <InstitutionMapPicker
            apiKey={mapsApiKey}
            lat={lat}
            lng={lng}
            onCoordinatesChange={handleCoordinatesChange}
          />
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor={`edit-city-${institution.id}`}>
              Місто
            </label>
            <Input
              id={`edit-city-${institution.id}`}
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Наприклад, Київ"
            />
          </div>
        </>
      ) : (
        <div className="space-y-4 rounded-2xl border border-dashed bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            Додайте <code className="rounded bg-muted px-1">VITE_GOOGLE_MAPS_API_KEY</code> у{' '}
            <code className="rounded bg-muted px-1">frontend/.env</code>, щоб обирати місце на карті.
            Поки що можна змінити координати вручну.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor={`edit-lat-${institution.id}`}>
                Широта
              </label>
              <Input
                id={`edit-lat-${institution.id}`}
                type="number"
                step="0.000001"
                value={lat}
                onChange={(event) => setLat(Number(event.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor={`edit-lng-${institution.id}`}>
                Довгота
              </label>
              <Input
                id={`edit-lng-${institution.id}`}
                type="number"
                step="0.000001"
                value={lng}
                onChange={(event) => setLng(Number(event.target.value))}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor={`edit-city-fallback-${institution.id}`}>
              Місто
            </label>
            <Input
              id={`edit-city-fallback-${institution.id}`}
              value={city}
              onChange={(event) => setCity(event.target.value)}
            />
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Поточні фото</p>
          {existingImages.length === 0 ? (
            <p className="text-sm text-muted-foreground">Поточних фото немає.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {existingImages.map((image, index) => (
                <div
                  key={image.id}
                  className="relative overflow-hidden rounded-2xl border bg-muted"
                >
                  <button
                    type="button"
                    className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white transition-opacity hover:bg-black/85"
                    onClick={() => handleRemoveExistingImage(image.id)}
                  >
                    <span className="text-sm leading-none">×</span>
                    Видалити
                  </button>
                  <img
                    src={image.url}
                    alt={`Фото закладу ${index + 1}`}
                    className="aspect-16/10 h-full w-full object-cover"
                  />
                  <div className="flex items-center justify-between gap-2 border-t bg-background px-3 py-2">
                    <p className="text-xs text-muted-foreground">
                      Поточне фото {index + 1}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Нові фото</p>
          {newImages.length === 0 ? (
            <p className="text-sm text-muted-foreground">Нові фото ще не додані.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {newImages.map((image, index) => (
                <div
                  key={image.id}
                  className="relative overflow-hidden rounded-2xl border bg-muted"
                >
                  <button
                    type="button"
                    className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white transition-opacity hover:bg-black/85"
                    onClick={() => handleRemoveNewImage(image.id)}
                  >
                    <span className="text-sm leading-none">×</span>
                    Видалити
                  </button>
                  <img
                    src={image.previewUrl}
                    alt={`Нове фото ${index + 1}`}
                    className="aspect-16/10 h-full w-full object-cover"
                  />
                  <div className="flex items-center justify-between gap-2 border-t bg-background px-3 py-2">
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {image.file.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div aria-live="polite" className="min-h-11">
        <p
          className={[
            'rounded-md border px-3 py-2 text-sm transition-opacity',
            error
              ? 'visible border-destructive/20 bg-destructive/10 text-destructive opacity-100'
              : 'invisible opacity-0',
          ].join(' ')}
        >
          {error ?? '\u00A0'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <LoadingSpinner />
              Зберігаємо...
            </>
          ) : (
            'Зберегти'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            cleanupNewImages(newImages)
            onCancel()
          }}
        >
          Скасувати
        </Button>
      </div>
    </form>
  )
}
