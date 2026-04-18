import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { authApi } from '@/shared/api/auth.api'
import { getErrorMessage } from '@/shared/lib/get-error-message'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { LoadingSpinner } from '@/shared/ui/loading-spinner'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await authApi.forgotPassword(email.trim().toLowerCase())
      toast.success('Перевірте пошту', {
        description:
          'Якщо обліковий запис з таким email існує, ми надіслали посилання для нового пароля.',
      })
      setEmail('')
    } catch (submitError) {
      toast.error('Не вдалося надіслати запит', {
        description: getErrorMessage(
          submitError,
          'Спробуйте ще раз або зверніться до підтримки.',
        ),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4">
      <div className="w-full rounded-xl border bg-card p-8 shadow-sm">
        <div className="mb-6 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Забули пароль</h1>
          <p className="text-sm text-muted-foreground">
            Вкажіть email акаунта — надішлемо посилання для встановлення нового пароля (діє 1
            годину).
          </p>
        </div>

        <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="forgot-email">
              Email
            </label>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <LoadingSpinner />
                Надсилаємо…
              </span>
            ) : (
              'Надіслати посилання'
            )}
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          <Link className="font-medium text-foreground hover:underline" to="/login">
            Повернутися до входу
          </Link>
        </p>
      </div>
    </section>
  )
}
