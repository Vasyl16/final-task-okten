import { CalendarDays } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useGetNewsByIdQuery } from '@/shared/api/news.api'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

function NewsDetailsSkeleton() {
  return (
    <section className="space-y-6">
      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      <div className="space-y-3">
        <div className="h-10 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
      </div>
      <div className="aspect-video animate-pulse rounded-3xl bg-muted" />
      <div className="space-y-3">
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
        <div className="h-4 w-4/6 animate-pulse rounded bg-muted" />
      </div>
    </section>
  )
}

export function NewsDetailsPage() {
  const { id } = useParams<{ id: string }>()

  if (!id) {
    return <Navigate to="/news" replace />
  }

  const { data, isLoading, isError } = useGetNewsByIdQuery(id)

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <Link className="inline-flex text-sm text-muted-foreground transition-colors hover:text-foreground" to="/news">
        Назад до всіх новин
      </Link>

      {isLoading ? <NewsDetailsSkeleton /> : null}

      {!isLoading && isError ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          Не вдалося завантажити новину або її не знайдено.
        </div>
      ) : null}

      {!isLoading && !isError && data ? (
        <article className="space-y-6">
          <header className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight">{data.title}</h1>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="size-4" />
              <span>{formatDate(data.createdAt)}</span>
            </div>
          </header>

          {data.image ? (
            <div className="overflow-hidden rounded-3xl border bg-muted">
              <img
                src={data.image}
                alt={data.title}
                className="max-h-[520px] w-full object-cover"
              />
            </div>
          ) : null}

          <div className="rounded-3xl border bg-card p-6">
            <p className="whitespace-pre-wrap leading-7 text-foreground/90">
              {data.content}
            </p>
          </div>
        </article>
      ) : null}
    </section>
  )
}
