import { useState } from 'react'
import { toast } from 'sonner'
import { useAuthStore } from '@/entities/user/model/auth.store'
import type { UserRole } from '@/entities/user/types'
import {
  useDeleteAdminUserMutation,
  useGetAdminUsersQuery,
  useUpdateAdminUserMutation,
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

export function UsersTable() {
  const currentUser = useAuthStore((state) => state.user)
  const { data: users = [], isLoading, error, refetch } = useGetAdminUsersQuery()
  const [updateUser, { isLoading: isUpdating }] = useUpdateAdminUserMutation()
  const [deleteUser, { isLoading: isDeleting }] = useDeleteAdminUserMutation()
  const [busyUserId, setBusyUserId] = useState<string | null>(null)

  async function handleRoleChange(id: string, role: UserRole) {
    try {
      setBusyUserId(id)
      await updateUser({ id, role }).unwrap()
      toast.success('Роль користувача оновлено')
    } catch (updateError) {
      toast.error('Помилка оновлення ролі', {
        description: getErrorMessage(updateError, 'Не вдалося оновити роль користувача.'),
      })
    } finally {
      setBusyUserId(null)
    }
  }

  async function handleCriticToggle(id: string, isCritic: boolean) {
    try {
      setBusyUserId(id)
      await updateUser({ id, isCritic }).unwrap()
      toast.success('Статус критика оновлено')
    } catch (updateError) {
      toast.error('Помилка оновлення', {
        description: getErrorMessage(updateError, 'Не вдалося оновити статус критика.'),
      })
    } finally {
      setBusyUserId(null)
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm('Видалити цього користувача? Цю дію не можна скасувати.')

    if (!confirmed) {
      return
    }

    try {
      setBusyUserId(id)
      await deleteUser(id).unwrap()
      toast.success('Користувача видалено')
    } catch (deleteError) {
      toast.error('Помилка видалення', {
        description: getErrorMessage(deleteError, 'Не вдалося видалити користувача.'),
      })
    } finally {
      setBusyUserId(null)
    }
  }

  return (
    <section className="space-y-4 rounded-3xl border bg-card p-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold">Користувачі</h2>
        <p className="text-sm text-muted-foreground">
          Керуйте ролями, статусом критика та видаленням акаунтів.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-5">
          <p className="text-sm text-destructive">Не вдалося завантажити список користувачів.</p>
          <Button className="mt-4" variant="outline" onClick={() => void refetch()}>
            Спробувати ще раз
          </Button>
        </div>
      ) : null}

      {!isLoading && !error && users.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
          Користувачів поки немає
        </div>
      ) : null}

      {!isLoading && !error && users.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr className="border-b">
                <th className="px-3 py-3 font-medium">Ім'я</th>
                <th className="px-3 py-3 font-medium">Email</th>
                <th className="px-3 py-3 font-medium">Роль</th>
                <th className="px-3 py-3 font-medium">Критик</th>
                <th className="px-3 py-3 font-medium">Створено</th>
                <th className="px-3 py-3 font-medium text-right">Дії</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isCurrentUser = currentUser?.id === user.id
                const isBusy = busyUserId === user.id && (isUpdating || isDeleting)

                return (
                  <tr key={user.id} className="border-b last:border-0">
                    <td className="px-3 py-4 font-medium">{user.name}</td>
                    <td className="px-3 py-4 text-muted-foreground">{user.email}</td>
                    <td className="px-3 py-4">
                      <select
                        className="h-10 rounded-md border bg-background px-3"
                        value={user.role}
                        disabled={isBusy}
                        onChange={(event) =>
                          void handleRoleChange(user.id, event.target.value as UserRole)
                        }
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-3 py-4">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={user.isCritic}
                          disabled={isBusy}
                          onChange={(event) =>
                            void handleCriticToggle(user.id, event.target.checked)
                          }
                        />
                        <span>{user.isCritic ? 'Так' : 'Ні'}</span>
                      </label>
                    </td>
                    <td className="px-3 py-4 text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {isBusy ? <LoadingSpinner className="text-muted-foreground" /> : null}
                        <Button
                          variant="outline"
                          disabled={isBusy || isCurrentUser}
                          onClick={() => void handleDelete(user.id)}
                        >
                          {isCurrentUser ? 'Поточний адмін' : 'Видалити'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}
