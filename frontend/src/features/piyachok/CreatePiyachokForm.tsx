import { type FormEvent, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthStore } from '@/entities/user/model/auth.store'
import { useGetInstitutionsQuery } from '@/shared/api/institutions/get-all.query'
import { useCreatePiyachokMutation } from '@/shared/api/piyachok.api'
import { getErrorMessage } from '@/shared/lib/get-error-message'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { LoadingSpinner } from '@/shared/ui/loading-spinner'

function getDefaultFutureDate() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  date.setHours(19, 0, 0, 0)

  return date.toISOString().slice(0, 16)
}

export function CreatePiyachokForm() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const location = useLocation()
  const { data: institutionsData, isLoading: isInstitutionsLoading } =
    useGetInstitutionsQuery({ page: 1, limit: 50, sort: 'rating' })
  const institutions = institutionsData?.items ?? []
  const [createPiyachok, { isLoading }] = useCreatePiyachokMutation()
  const [institutionId, setInstitutionId] = useState('')
  const [date, setDate] = useState(getDefaultFutureDate())
  const [peopleCount, setPeopleCount] = useState('1')
  const [budget, setBudget] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      await createPiyachok({
        institutionId,
        date: new Date(date).toISOString(),
        peopleCount: Number(peopleCount),
        budget: budget ? Number(budget) : undefined,
        message: message.trim(),
      }).unwrap()

      setMessage('')
      setPeopleCount('1')
      setBudget('')
      setDate(getDefaultFutureDate())
      setInstitutionId('')
      setError(null)
      toast.success('Запит створено')
    } catch (submitError) {
      const messageText = getErrorMessage(
        submitError,
        'Не вдалося створити запит.',
      )

      setError(messageText)
      toast.error('Помилка створення запиту', {
        description: messageText,
      })
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="text-xl font-semibold">Створити запит</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          <Link
            to="/login"
            state={{ from: location }}
            className="font-medium text-foreground underline"
          >
            Увійдіть
          </Link>{' '}
          щоб створити запит на зустріч.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Новий запит на зустріч</h2>
        <p className="text-sm text-muted-foreground">
          Напишіть повідомлення і виберіть мінімальні деталі для створення запиту.
        </p>
      </div>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="institutionId">
            Заклад
          </label>
          <select
            id="institutionId"
            className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={institutionId}
            onChange={(event) => setInstitutionId(event.target.value)}
            disabled={isInstitutionsLoading}
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

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="date">
              Дата
            </label>
            <Input
              id="date"
              type="datetime-local"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="peopleCount">
              Кількість людей
            </label>
            <Input
              id="peopleCount"
              type="number"
              min="1"
              value={peopleCount}
              onChange={(event) => setPeopleCount(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="budget">
              Бюджет
            </label>
            <Input
              id="budget"
              type="number"
              min="0"
              placeholder="Необов'язково"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="message">
            Повідомлення
          </label>
          <textarea
            id="message"
            rows={5}
            className="flex w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Наприклад: шукаю компанію на вечір п'ятниці"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            required
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

        <Button type="submit" disabled={isLoading || isInstitutionsLoading}>
          {isLoading ? (
            <>
              <LoadingSpinner />
              Створюємо...
            </>
          ) : (
            'Створити piyachok'
          )}
        </Button>
      </form>
    </div>
  )
}
