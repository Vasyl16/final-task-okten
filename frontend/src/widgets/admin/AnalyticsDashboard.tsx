import { useEffect, useMemo, useState } from 'react'
import {
  useGetInstitutionAnalyticsByIdQuery,
  useGetInstitutionAnalyticsQuery,
} from '@/shared/api/admin.api'
import { Button } from '@/shared/ui/button'

function formatViewsLabel(count: number) {
  return `${count} переглядів`
}

export function AnalyticsDashboard() {
  const {
    data: institutions = [],
    isLoading,
    error,
    refetch,
  } = useGetInstitutionAnalyticsQuery()
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('')

  useEffect(() => {
    if (!selectedInstitutionId && institutions.length > 0) {
      setSelectedInstitutionId(institutions[0].institutionId)
    }
  }, [institutions, selectedInstitutionId])

  const {
    data: viewsByDay = [],
    isLoading: isDetailsLoading,
    error: detailsError,
  } = useGetInstitutionAnalyticsByIdQuery(selectedInstitutionId, {
    skip: !selectedInstitutionId,
  })

  const maxViews = useMemo(() => {
    return viewsByDay.reduce((currentMax, item) => Math.max(currentMax, item.viewsCount), 0)
  }, [viewsByDay])

  return (
    <section className="space-y-4 rounded-3xl border bg-card p-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold">Аналітика</h2>
        <p className="text-sm text-muted-foreground">
          Загальна кількість переглядів і деталізація по днях для окремого закладу.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
          <div className="h-72 animate-pulse rounded-2xl bg-muted" />
          <div className="h-72 animate-pulse rounded-2xl bg-muted" />
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-5">
          <p className="text-sm text-destructive">Не вдалося завантажити аналітику.</p>
          <Button className="mt-4" variant="outline" onClick={() => void refetch()}>
            Спробувати ще раз
          </Button>
        </div>
      ) : null}

      {!isLoading && !error && institutions.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
          Даних для аналітики поки немає
        </div>
      ) : null}

      {!isLoading && !error && institutions.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
          <div className="rounded-2xl border p-4">
            <h3 className="mb-3 font-medium">Заклади за переглядами</h3>
            <div className="space-y-2">
              {institutions.map((item) => {
                const isActive = item.institutionId === selectedInstitutionId

                return (
                  <button
                    key={item.institutionId}
                    type="button"
                    className={[
                      'w-full rounded-xl border px-4 py-3 text-left transition-colors',
                      isActive ? 'border-primary bg-primary/5' : 'hover:bg-accent',
                    ].join(' ')}
                    onClick={() => setSelectedInstitutionId(item.institutionId)}
                  >
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatViewsLabel(item.viewsCount)}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border p-4">
            <h3 className="mb-3 font-medium">Перегляди по днях</h3>

            {isDetailsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-12 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : null}

            {!isDetailsLoading && detailsError ? (
              <p className="text-sm text-destructive">
                Не вдалося завантажити деталізацію по днях.
              </p>
            ) : null}

            {!isDetailsLoading && !detailsError && viewsByDay.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Для цього закладу ще немає подій перегляду.
              </p>
            ) : null}

            {!isDetailsLoading && !detailsError && viewsByDay.length > 0 ? (
              <div className="space-y-3">
                {viewsByDay.map((item) => {
                  const width = maxViews > 0 ? `${(item.viewsCount / maxViews) * 100}%` : '0%'

                  return (
                    <div key={item.date} className="space-y-1">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span>{item.date}</span>
                        <span className="text-muted-foreground">
                          {formatViewsLabel(item.viewsCount)}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary transition-all"
                          style={{ width }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}
