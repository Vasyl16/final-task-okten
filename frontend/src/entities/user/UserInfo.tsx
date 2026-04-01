import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import type { User } from '@/entities/user/types'
import { useAuthStore } from '@/entities/user/model/auth.store'
import type { ProfileUser } from '@/shared/api/profile.api'
import { updateCurrentUser } from '@/shared/api/profile.api'
import { getErrorMessage } from '@/shared/lib/get-error-message'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { LoadingSpinner } from '@/shared/ui/loading-spinner'

type UserInfoProps = {
  user: ProfileUser
  onUpdated?: (user: ProfileUser) => void
}

function roleLabel(role: User['role']) {
  return role === 'ADMIN' ? 'Адміністратор' : 'Користувач'
}

export function UserInfo({ user, onUpdated }: UserInfoProps) {
  const setUser = useAuthStore((state) => state.setUser)
  const [name, setName] = useState(user.name)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setName(user.name)
  }, [user.name])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setError(null)
      const updatedUser = await updateCurrentUser({ name })
      setUser(updatedUser)
      onUpdated?.(updatedUser)
      toast.success("Ім'я оновлено")
    } catch (submitError) {
      const message = getErrorMessage(
        submitError,
        "Не вдалося оновити ім'я.",
      )
      setError(message)
      toast.error('Помилка оновлення профілю', {
        description: message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="space-y-5 rounded-3xl border bg-card p-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold">Мій профіль</h2>
        <p className="text-sm text-muted-foreground">
          Основна інформація про акаунт і швидке редагування імені.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border p-4">
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="mt-1 font-medium">{user.email}</p>
        </div>

        <div className="rounded-2xl border p-4">
          <p className="text-sm text-muted-foreground">Роль</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="font-medium">{roleLabel(user.role)}</span>
            {user.isCritic ? (
              <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800">
                Critic
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="profile-name">
            Ім'я
          </label>
          <Input
            id="profile-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            minLength={2}
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

        <Button type="submit" disabled={isSubmitting || name.trim().length < 2}>
          {isSubmitting ? (
            <>
              <LoadingSpinner />
              Зберігаємо...
            </>
          ) : (
            'Зберегти імʼя'
          )}
        </Button>
      </form>
    </section>
  )
}
