import { useMemo } from 'react'
import { useGetFavoriteInstitutionIdsQuery } from '@/shared/api/favorites/get-favorites.query'
import { useGetTopCategoriesQuery } from '@/shared/api/top.api'
import { useClampPage, useSearchParamPage } from '@/shared/lib/use-search-param-page'
import { Button } from '@/shared/ui/button'
import { Pagination } from '@/shared/ui/pagination'
import { TopCategoryBlock } from '@/widgets/top/TopCategoryBlock'

const PAGE_SIZE = 12
const INSTITUTIONS_PER_CATEGORY = 50

export function TopPage() {
  const [page, setPage] = useSearchParamPage()

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useGetTopCategoriesQuery({
    page,
    limit: PAGE_SIZE,
    institutionsLimit: INSTITUTIONS_PER_CATEGORY,
  })
  const categories = data?.items ?? []
  const resolvedPageCount = data?.pageCount
  const pageCount = resolvedPageCount ?? 1

  useClampPage(page, resolvedPageCount, setPage)

  const { data: favoriteIdsList = [] } = useGetFavoriteInstitutionIdsQuery()

  const favoriteIds = useMemo(() => new Set(favoriteIdsList), [favoriteIdsList])

  if (isLoading) {
    return (
      <section className="space-y-8">
        <div className="space-y-2">
          <div className="h-10 w-64 animate-pulse rounded bg-muted" />
          <div className="h-4 w-96 animate-pulse rounded bg-muted" />
        </div>

        {Array.from({ length: 3 }).map((_, categoryIndex) => (
          <div key={categoryIndex} className="space-y-4">
            <div className="h-8 w-56 animate-pulse rounded bg-muted" />
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 3 }).map((__, cardIndex) => (
                <div
                  key={cardIndex}
                  className="min-w-[280px] flex-1 overflow-hidden rounded-2xl border bg-card"
                >
                  <div className="aspect-[16/10] animate-pulse bg-muted" />
                  <div className="space-y-3 p-5">
                    <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-destructive/20 bg-destructive/10 p-5">
        <p className="text-sm text-destructive">
          Не вдалося завантажити топ-категорії.
        </p>
        <Button className="mt-4" variant="outline" onClick={() => void refetch()}>
          Спробувати ще раз
        </Button>
      </section>
    )
  }

  if (categories.length === 0) {
    return (
      <section className="rounded-2xl border bg-card p-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Топ категорії</h1>
        <p className="mt-3 text-muted-foreground">
          Поки що немає жодної топ-категорії для відображення.
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Топ категорії</h1>
        <p className="text-muted-foreground">
          Добірки найкращих закладів за категоріями, сформовані адміністраторами.
        </p>
      </div>

      {categories.map((category) => (
        <TopCategoryBlock
          key={category.id}
          category={category}
          favoriteIds={favoriteIds}
        />
      ))}

      <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
    </section>
  )
}
