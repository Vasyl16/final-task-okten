import { useState } from 'react'
import { toast } from 'sonner'
import {
  useApproveInstitutionMutation,
  useGetPendingInstitutionsQuery,
  useRejectInstitutionMutation,
} from '@/shared/api/admin.api'
import { getErrorMessage } from '@/shared/lib/get-error-message'
import { Button } from '@/shared/ui/button'
import { LoadingSpinner } from '@/shared/ui/loading-spinner'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

export function InstitutionsModeration() {
  const { data: items = [], isLoading, error, refetch } = useGetPendingInstitutionsQuery()
  const [approveInstitution, { isLoading: isApproving }] = useApproveInstitutionMutation()
  const [rejectInstitution, { isLoading: isRejecting }] = useRejectInstitutionMutation()
  const [busyId, setBusyId] = useState<string | null>(null)

  async function handleApprove(id: string) {
    try {
      setBusyId(id)
      await approveInstitution(id).unwrap()
      toast.success('Заклад схвалено')
    } catch (actionError) {
      toast.error('Помилка модерації', {
        description: getErrorMessage(actionError, 'Не вдалося схвалити заклад.'),
      })
    } finally {
      setBusyId(null)
    }
  }

  async function handleReject(id: string) {
    const confirmed = window.confirm('Відхилити цей заклад?')

    if (!confirmed) {
      return
    }

    try {
      setBusyId(id)
      await rejectInstitution(id).unwrap()
      toast.success('Заклад відхилено')
    } catch (actionError) {
      toast.error('Помилка модерації', {
        description: getErrorMessage(actionError, 'Не вдалося відхилити заклад.'),
      })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="space-y-4 rounded-3xl border bg-card p-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold">Модерація закладів</h2>
        <p className="text-sm text-muted-foreground">
          Перегляд нових закладів зі статусом `PENDING` та рішення щодо публікації.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-5">
          <p className="text-sm text-destructive">
            Не вдалося завантажити заклади на модерацію.
          </p>
          <Button className="mt-4" variant="outline" onClick={() => void refetch()}>
            Спробувати ще раз
          </Button>
        </div>
      ) : null}

      {!isLoading && !error && items.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
          Немає закладів, які очікують модерації
        </div>
      ) : null}

      {!isLoading && !error && items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item) => {
            const isBusy = busyId === item.id && (isApproving || isRejecting)

            return (
              <article key={item.id} className="rounded-2xl border p-5">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Додано: {formatDate(item.createdAt)}
                      </p>
                    </div>

                    <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                      <p>Місто: {item.city?.trim() || 'Немає в поточному API'}</p>
                      <p>
                        Власник:{' '}
                        {item.owner?.name || item.owner?.email || item.ownerId || 'Невідомо'}
                      </p>
                    </div>

                    {item.description ? (
                      <p className="max-w-3xl text-sm text-foreground/80">{item.description}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Опис не вказано.</p>
                    )}
                  </div>

                  <div className="flex min-w-fit items-center gap-2">
                    {isBusy ? <LoadingSpinner className="text-muted-foreground" /> : null}
                    <Button disabled={isBusy} onClick={() => void handleApprove(item.id)}>
                      Схвалити
                    </Button>
                    <Button
                      variant="outline"
                      disabled={isBusy}
                      onClick={() => void handleReject(item.id)}
                    >
                      Відхилити
                    </Button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}
