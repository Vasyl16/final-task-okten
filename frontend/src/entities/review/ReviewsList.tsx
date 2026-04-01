import { Star, Trash2, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import type { Review } from '@/entities/review/types'
import { useAuthStore } from '@/entities/user/model/auth.store'
import { useDeleteReviewMutation } from '@/shared/api/reviews.api'
import { getErrorMessage } from '@/shared/lib/get-error-message'
import { Button } from '@/shared/ui/button'
import { LoadingSpinner } from '@/shared/ui/loading-spinner'

type ReviewsListProps = {
  institutionId: string
  reviews: Review[]
  isLoading?: boolean
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

export function ReviewsList({
  institutionId,
  reviews,
  isLoading = false,
}: ReviewsListProps) {
  const currentUser = useAuthStore((state) => state.user)
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation()

  async function handleDelete(reviewId: string) {
    try {
      await deleteReview({ reviewId, institutionId }).unwrap()
      toast.success('Відгук видалено')
    } catch (error) {
      toast.error('Помилка видалення відгуку', {
        description: getErrorMessage(error, 'Не вдалося видалити відгук.'),
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-2xl border bg-card p-5">
            <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
            <div className="mt-3 h-4 w-1/5 animate-pulse rounded bg-muted" />
            <div className="mt-4 h-16 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-center">
        <p className="text-muted-foreground">Ще немає жодного відгуку.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const isOwnReview = currentUser?.id === review.user.id

        return (
          <article key={review.id} className="rounded-2xl border bg-card p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{review.user.name}</p>
                  {review.user.isCritic ? (
                    <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800">
                      Критик ⭐
                    </span>
                  ) : null}
                  <span className="text-sm text-muted-foreground">
                    {formatDate(review.createdAt)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm font-medium">
                    <Star className="size-4 fill-yellow-400 text-yellow-400" />
                    {review.rating}
                  </div>
                  {review.averageCheck != null ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm font-medium">
                      <Wallet className="size-4" />
                      {review.averageCheck} ₴
                    </span>
                  ) : null}
                </div>
              </div>

              {isOwnReview ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isDeleting}
                  onClick={() => void handleDelete(review.id)}
                >
                  {isDeleting ? (
                    <>
                      <LoadingSpinner />
                      Видаляємо...
                    </>
                  ) : (
                    <>
                      <Trash2 className="size-4" />
                      Видалити
                    </>
                  )}
                </Button>
              ) : null}
            </div>

            <p className="mt-4 whitespace-pre-line text-muted-foreground">
              {review.comment?.trim() || 'Користувач не залишив текстового коментаря.'}
            </p>
          </article>
        )
      })}
    </div>
  )
}
