import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthStore } from '@/entities/user/model/auth.store'
import { GoogleSignInButton } from '@/features/auth/GoogleSignInButton'
import { getErrorMessage } from '@/shared/lib/get-error-message'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { LoadingSpinner } from '@/shared/ui/loading-spinner'

export function RegisterPage() {
  const register = useAuthStore((state) => state.register)
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle)
  const isSubmitting = useAuthStore((state) => state.isSubmitting)
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedName = name.trim()

    if (trimmedName.length < 2) {
      const message = "Ім'я має містити щонайменше 2 символи."
      setError(message)
      toast.error('Помилка реєстрації', {
        description: message,
      })
      return
    }

    if (password.length < 8) {
      const message = 'Пароль має містити щонайменше 8 символів.'
      setError(message)
      toast.error('Помилка реєстрації', {
        description: message,
      })
      return
    }

    if (password !== passwordConfirm) {
      const message = 'Паролі не збігаються. Повторіть пароль у другому полі.'
      setError(message)
      toast.error('Помилка реєстрації', {
        description: message,
      })
      return
    }

    try {
      await register({
        name: trimmedName,
        email,
        password,
        passwordConfirm,
      })
      toast.success('Реєстрація успішна', {
        description: 'Акаунт створено, ви вже авторизовані.',
      })
      navigate('/', { replace: true })
    } catch (submitError) {
      const message = getErrorMessage(
        submitError,
        'Не вдалося завершити реєстрацію.',
      )

      setError(message)
      toast.error('Помилка реєстрації', {
        description: message,
      })
    }
  }

  return (
    <section className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4">
      <div className="w-full rounded-xl border bg-card p-8 shadow-sm">
        <div className="mb-6 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Реєстрація</h1>
          <p className="text-sm text-muted-foreground">
            Створіть акаунт, щоб отримати доступ до всіх можливостей застосунку.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="name">
              Ім'я
            </label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Ваше ім'я"
              value={name}
              onChange={(event) => setName(event.target.value)}
              minLength={2}
              required
            />
          </div>

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
              autoComplete="new-password"
              placeholder="Щонайменше 8 символів"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="passwordConfirm">
              Повторіть пароль
            </label>
            <Input
              id="passwordConfirm"
              type="password"
              autoComplete="new-password"
              placeholder="Введіть пароль ще раз"
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              minLength={8}
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

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2 animate-in fade-in-0 zoom-in-95 duration-200">
                <LoadingSpinner />
                Створюємо акаунт...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 animate-in fade-in-0 zoom-in-95 duration-200">
                Зареєструватися
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
                  description: 'Акаунт створено або знайдено, ви авторизовані.',
                })
                navigate('/', { replace: true })
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
          Уже маєте акаунт?{' '}
          <Link className="font-medium text-foreground hover:underline" to="/login">
            Увійти
          </Link>
        </p>
      </div>
    </section>
  )
}
