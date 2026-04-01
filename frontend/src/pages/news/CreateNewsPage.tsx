import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { apiStore } from '@/shared/api/rtk/api-store'
import { baseApi } from '@/shared/api/rtk/base-api'
import { useGetMyInstitutionsQuery } from '@/shared/api/institutions/get-mine.query'
import { createNews, type CreateNewsPayload } from '@/shared/api/news.api'
import { getErrorMessage } from '@/shared/lib/get-error-message'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { LoadingSpinner } from '@/shared/ui/loading-spinner'

function usePreview(file: File | null) {
  const previewUrl = useMemo(() => {
    if (!file) {
      return null
    }

    return URL.createObjectURL(file)
  }, [file])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  return previewUrl
}

export function CreateNewsPage() {
  const navigate = useNavigate()
  const { data: institutions = [], isLoading: isInstitutionsLoading } =
    useGetMyInstitutionsQuery()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] =
    useState<CreateNewsPayload['category']>('GENERAL')
  const [institutionId, setInstitutionId] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const previewUrl = usePreview(image)

  useEffect(() => {
    if (!institutionId && institutions.length > 0) {
      setInstitutionId(institutions[0].id)
    }
  }, [institutionId, institutions])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setError(null)
      await createNews({
        title,
        content,
        category,
        institutionId,
        image,
      })
      apiStore.dispatch(
        baseApi.util.invalidateTags([{ type: 'NewsList', id: 'LIST' }]),
      )
      toast.success('Новину створено')
      navigate('/news', { replace: true })
    } catch (submitError) {
      const message = getErrorMessage(
        submitError,
        'Не вдалося створити новину.',
      )
      setError(message)
      toast.error('Помилка створення новини', {
        description: message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <Link className="text-sm text-muted-foreground hover:text-foreground" to="/news">
          Назад до новин
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Створити новину</h1>
        <p className="text-muted-foreground">
          Додайте заголовок, текст та за потреби завантажте зображення в AWS S3.
        </p>
      </div>

      {isInstitutionsLoading ? (
        <div className="rounded-2xl border bg-card p-6 text-muted-foreground">
          Завантажуємо ваші заклади...
        </div>
      ) : null}

      {!isInstitutionsLoading && institutions.length === 0 ? (
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="text-xl font-semibold">Немає доступних закладів</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Спершу створіть власний заклад, після цього ви зможете публікувати
            новини.
          </p>
          <Button asChild className="mt-4">
            <Link to="/institutions/new">Створити заклад</Link>
          </Button>
        </div>
      ) : null}

      {!isInstitutionsLoading && institutions.length > 0 ? (
        <form className="space-y-5 rounded-3xl border bg-card p-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="institutionId">
              Заклад
            </label>
            <select
              id="institutionId"
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
              value={institutionId}
              onChange={(event) => setInstitutionId(event.target.value)}
              required
            >
              <option value="">Оберіть заклад</option>
              {institutions.map((institution) => (
                <option key={institution.id} value={institution.id}>
                  {institution.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="title">
                Заголовок
              </label>
              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="category">
                Категорія
              </label>
              <select
                id="category"
                className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as CreateNewsPayload['category'])
                }
              >
                <option value="GENERAL">GENERAL</option>
                <option value="PROMOTION">PROMOTION</option>
                <option value="EVENT">EVENT</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="content">
              Контент
            </label>
            <textarea
              id="content"
              rows={8}
              className="flex w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="image">
              Зображення
            </label>
            <Input
              id="image"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(event) => setImage(event.target.files?.[0] ?? null)}
            />
          </div>

          {previewUrl ? (
            <div className="overflow-hidden rounded-2xl border bg-muted">
              <img
                src={previewUrl}
                alt="Попередній перегляд новини"
                className="aspect-video h-full w-full object-cover"
              />
            </div>
          ) : null}

          <div aria-live="polite" className="min-h-11">
            <p
              className={[
                'rounded-md border px-3 py-2 text-sm transition-opacity',
                error
                  ? 'visible border-destructive/20 bg-destructive/10 text-destructive opacity-100'
                  : 'invisible opacity-0',
              ].join(' ')}
            >
              {error ?? '\u00A0'}
            </p>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoadingSpinner />
                Публікуємо...
              </>
            ) : (
              'Створити новину'
            )}
          </Button>
        </form>
      ) : null}
    </section>
  )
}
