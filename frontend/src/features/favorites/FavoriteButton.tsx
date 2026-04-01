import { Heart } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthStore } from '@/entities/user/model/auth.store'
import { getErrorMessage } from '@/shared/lib/get-error-message'
import { useAddToFavoritesMutation } from '@/shared/api/favorites/add-to-favorites.mutation'
import { useRemoveFromFavoritesMutation } from '@/shared/api/favorites/remove-from-favorites.mutation'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { LoadingSpinner } from '@/shared/ui/loading-spinner'

type FavoriteButtonProps = {
  institutionId: string
  isFavorite?: boolean
  className?: string
  onChange?: (value: boolean) => void
}

export function FavoriteButton({
  institutionId,
  isFavorite = false,
  className,
  onChange,
}: FavoriteButtonProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const navigate = useNavigate()
  const location = useLocation()
  const [addToFavorites, { isLoading: isAdding }] = useAddToFavoritesMutation()
  const [removeFromFavorites, { isLoading: isRemoving }] =
    useRemoveFromFavoritesMutation()
  const isPending = isAdding || isRemoving

  async function handleClick() {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: location,
        },
      })

      return
    }

    try {
      if (isFavorite) {
        await removeFromFavorites(institutionId).unwrap()
        onChange?.(false)
        toast.success('Заклад видалено з обраного')
      } else {
        await addToFavorites(institutionId).unwrap()
        onChange?.(true)
        toast.success('Заклад додано в обране')
      }
    } catch (error) {
      const message = getErrorMessage(error, 'Не вдалося оновити обране.')

      toast.error('Помилка обраного', {
        description: message,
      })
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending}
      className={cn('shrink-0', className)}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void handleClick()
      }}
      aria-label={isFavorite ? 'Видалити з обраного' : 'Додати в обране'}
    >
      {isPending ? (
        <LoadingSpinner className="size-4" />
      ) : (
        <Heart
          className={cn(
            'size-4 transition-colors',
            isFavorite && 'fill-current text-red-500',
          )}
        />
      )}
    </Button>
  )
}
