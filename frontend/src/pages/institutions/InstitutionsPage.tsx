import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { InstitutionCard } from '@/entities/institution/InstitutionCard'
import { useAuthStore } from '@/entities/user/model/auth.store'
import type { InstitutionListParams } from '@/entities/institution/types'
import { useGetFavoriteInstitutionIdsQuery } from '@/shared/api/favorites/get-favorites.query'
import { useGetInstitutionsQuery } from '@/shared/api/institutions/get-all.query'
import { useInstitutionsListingParams } from '@/shared/lib/listing-search-params'
import { useDebouncedValue } from '@/shared/lib/use-debounced-value'
import { useClampPage } from '@/shared/lib/use-search-param-page'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Pagination } from '@/shared/ui/pagination'

const PAGE_SIZE = 12

export function InstitutionsPage() {
  const user = useAuthStore((state) => state.user)
  const { search, city, sort, page, setPage, setSearch, setCity, setSort } =
    useInstitutionsListingParams()

  const [searchInput, setSearchInput] = useState(search)
  const [cityInput, setCityInput] = useState(city)

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  useEffect(() => {
    setCityInput(city)
  }, [city])

  const debouncedSearch = useDebouncedValue(searchInput)
  const debouncedCity = useDebouncedValue(cityInput)

  useEffect(() => {
    if (debouncedSearch.trim() === search.trim()) {
      return
    }
    setSearch(debouncedSearch)
  }, [debouncedSearch, search, setSearch])

  useEffect(() => {
    if (debouncedCity.trim() === city.trim()) {
      return
    }
    setCity(debouncedCity)
  }, [city, debouncedCity, setCity])

  const requestParams = useMemo(
    () => ({
      search,
      city,
      sort: sort as InstitutionListParams['sort'],
      page,
      limit: PAGE_SIZE,
    }),
    [city, page, search, sort],
  )

  const { data, isLoading, isFetching, error, refetch } =
    useGetInstitutionsQuery(requestParams)
  const { data: favoriteIdsList = [] } = useGetFavoriteInstitutionIdsQuery(undefined, {
    skip: !user,
  })

  const institutions = data?.items ?? []
  const pageCount = data?.pageCount ?? 1

  useClampPage(page, pageCount, setPage)

  const favoriteIds = useMemo(() => new Set(favoriteIdsList), [favoriteIdsList])

  const institutionsWithFavorites = useMemo(
    () =>
      institutions.map((institution) => ({
        ...institution,
        isFavorite: favoriteIds.has(institution.id),
      })),
    [favoriteIds, institutions],
  )

  const errorMessage =
    error && 'status' in error
      ? 'Не вдалося завантажити список закладів.'
      : null

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Заклади</h1>
          <p className="text-muted-foreground">
            Переглядайте заклади, фільтруйте список і додавайте улюблені місця в
            обране.
          </p>
          {isFetching && !isLoading ? (
            <p className="text-sm text-muted-foreground">Оновлюємо список...</p>
          ) : null}
        </div>

        {user?.role === 'USER' ? (
          <Button asChild>
            <Link to="/institutions/new">Додати заклад</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-3 rounded-2xl border bg-card p-4 md:grid-cols-3">
        <Input
          placeholder="Пошук за назвою"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          type="search"
          autoComplete="off"
        />
        <Input
          placeholder="Місто"
          value={cityInput}
          onChange={(event) => setCityInput(event.target.value)}
          type="search"
          autoComplete="off"
        />
        <select
          className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          value={sort}
          onChange={(event) =>
            setSort(event.target.value as 'rating' | 'views')
          }
        >
          <option value="rating">Сортувати за рейтингом</option>
          <option value="views">Сортувати за переглядами</option>
        </select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border bg-card shadow-sm"
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
      ) : null}

      {!isLoading && errorMessage ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-5">
          <p className="text-sm text-destructive">{errorMessage}</p>
          <Button className="mt-4" variant="outline" onClick={() => void refetch()}>
            Спробувати ще раз
          </Button>
        </div>
      ) : null}

      {!isLoading && !errorMessage && institutionsWithFavorites.length === 0 ? (
        <div className="rounded-2xl border bg-card p-8 text-center">
          <h2 className="text-xl font-semibold">Нічого не знайдено</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Спробуйте змінити пошуковий запит, місто або сортування.
          </p>
        </div>
      ) : null}

      {!isLoading && !errorMessage && institutionsWithFavorites.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {institutionsWithFavorites.map((institution) => (
              <InstitutionCard key={institution.id} institution={institution} />
            ))}
          </div>
          <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
        </>
      ) : null}
    </section>
  )
}
