import { CalendarDays, MessageSquare, Star, Trash2, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Review } from './types'
import { Button } from '@/shared/ui/button'
import { LoadingSpinner } from '@/shared/ui/loading-spinner'

type ReviewCardProps = {
  review: Review
  isDeleting?: boolean
  onDelete?: () => void
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

export function ReviewCard({
  review,
  isDeleting = false,
  onDelete,
}: ReviewCardProps) {
  return (
    <article className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
              {review.rating}
            </span>
            {review.averageCheck != null ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
                <Wallet className="size-3.5" />
                {review.averageCheck} ₴
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-4" />
              {formatDate(review.createdAt)}
            </span>
            {review.institution ? (
              <Link
                className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                to={`/institutions/${review.institution.id}`}
              >
                {review.institution.name}
              </Link>
            ) : null}
          </div>

          <div className="space-y-2">
            <p className="font-medium">{review.user.name}</p>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MessageSquare className="mt-0.5 size-4 shrink-0" />
              <p className="whitespace-pre-line">
                {review.comment?.trim() || 'Коментар відсутній.'}
              </p>
            </div>
          </div>
        </div>

        {onDelete ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isDeleting}
            onClick={onDelete}
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
    </article>
  )
}
