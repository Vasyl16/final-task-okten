import { Eye, MapPin, Navigation, Star } from 'lucide-react'
import { useMemo, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { ReviewsList } from '@/entities/review/ReviewsList'
import { useAuthStore } from '@/entities/user/model/auth.store'
import { FavoriteButton } from '@/features/favorites/FavoriteButton'
import { AddReviewForm } from '@/features/review/AddReviewForm'
import { useGetFavoriteInstitutionIdsQuery } from '@/shared/api/favorites/get-favorites.query'
import { useGetInstitutionByIdQuery } from '@/shared/api/institutions/get-by-id.query'
import { useGetReviewsByInstitutionQuery, useGetMyReviewsQuery } from '@/shared/api/reviews.api'
import { useTrackInstitutionViewMutation } from '@/shared/api/institutions/track-view.mutation'
import {
  googleMapsDirectionsUrl,
  googleMapsEmbedUrl,
  googleMapsSearchUrl,
} from '@/shared/lib/maps'
import { getGoogleMapsApiKey } from '@/shared/lib/runtime-env'
import { useClampPage, useSearchParamPage } from '@/shared/lib/use-search-param-page'
import { Button } from '@/shared/ui/button'
import { Pagination } from '@/shared/ui/pagination'

const mapsApiKey = getGoogleMapsApiKey()
const REVIEWS_PAGE_SIZE = 12

export function InstitutionDetailsPage() {
  const { id = '' } = useParams<{ id: string }>()
  const trackedInstitutionId = useRef<string | null>(null)
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [reviewsPage, setReviewsPage] = useSearchParamPage('rpage')

  const {
    data: institution,
    isLoading,
    error,
    refetch,
  } = useGetInstitutionByIdQuery(id, {
    skip: !id,
  })

  const { data: favoriteIdsList = [] } = useGetFavoriteInstitutionIdsQuery(undefined, {
    skip: !isAuthenticated,
  })

  const {
    data: reviewsData,
    isLoading: isReviewsLoading,
  } = useGetReviewsByInstitutionQuery(
    { institutionId: id, page: reviewsPage, limit: REVIEWS_PAGE_SIZE },
    {
      skip: !id,
    },
  )

  const { data: myReviewProbe } = useGetMyReviewsQuery(
    { institutionId: id, page: 1, limit: 1 },
    { skip: !isAuthenticated || !id },
  )

  const reviews = reviewsData?.items ?? []
  const resolvedReviewsPageCount = reviewsData?.pageCount
  const reviewsPageCount = resolvedReviewsPageCount ?? 1
  const hasOwnReview = (myReviewProbe?.total ?? 0) > 0

  useClampPage(reviewsPage, resolvedReviewsPageCount, setReviewsPage)

  const [trackView] = useTrackInstitutionViewMutation()

  const isFavorite = useMemo(
    () => (institution ? favoriteIdsList.includes(institution.id) : false),
    [favoriteIdsList, institution?.id],
  )

  const isViewerOwner = useMemo(() => {
    if (!user || !institution) {
      return false
    }

    return institution.ownerId === user.id
  }, [user, institution])

  useEffect(() => {
    setReviewsPage(1)
  }, [id])

  useEffect(() => {
    if (!id || trackedInstitutionId.current === id) {
      return
    }

    trackedInstitutionId.current = id
    void trackView(id)
  }, [id, trackView])

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="h-10 w-1/3 animate-pulse rounded bg-muted" />
        <div className="aspect-16/8 animate-pulse rounded-2xl bg-muted" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl bg-muted"
            />
          ))}
        </div>
      </section>
    )
  }

  if (error || !institution) {
    return (
      <section className="rounded-2xl border border-destructive/20 bg-destructive/10 p-5">
        <p className="text-sm text-destructive">
          Не вдалося завантажити сторінку закладу.
        </p>
        <Button className="mt-4" variant="outline" onClick={() => void refetch()}>
          Спробувати ще раз
        </Button>
      </section>
    )
  }

  const galleryImages =
    institution.images.length > 0 ? institution.images : [null, null, null]

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{institution.city}</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {institution.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
              {institution.averageRating.toFixed(1)}
            </span>
            <span>{institution.reviewsCount} відгуків</span>
            <span className="inline-flex items-center gap-1">
              <Eye className="size-4" />
              {institution.viewsCount} переглядів
            </span>
          </div>
        </div>

        <FavoriteButton institutionId={institution.id} isFavorite={isFavorite} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {galleryImages.map((image, index) => (
          <div
            key={`${institution.id}-${index}`}
            className="aspect-16/10 overflow-hidden rounded-2xl border bg-muted"
          >
            {image ? (
              <img
                src={image}
                alt={`${institution.name} ${index + 1}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-zinc-100 to-zinc-200 text-sm text-muted-foreground">
                Фото закладу
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <h2 className="text-xl font-semibold">Розташування</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {institution.city}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <a
              href={googleMapsDirectionsUrl(institution.lat, institution.lng)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Navigation className="size-4" />
              Маршрут у Google Maps
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a
              href={googleMapsSearchUrl(institution.lat, institution.lng)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MapPin className="size-4" />
              Відкрити на карті
            </a>
          </Button>
        </div>
        {mapsApiKey.trim() ? (
          <div className="mt-4 overflow-hidden rounded-2xl border">
            <iframe
              title={`Карта: ${institution.name}`}
              className="aspect-video w-full min-h-[240px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              src={googleMapsEmbedUrl(institution.lat, institution.lng, mapsApiKey)}
            />
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Додайте <code className="rounded bg-muted px-1">VITE_GOOGLE_MAPS_API_KEY</code> у
            середовище, щоб бачити вбудовану карту.
          </p>
        )}
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <h2 className="text-xl font-semibold">Опис</h2>
        <p className="mt-3 whitespace-pre-line text-muted-foreground">
          {institution.description}
        </p>
      </div>

      {!isViewerOwner ? (
        <AddReviewForm institutionId={institution.id} hasOwnReview={hasOwnReview} />
      ) : null}

      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">Відгуки</h2>
          <p className="text-sm text-muted-foreground">
            Оцінки користувачів та критиків для цього закладу.
          </p>
        </div>

        <ReviewsList
          institutionId={institution.id}
          reviews={reviews}
          isLoading={isReviewsLoading}
        />
        <Pagination
          page={reviewsPage}
          pageCount={reviewsPageCount}
          onPageChange={setReviewsPage}
        />
      </div>
    </section>
  )
}
