import { type FormEvent, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { authApi } from '@/shared/api/auth.api'
import { getErrorMessage } from '@/shared/lib/get-error-message'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { LoadingSpinner } from '@/shared/ui/loading-spinner'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const tokenFromUrl = useMemo(() => searchParams.get('token')?.trim() ?? '', [searchParams])

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const hasToken = tokenFromUrl.length >= 32

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!hasToken) {
      const message = 'Посилання не містить токену. Відкрийте посилання з листа.'
      setError(message)
      toast.error(message)
      return
    }

    if (password.length < 8) {
      const message = 'Пароль має містити щонайменше 8 символів.'
      setError(message)
      toast.error(message)
      return
    }

    if (password !== passwordConfirm) {
      const message = 'Паролі не збігаються.'
      setError(message)
      toast.error(message)
      return
    }

    setIsSubmitting(true)

    try {
      await authApi.resetPassword({
        token: tokenFromUrl,
        password,
        passwordConfirm,
      })
      toast.success('Пароль змінено', {
        description: 'Тепер можете увійти з новим паролем.',
      })
      navigate('/login', { replace: true })
    } catch (submitError) {
      const message = getErrorMessage(
        submitError,
        'Не вдалося оновити пароль. Спробуйте запросити нове посилання.',
      )
      setError(message)
      toast.error('Помилка', { description: message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4">
      <div className="w-full rounded-xl border bg-card p-8 shadow-sm">
        <div className="mb-6 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Новий пароль</h1>
          <p className="text-sm text-muted-foreground">
            Введіть новий пароль для акаунта. Після збереження увійдіть з ним на сторінці входу.
          </p>
        </div>

        {!hasToken ? (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Посилання недійсне або неповне. Перейдіть за посиланням з листа або{' '}
            <Link className="font-medium underline" to="/forgot-password">
              запросіть нове
            </Link>
            .
          </div>
        ) : null}

        <form className="mt-4 space-y-4" onSubmit={(e) => void handleSubmit(e)}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="reset-password">
              Новий пароль
            </label>
            <Input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              placeholder="Щонайменше 8 символів"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
              disabled={!hasToken}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="reset-password-confirm">
              Повторіть пароль
            </label>
            <Input
              id="reset-password-confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Введіть пароль ще раз"
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              minLength={8}
              required
              disabled={!hasToken}
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

          <Button className="w-full" type="submit" disabled={isSubmitting || !hasToken}>
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <LoadingSpinner />
                Зберігаємо…
              </span>
            ) : (
              'Зберегти новий пароль'
            )}
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          <Link className="font-medium text-foreground hover:underline" to="/login">
            На сторінку входу
          </Link>
        </p>
      </div>
    </section>
  )
}
