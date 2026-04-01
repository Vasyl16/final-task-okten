import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { NewsCard } from '@/entities/news/NewsCard'
import { useGetAllNewsQuery } from '@/shared/api/news.api'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Pagination } from '@/shared/ui/pagination'

const PAGE_SIZE = 12

function NewsCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="aspect-16/10 animate-pulse bg-muted" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
        <div className="space-y-2">
          <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-11/12 animate-pulse rounded bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}

export function NewsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'asc' | 'desc'>('desc')
  const [category, setCategory] = useState<'GENERAL' | 'PROMOTION' | 'EVENT' | ''>('')

  useEffect(() => {
    setPage(1)
  }, [search, sort, category])

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search,
      sort,
      category: category || undefined,
    }),
    [category, page, search, sort],
  )

  const { data, isLoading, isError } = useGetAllNewsQuery(queryParams)
  const items = data?.items ?? []
  const pageCount = data?.pageCount ?? 1

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Новини</h1>
          <p className="text-muted-foreground">
            Останні оновлення, події та важливі новини закладів.
          </p>
        </div>

        <Button asChild>
          <Link to="/news/new">Створити новину</Link>
        </Button>
      </div>

      <div className="grid gap-3 rounded-2xl border bg-card p-4 md:grid-cols-3">
        <Input
          placeholder="Пошук за заголовком"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as typeof category)
          }
        >
          <option value="">Усі категорії</option>
          <option value="GENERAL">Загальні</option>
          <option value="PROMOTION">Акції</option>
          <option value="EVENT">Події</option>
        </select>
        <select
          className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={sort}
          onChange={(event) => setSort(event.target.value as 'asc' | 'desc')}
        >
          <option value="desc">Спочатку новіші</option>
          <option value="asc">Спочатку старіші</option>
        </select>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <NewsCardSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {!isLoading && isError ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          Не вдалося завантажити новини. Спробуйте ще раз трохи пізніше.
        </div>
      ) : null}

      {!isLoading && !isError && items.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
          Новин поки немає
        </div>
      ) : null}

      {!isLoading && !isError && items.length > 0 ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => (
              <NewsCard key={item.id} item={item} isLatest={page === 1 && index === 0} />
            ))}
          </div>
          <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
        </>
      ) : null}
    </section>
  )
}
