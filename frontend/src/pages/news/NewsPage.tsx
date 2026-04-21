import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { NewsCard } from '@/entities/news/NewsCard'
import { useGetAllNewsQuery } from '@/shared/api/news.api'
import { useNewsListingParams } from '@/shared/lib/listing-search-params'
import { useDebouncedValue } from '@/shared/lib/use-debounced-value'
import { useClampPage } from '@/shared/lib/use-search-param-page'
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
  const {
    search,
    category,
    sort,
    page,
    setPage,
    setSearch,
    setCategory,
    setSort,
  } = useNewsListingParams()

  const [searchInput, setSearchInput] = useState(search)

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  const debouncedSearch = useDebouncedValue(searchInput)

  useEffect(() => {
    if (debouncedSearch.trim() === search.trim()) {
      return
    }
    setSearch(debouncedSearch)
  }, [debouncedSearch, search, setSearch])

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search,
      sort: sort as 'asc' | 'desc',
      category:
        category === 'GENERAL' ||
        category === 'PROMOTION' ||
        category === 'EVENT'
          ? (category as 'GENERAL' | 'PROMOTION' | 'EVENT')
          : undefined,
    }),
    [category, page, search, sort],
  )

  const { data, isLoading, isError } = useGetAllNewsQuery(queryParams)
  const items = data?.items ?? []
  const resolvedPageCount = data?.pageCount
  const pageCount = resolvedPageCount ?? 1

  useClampPage(page, resolvedPageCount, setPage)

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
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          type="search"
          autoComplete="off"
        />
        <select
          className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={category}
          onChange={(event) => {
            const value = event.target.value
            if (value === '') {
              setCategory('')
            } else {
              setCategory(value as 'GENERAL' | 'PROMOTION' | 'EVENT')
            }
          }}
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
