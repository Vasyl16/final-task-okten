import axios from 'axios'
import { translateApiErrorToUkrainian } from '@/shared/lib/api-error-messages-uk'

type ErrorResponse = {
  message?: string | string[]
}

type FetchLikeError = {
  data?: ErrorResponse
}

function extractHttpMessage(error: unknown): string | null {
  if (axios.isAxiosError<ErrorResponse>(error)) {
    const message = error.response?.data?.message

    if (Array.isArray(message)) {
      return message.join(', ')
    }

    if (typeof message === 'string' && message.trim()) {
      return message
    }

    if (error.message === 'Network Error') {
      return 'Network Error'
    }
  }

  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as FetchLikeError).data
    const message = data?.message

    if (Array.isArray(message)) {
      return message.join(', ')
    }

    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return null
}

export function getErrorMessage(
  error: unknown,
  fallbackMessage: string,
) {
  const raw = extractHttpMessage(error)

  if (!raw) {
    return fallbackMessage
  }

  if (raw === 'Network Error') {
    return 'Немає з’єднання з сервером. Перевірте інтернет і спробуйте ще раз.'
  }

  const translated = translateApiErrorToUkrainian(raw)
  return translated ?? fallbackMessage
}
