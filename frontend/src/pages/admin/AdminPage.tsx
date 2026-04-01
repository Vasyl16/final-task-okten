import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/entities/user/model/auth.store'
import { AnalyticsDashboard } from '@/widgets/admin/AnalyticsDashboard'
import { InstitutionsModeration } from '@/widgets/admin/InstitutionsModeration'
import { TopCategoriesManager } from '@/widgets/admin/TopCategoriesManager'
import { UsersTable } from '@/widgets/admin/UsersTable'
import { cn } from '@/shared/lib/utils'

const tabs = [
  { id: 'users', label: 'Користувачі' },
  { id: 'institutions', label: 'Модерація закладів' },
  { id: 'topCategories', label: 'Топ-категорії' },
  { id: 'analytics', label: 'Аналітика' },
] as const

type AdminTab = (typeof tabs)[number]['id']

export function AdminPage() {
  const user = useAuthStore((state) => state.user)
  const [activeTab, setActiveTab] = useState<AdminTab>('users')

  if (!user) {
    return null
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Адмін-панель</h1>
        <p className="text-muted-foreground">
          Керуйте користувачами, модерацією закладів, топ-категоріями та аналітикою.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border bg-card p-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'users' ? <UsersTable /> : null}
      {activeTab === 'institutions' ? <InstitutionsModeration /> : null}
      {activeTab === 'topCategories' ? <TopCategoriesManager /> : null}
      {activeTab === 'analytics' ? <AnalyticsDashboard /> : null}
    </section>
  )
}
