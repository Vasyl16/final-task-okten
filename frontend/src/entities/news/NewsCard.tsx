import { CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { News } from './types'

type NewsCardProps = {
  item: News
  isLatest?: boolean
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

function getPreview(content: string) {
  if (content.length <= 150) {
    return content
  }

  return `${content.slice(0, 150).trim()}...`
}

export function NewsCard({ item, isLatest = false }: NewsCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      <Link className="block" to={`/news/${item.id}`}>
        <div className="relative aspect-16/10 overflow-hidden bg-muted">
          {item.image ? (
            <img
              src={item.image}
              alt={item.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-zinc-100 to-zinc-200 text-sm text-muted-foreground">
              Зображення новини
            </div>
          )}

          {isLatest ? (
            <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
              Остання новина
            </span>
          ) : null}
        </div>

        <div className="space-y-3 p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="size-4" />
            <span>{formatDate(item.createdAt)}</span>
          </div>

          <div className="space-y-2">
            <h3 className="line-clamp-2 text-xl font-semibold">{item.title}</h3>
            <p className="line-clamp-4 text-sm text-muted-foreground">
              {getPreview(item.content)}
            </p>
          </div>
        </div>
      </Link>
    </article>
  )
}
