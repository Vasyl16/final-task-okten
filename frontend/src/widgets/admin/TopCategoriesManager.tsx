import { type FormEvent, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useGetInstitutionsQuery } from '@/shared/api/institutions/get-all.query'
import {
  useAddInstitutionToTopCategoryMutation,
  useCreateTopCategoryMutation,
  useDeleteTopCategoryMutation,
  useGetAdminTopCategoriesQuery,
  useRemoveInstitutionFromTopCategoryMutation,
  useUpdateTopCategoryMutation,
} from '@/shared/api/admin.api'
import { getErrorMessage } from '@/shared/lib/get-error-message'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { LoadingSpinner } from '@/shared/ui/loading-spinner'

export function TopCategoriesManager() {
  const { data: categoriesData, isLoading, error, refetch } = useGetAdminTopCategoriesQuery({
    page: 1,
    limit: 100,
  })
  const categories = categoriesData?.items ?? []
  const { data: institutionsData } = useGetInstitutionsQuery({
    page: 1,
    limit: 50,
    sort: 'rating',
  })
  const institutions = institutionsData?.items ?? []
  const [createTopCategory, { isLoading: isCreating }] = useCreateTopCategoryMutation()
  const [updateTopCategory, { isLoading: isUpdating }] = useUpdateTopCategoryMutation()
  const [deleteTopCategory, { isLoading: isDeleting }] = useDeleteTopCategoryMutation()
  const [addInstitutionToTopCategory, { isLoading: isAdding }] =
    useAddInstitutionToTopCategoryMutation()
  const [removeInstitutionFromTopCategory, { isLoading: isRemoving }] =
    useRemoveInstitutionFromTopCategoryMutation()

  const [newCategoryName, setNewCategoryName] = useState('')
  const [nameDrafts, setNameDrafts] = useState<Record<string, string>>({})
  const [selectedInstitutionByCategory, setSelectedInstitutionByCategory] = useState<
    Record<string, string>
  >({})
  const [busyCategoryId, setBusyCategoryId] = useState<string | null>(null)

  const availableInstitutionsByCategory = useMemo(() => {
    return categories.reduce<Record<string, typeof institutions>>((accumulator, category) => {
      const includedIds = new Set(category.institutions.map((institution) => institution.id))

      accumulator[category.id] = institutions.filter(
        (institution) => !includedIds.has(institution.id),
      )

      return accumulator
    }, {})
  }, [categories, institutions])

  async function handleCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const name = newCategoryName.trim()
    if (!name) {
      return
    }

    try {
      await createTopCategory({ name }).unwrap()
      setNewCategoryName('')
      toast.success('Категорію створено')
    } catch (createError) {
      toast.error('Помилка створення', {
        description: getErrorMessage(createError, 'Не вдалося створити категорію.'),
      })
    }
  }

  async function handleRenameCategory(id: string) {
    const name = (nameDrafts[id] ?? '').trim()

    if (!name) {
      return
    }

    try {
      setBusyCategoryId(id)
      await updateTopCategory({ id, name }).unwrap()
      toast.success('Назву категорії оновлено')
    } catch (updateError) {
      toast.error('Помилка оновлення', {
        description: getErrorMessage(updateError, 'Не вдалося оновити категорію.'),
      })
    } finally {
      setBusyCategoryId(null)
    }
  }

  async function handleDeleteCategory(id: string) {
    const confirmed = window.confirm('Видалити цю топ-категорію?')

    if (!confirmed) {
      return
    }

    try {
      setBusyCategoryId(id)
      await deleteTopCategory(id).unwrap()
      toast.success('Категорію видалено')
    } catch (deleteError) {
      toast.error('Помилка видалення', {
        description: getErrorMessage(deleteError, 'Не вдалося видалити категорію.'),
      })
    } finally {
      setBusyCategoryId(null)
    }
  }

  async function handleAddInstitution(categoryId: string) {
    const institutionId = selectedInstitutionByCategory[categoryId]

    if (!institutionId) {
      return
    }

    try {
      setBusyCategoryId(categoryId)
      await addInstitutionToTopCategory({ categoryId, institutionId }).unwrap()
      setSelectedInstitutionByCategory((current) => ({
        ...current,
        [categoryId]: '',
      }))
      toast.success('Заклад додано до категорії')
    } catch (actionError) {
      toast.error('Помилка додавання', {
        description: getErrorMessage(actionError, 'Не вдалося додати заклад до категорії.'),
      })
    } finally {
      setBusyCategoryId(null)
    }
  }

  async function handleRemoveInstitution(categoryId: string, institutionId: string) {
    try {
      setBusyCategoryId(categoryId)
      await removeInstitutionFromTopCategory({ categoryId, institutionId }).unwrap()
      toast.success('Заклад видалено з категорії')
    } catch (actionError) {
      toast.error('Помилка видалення', {
        description: getErrorMessage(actionError, 'Не вдалося видалити заклад з категорії.'),
      })
    } finally {
      setBusyCategoryId(null)
    }
  }

  return (
    <section className="space-y-4 rounded-3xl border bg-card p-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold">Топ-категорії</h2>
        <p className="text-sm text-muted-foreground">
          Створення категорій, перейменування та керування прив'язаними закладами.
        </p>
      </div>

      <form className="flex flex-col gap-3 md:flex-row" onSubmit={handleCreateCategory}>
        <Input
          value={newCategoryName}
          onChange={(event) => setNewCategoryName(event.target.value)}
          placeholder="Назва нової категорії"
        />
        <Button type="submit" disabled={isCreating || !newCategoryName.trim()}>
          {isCreating ? (
            <>
              <LoadingSpinner />
              Створюємо...
            </>
          ) : (
            'Створити категорію'
          )}
        </Button>
      </form>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-5">
          <p className="text-sm text-destructive">Не вдалося завантажити топ-категорії.</p>
          <Button className="mt-4" variant="outline" onClick={() => void refetch()}>
            Спробувати ще раз
          </Button>
        </div>
      ) : null}

      {!isLoading && !error && categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
          Топ-категорій поки немає
        </div>
      ) : null}

      {!isLoading && !error && categories.length > 0 ? (
        <div className="space-y-4">
          {categories.map((category) => {
            const currentDraft = nameDrafts[category.id] ?? category.name
            const availableInstitutions = availableInstitutionsByCategory[category.id] ?? []
            const selectedInstitutionId = selectedInstitutionByCategory[category.id] ?? ''
            const isBusy =
              busyCategoryId === category.id &&
              (isUpdating || isDeleting || isAdding || isRemoving)

            return (
              <article key={category.id} className="space-y-4 rounded-2xl border p-5">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex flex-1 flex-col gap-3 md:flex-row">
                    <Input
                      value={currentDraft}
                      onChange={(event) =>
                        setNameDrafts((current) => ({
                          ...current,
                          [category.id]: event.target.value,
                        }))
                      }
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        disabled={isBusy || !currentDraft.trim()}
                        onClick={() => void handleRenameCategory(category.id)}
                      >
                        Зберегти назву
                      </Button>
                      <Button
                        variant="outline"
                        disabled={isBusy}
                        onClick={() => void handleDeleteCategory(category.id)}
                      >
                        Видалити
                      </Button>
                    </div>
                  </div>

                  {isBusy ? <LoadingSpinner className="text-muted-foreground" /> : null}
                </div>

                <div className="flex flex-col gap-3 md:flex-row">
                  <select
                    className="h-10 rounded-md border bg-background px-3"
                    value={selectedInstitutionId}
                    disabled={isBusy || availableInstitutions.length === 0}
                    onChange={(event) =>
                      setSelectedInstitutionByCategory((current) => ({
                        ...current,
                        [category.id]: event.target.value,
                      }))
                    }
                  >
                    <option value="">Оберіть заклад</option>
                    {availableInstitutions.map((institution) => (
                      <option key={institution.id} value={institution.id}>
                        {institution.name}
                      </option>
                    ))}
                  </select>

                  <Button
                    disabled={isBusy || !selectedInstitutionId}
                    onClick={() => void handleAddInstitution(category.id)}
                  >
                    Додати заклад
                  </Button>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Заклади в категорії</h3>

                  {category.institutions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      У цій категорії ще немає закладів.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {category.institutions.map((institution) => (
                        <div
                          key={institution.id}
                          className="flex items-center gap-2 rounded-full border px-3 py-2 text-sm"
                        >
                          <span>{institution.name}</span>
                          <span className="text-muted-foreground">({institution.status})</span>
                          <button
                            type="button"
                            className="text-muted-foreground transition-colors hover:text-foreground"
                            disabled={isBusy}
                            onClick={() =>
                              void handleRemoveInstitution(category.id, institution.id)
                            }
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}
