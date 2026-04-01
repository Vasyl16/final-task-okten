import { CalendarDays, ExternalLink, Trash2, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Piyachok } from '@/entities/piyachok/types'
import { Button } from '@/shared/ui/button'
import { LoadingSpinner } from '@/shared/ui/loading-spinner'

type PiyachokCardProps = {
  item: Piyachok
  isOwn?: boolean
  isDeleting?: boolean
  onDelete?: () => void
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function PiyachokCard({
  item,
  isOwn = false,
  isDeleting = false,
  onDelete,
}: PiyachokCardProps) {
  return (
    <article className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-4" />
              {formatDate(item.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1">
              <UserRound className="size-4" />
              {item.user?.name || 'Анонім'}
            </span>
            {item.institutionName ? (
              <span className="flex flex-wrap items-center gap-2">
                {item.institutionId ? (
                  <Link
                    className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted/80"
                    to={`/institutions/${item.institutionId}`}
                  >
                    {item.institutionName}
                  </Link>
                ) : (
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                    {item.institutionName}
                  </span>
                )}
              </span>
            ) : null}
          </div>

          <p className="line-clamp-4 whitespace-pre-line text-foreground md:line-clamp-6">
            {item.message}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>Дата зустрічі: {formatDate(item.date)}</span>
            {item.peopleCount ? <span>Людей: {item.peopleCount}</span> : null}
            {item.budget !== null && item.budget !== undefined ? (
              <span>Бюджет: {item.budget}</span>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to={`/piyachok/${item.id}`}>
                <ExternalLink className="size-4" />
                Відкрити повністю
              </Link>
            </Button>
          </div>
        </div>

        {isOwn && onDelete ? (
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
