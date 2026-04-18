import { type FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthStore } from '@/entities/user/model/auth.store'
import { GoogleSignInButton } from '@/features/auth/GoogleSignInButton'
import { getErrorMessage } from '@/shared/lib/get-error-message'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { LoadingSpinner } from '@/shared/ui/loading-spinner'

type LocationState = {
  from?: {
    pathname?: string
  }
}

export function LoginPage() {
  const login = useAuthStore((state) => state.login)
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle)
  const isSubmitting = useAuthStore((state) => state.isSubmitting)
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const redirectTo = (location.state as LocationState | null)?.from?.pathname ?? '/'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      await login({ email, password })
      toast.success('Вхід успішний', {
        description: 'Ви успішно увійшли в акаунт.',
      })
      navigate(redirectTo, { replace: true })
    } catch (submitError) {
      const message = getErrorMessage(submitError, 'Не вдалося виконати вхід.')

      setError(message)
      toast.error('Помилка входу', {
        description: message,
      })
    }
  }

  return (
    <section className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4">
      <div className="w-full rounded-xl border bg-card p-8 shadow-sm">
        <div className="mb-6 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Вхід</h1>
          <p className="text-sm text-muted-foreground">
            Увійдіть у свій акаунт, щоб переглядати заклади та керувати профілем.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">
              Пароль
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Введіть пароль"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <p className="text-right text-sm">
              <Link
                className="font-medium text-muted-foreground hover:text-foreground hover:underline"
                to="/forgot-password"
              >
                Забули пароль?
              </Link>
            </p>
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

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2 animate-in fade-in-0 zoom-in-95 duration-200">
                <LoadingSpinner />
                Виконуємо вхід...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 animate-in fade-in-0 zoom-in-95 duration-200">
                Увійти
              </span>
            )}
          </Button>
        </form>

        <div className="mt-6 space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">або</span>
            </div>
          </div>
          <GoogleSignInButton
            disabled={isSubmitting}
            onCredential={async (credential) => {
              try {
                await loginWithGoogle({ credential })
                toast.success('Вхід через Google', {
                  description: 'Ви успішно увійшли в акаунт.',
                })
                navigate(redirectTo, { replace: true })
              } catch (submitError) {
                const message = getErrorMessage(
                  submitError,
                  'Не вдалося увійти через Google.',
                )
                toast.error('Помилка Google', {
                  description: message,
                })
              }
            }}
          />
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Ще не маєте акаунта?{' '}
          <Link className="font-medium text-foreground hover:underline" to="/register">
            Зареєструватися
          </Link>
        </p>
      </div>
    </section>
  )
}
