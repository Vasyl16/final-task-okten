import { Star, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Swiper as SwiperClass } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Institution } from './types'
import { FavoriteButton } from '@/features/favorites/FavoriteButton'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { LoadingSpinner } from '@/shared/ui/loading-spinner'

type InstitutionCardProps = {
  institution: Institution
  onFavoriteChange?: (value: boolean) => void
  badge?: string
  /** У профілі: лише перше фото (без слайдера й мініатюр) */
  imageLayout?: 'carousel' | 'first'
  /** Куди ведуть кліки по картці: сторінка закладу або форма редагування */
  linkTarget?: 'detail' | 'edit'
  /** Без посилань на картці (кнопки дій ззовні, наприклад у «Мої заклади») */
  disableNavigation?: boolean
  /** Кнопка видалення на зображенні (лівий верх), як обране праворуч */
  onDelete?: () => void
  deletePending?: boolean
  /** Приховати кнопку обраного (наприклад, у «Мої заклади») */
  showFavorite?: boolean
}

export function InstitutionCard({
  institution,
  onFavoriteChange,
  badge,
  imageLayout = 'carousel',
  linkTarget = 'detail',
  disableNavigation = false,
  onDelete,
  deletePending = false,
  showFavorite = true,
}: InstitutionCardProps) {
  const images = institution.images
  const hasMultiple = images.length > 1
  const swiperRef = useRef<SwiperClass | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const firstImageOnly = imageLayout === 'first'
  const coverSrc = images[0]
  const href =
    linkTarget === 'edit'
      ? `/institutions/${institution.id}/edit`
      : `/institutions/${institution.id}`

  const imageWrapperClass =
    'group flex h-full min-h-0 w-full flex-col'

  const imageBlock = (
    <>
            {firstImageOnly ? (
              coverSrc ? (
                <img
                  src={coverSrc}
                  alt={institution.name}
                  className="h-full w-full min-h-0 flex-1 object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                />
              ) : (
                <div className="flex h-full min-h-0 w-full flex-1 items-center justify-center bg-linear-to-br from-muted to-muted/60 text-sm text-muted-foreground">
                  Фото закладу
                </div>
              )
            ) : hasMultiple ? (
              <Swiper
                className="institution-card-swiper h-full min-h-0 w-full flex-1"
                slidesPerView={1}
                loop={images.length > 2}
                pagination={false}
                onSwiper={(instance) => {
                  swiperRef.current = instance
                }}
                onSlideChange={(instance) => {
                  setActiveIndex(instance.realIndex)
                }}
              >
                {images.map((src) => (
                  <SwiperSlide key={src}>
                    <img
                      src={src}
                      alt={institution.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : images[0] ? (
              <img
                src={images[0]}
                alt={institution.name}
                className="h-full min-h-0 w-full flex-1 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex h-full min-h-0 w-full flex-1 items-center justify-center bg-linear-to-br from-muted to-muted/60 text-sm text-muted-foreground">
                Фото закладу
              </div>
            )}
    </>
  )

  const footerInner = (
    <div className="space-y-3">
      <div className="space-y-1">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug sm:text-lg">
          {institution.name}
        </h3>
        <p className="text-sm text-muted-foreground">{institution.city}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1 font-medium text-foreground">
          <Star className="size-4 fill-yellow-400 text-yellow-400" />
          {institution.averageRating.toFixed(1)}
        </span>
        <span>{institution.reviewsCount} відгуків</span>
      </div>
    </div>
  )

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="relative bg-muted">
        <div className="relative aspect-16/10 w-full overflow-hidden">
          {disableNavigation ? (
            <div className={imageWrapperClass}>{imageBlock}</div>
          ) : (
            <Link
              to={href}
              className={imageWrapperClass}
              aria-label={
                linkTarget === 'edit'
                  ? `Редагувати ${institution.name}`
                  : `Відкрити ${institution.name}`
              }
            >
              {imageBlock}
            </Link>
          )}

          {onDelete ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={deletePending}
              className="absolute left-3 top-3 z-10 bg-background/90 shadow-sm backdrop-blur-sm"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onDelete()
              }}
              aria-label="Видалити заклад"
            >
              {deletePending ? (
                <LoadingSpinner className="size-4" />
              ) : (
                <Trash2 className="size-4" />
              )}
            </Button>
          ) : null}

          {showFavorite ? (
            <FavoriteButton
              institutionId={institution.id}
              isFavorite={institution.isFavorite}
              onChange={onFavoriteChange}
              className="absolute right-3 top-3 z-10 bg-background/90 shadow-sm backdrop-blur-sm"
            />
          ) : null}

          {badge ? (
            <span
              className={cn(
                'pointer-events-none absolute z-10 rounded-full bg-orange-500 px-2.5 py-1 text-xs font-medium text-white shadow-sm',
                onDelete ? 'left-3 top-14' : 'left-3 top-3',
              )}
            >
              {badge}
            </span>
          ) : null}
        </div>

        {!firstImageOnly && hasMultiple ? (
          <div
            className="flex gap-1.5 overflow-x-auto border-t border-border bg-card px-2 py-2 sm:gap-2 sm:px-3 sm:py-2.5"
            role="tablist"
            aria-label="Мініатюри фото"
          >
            {images.map((src, index) => (
              <button
                key={`${institution.id}-thumb-${index}`}
                type="button"
                role="tab"
                aria-selected={activeIndex === index}
                className={cn(
                  'relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:h-14 sm:w-14',
                  activeIndex === index
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-transparent opacity-75 hover:opacity-100',
                )}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  const swiper = swiperRef.current
                  if (!swiper) {
                    return
                  }
                  if (swiper.params.loop && typeof swiper.slideToLoop === 'function') {
                    swiper.slideToLoop(index)
                  } else {
                    swiper.slideTo(index)
                  }
                }}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {disableNavigation ? (
        <div className="block p-4 sm:p-5">{footerInner}</div>
      ) : (
        <Link to={href} className="block p-4 sm:p-5">
          {footerInner}
        </Link>
      )}
    </article>
  )
}
