import { type FormEvent, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import type { Review } from '@/entities/review/types'
import { useAuthStore } from '@/entities/user/model/auth.store'
import { useCreateReviewMutation } from '@/shared/api/reviews.api'
import { getErrorMessage } from '@/shared/lib/get-error-message'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { LoadingSpinner } from '@/shared/ui/loading-spinner'

type AddReviewFormProps = {
  institutionId: string
  reviews: Review[]
}

export function AddReviewForm({ institutionId, reviews }: AddReviewFormProps) {
  const currentUser = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const location = useLocation()
  const [createReview, { isLoading }] = useCreateReviewMutation()
  const [rating, setRating] = useState('5')
  const [comment, setComment] = useState('')
  const [budget, setBudget] = useState('')
  const [error, setError] = useState<string | null>(null)

  const hasOwnReview = useMemo(
    () => reviews.some((review) => review.user.id === currentUser?.id),
    [currentUser?.id, reviews],
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    let averageCheck: number | undefined
    const budgetTrimmed = budget.trim()
    if (budgetTrimmed !== '') {
      const parsed = Number(budgetTrimmed.replace(',', '.'))
      if (Number.isNaN(parsed) || parsed < 0) {
        setError('Бюджет вкажіть числом від 0 або залиште поле порожнім.')
        return
      }
      averageCheck = parsed
    }

    try {
      await createReview({
        institutionId,
        rating: Number(rating),
        comment: comment.trim(),
        averageCheck,
      }).unwrap()

      setComment('')
      setRating('5')
      setBudget('')
      setError(null)
      toast.success('Відгук успішно додано')
    } catch (submitError) {
      const message = getErrorMessage(submitError, 'Не вдалося додати відгук.')

      setError(message)
      toast.error('Помилка додавання відгуку', {
        description: message,
      })
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <h3 className="text-lg font-semibold">Залишити відгук</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Щоб залишити відгук, потрібно{' '}
          <Link
            to="/login"
            state={{ from: location }}
            className="font-medium text-foreground underline"
          >
            увійти в акаунт
          </Link>
          .
        </p>
      </div>
    )
  }

  if (hasOwnReview) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <h3 className="text-lg font-semibold">Залишити відгук</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Ви вже залишили відгук для цього закладу. Один користувач може мати лише
          один відгук.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Залишити відгук</h3>
        <p className="text-sm text-muted-foreground">
          Ваша оцінка вплине на загальний рейтинг закладу.
        </p>
      </div>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="rating">
            Оцінка
          </label>
          <select
            id="rating"
            className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            value={rating}
            onChange={(event) => setRating(event.target.value)}
          >
            <option value="5">5 - Відмінно</option>
            <option value="4">4 - Добре</option>
            <option value="3">3 - Нормально</option>
            <option value="2">2 - Слабо</option>
            <option value="1">1 - Погано</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="budget">
            Бюджет (середній чек), ₴
          </label>
          <Input
            id="budget"
            type="text"
            inputMode="decimal"
            placeholder="Необовʼязково, наприклад 500"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Орієнтовна сума, яку витратили на відвідування (на одну особу або чек — як вам зручніше
            пояснити).
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="comment">
            Коментар
          </label>
          <textarea
            id="comment"
            rows={5}
            className="flex w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Поділіться враженнями про заклад"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
        </div>

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

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <LoadingSpinner />
              Публікуємо відгук...
            </>
          ) : (
            'Опублікувати відгук'
          )}
        </Button>
      </form>
    </div>
  )
}
