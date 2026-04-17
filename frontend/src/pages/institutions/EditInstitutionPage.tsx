import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { EditInstitutionForm } from '@/features/institution/EditInstitutionForm'
import { useGetMyInstitutionsQuery } from '@/shared/api/institutions/get-mine.query'

export function EditInstitutionPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data: myInstitutionsData, isLoading } = useGetMyInstitutionsQuery({
    page: 1,
    limit: 50,
  })
  const myInstitutions = myInstitutionsData?.items ?? []

  const institution = myInstitutions.find((item) => item.id === id)

  if (!id) {
    return <Navigate to="/profile" replace />
  }

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-3xl border bg-card" />
  }

  if (!institution) {
    return <Navigate to="/profile" replace />
  }

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <Link
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          to="/profile"
        >
          Назад до профілю
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">
          Редагування закладу
        </h1>
        <p className="text-muted-foreground">
          Оновіть інформацію про заклад та окремо керуйте його фотографіями.
        </p>
      </div>

      <EditInstitutionForm
        institution={institution}
        onCancel={() => navigate('/profile')}
        onSaved={() => navigate('/profile', { replace: true })}
      />
    </section>
  )
}
