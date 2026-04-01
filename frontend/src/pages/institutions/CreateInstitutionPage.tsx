import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { InstitutionMapPicker } from '@/features/institution/InstitutionMapPicker'
import { useAuthStore } from '@/entities/user/model/auth.store'
import { apiStore } from '@/shared/api/rtk/api-store'
import { baseApi } from '@/shared/api/rtk/base-api'
import {
  createInstitution,
  type CreateInstitutionPayload,
} from '@/shared/api/institutions/create.api'
import { getErrorMessage } from '@/shared/lib/get-error-message'
import { getGoogleMapsApiKey } from '@/shared/lib/runtime-env'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { LoadingSpinner } from '@/shared/ui/loading-spinner'

const MAX_IMAGES = 6

const mapsApiKey = getGoogleMapsApiKey()

type SelectedImage = {
  id: string
  file: File
  previewUrl: string
}

export function CreateInstitutionPage() {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [city, setCity] = useState('')
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([])
  const [fileInputKey, setFileInputKey] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCoordinatesChange = useCallback((nextLat: number, nextLng: number) => {
    setLat(nextLat)
    setLng(nextLng)
  }, [])

  useEffect(() => {
    return () => {
      selectedImages.forEach((image) => URL.revokeObjectURL(image.previewUrl))
    }
  }, [selectedImages])

  if (!user) {
    return null
  }

  if (user.role !== 'USER') {
    return <Navigate to="/" replace />
  }

  function handleImagesChange(files: FileList | null) {
    if (!files) {
      return
    }

    setSelectedImages((currentImages) => {
      const remainingSlots = Math.max(MAX_IMAGES - currentImages.length, 0)
      const nextFiles = Array.from(files).slice(0, remainingSlots)
      const nextImages = nextFiles.map((file, index) => ({
        id: `${Date.now()}-${index}-${file.name}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }))

      return [...currentImages, ...nextImages]
    })

    setFileInputKey((currentKey) => currentKey + 1)
  }

  function handleRemoveImage(imageId: string) {
    setSelectedImages((currentImages) => {
      const imageToRemove = currentImages.find((image) => image.id === imageId)

      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl)
      }

      return currentImages.filter((image) => image.id !== imageId)
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!mapsApiKey.trim()) {
      setError('Додайте VITE_GOOGLE_MAPS_API_KEY у .env, щоб обрати місце на карті.')
      return
    }

    if (lat === null || lng === null) {
      setError('Клацніть по карті, щоб вказати розташування закладу.')
      return
    }

    const payload: CreateInstitutionPayload = {
      name,
      description,
      city: city.trim() || undefined,
      lat,
      lng,
      images: selectedImages.map((image) => image.file),
    }

    try {
      setIsSubmitting(true)
      setError(null)
      await createInstitution(payload)
      apiStore.dispatch(
        baseApi.util.invalidateTags([
          { type: 'InstitutionList', id: 'LIST' },
          { type: 'MyInstitutions', id: 'LIST' },
        ]),
      )
      toast.success('Заклад створено', {
        description: 'Його відправлено на модерацію.',
      })
      navigate('/', { replace: true })
    } catch (submitError) {
      const message = getErrorMessage(
        submitError,
        'Не вдалося створити заклад.',
      )
      setError(message)
      toast.error('Помилка створення закладу', {
        description: message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <Link className="text-sm text-muted-foreground hover:text-foreground" to="/institutions">
          Назад до закладів
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Створити заклад</h1>
        <p className="text-muted-foreground">
          Додайте основну інформацію, вкажіть місце на карті та фото. Після створення заклад
          потрапить на модерацію.
        </p>
      </div>

      <form className="space-y-5 rounded-3xl border bg-card p-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="name">
            Назва
          </label>
          <Input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Наприклад, Piyachok Pub"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="description">
            Опис
          </label>
          <textarea
            id="description"
            rows={5}
            className="flex w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Коротко опишіть заклад"
          />
        </div>

        <InstitutionMapPicker
          apiKey={mapsApiKey}
          lat={lat}
          lng={lng}
          onCoordinatesChange={handleCoordinatesChange}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="city">
            Місто
          </label>
          <Input
            id="city"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Наприклад, Київ"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="images">
            Фото закладу
          </label>
          <input
            key={fileInputKey}
            id="images"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            multiple
            className="block w-full rounded-md border bg-background px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:opacity-90"
            onChange={(event) => handleImagesChange(event.target.files)}
            disabled={selectedImages.length >= MAX_IMAGES}
          />
          <div className="rounded-2xl border border-dashed bg-muted/30 p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Можна додати кілька фото для одного закладу
              </p>
              <p className="text-xs text-muted-foreground">
                Виберіть одразу кілька файлів у діалозі або додавайте нові фото
                повторно. Зараз вибрано {selectedImages.length} з {MAX_IMAGES}.
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            До 6 зображень, кожне до 5MB. Якщо відкриваєте системне вікно вибору
            файлів, можна позначити кілька фото одразу.
          </p>
        </div>

        {selectedImages.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {selectedImages.map((image, index) => (
              <div
                key={image.id}
                className="relative overflow-hidden rounded-2xl border bg-muted"
              >
                <button
                  type="button"
                  className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white transition-opacity hover:bg-black/85"
                  onClick={() => handleRemoveImage(image.id)}
                >
                  <span className="text-sm leading-none">×</span>
                  Видалити
                </button>
                <img
                  src={image.previewUrl}
                  alt={image.file.name}
                  className="aspect-16/10 h-full w-full object-cover"
                />
                <div className="flex items-center justify-between gap-2 border-t bg-background px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground">Фото {index + 1}</p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {image.file.name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

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

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <LoadingSpinner />
              Створюємо...
            </>
          ) : (
            'Створити заклад'
          )}
        </Button>
      </form>
    </section>
  )
}
