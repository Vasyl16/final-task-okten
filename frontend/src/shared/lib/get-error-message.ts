import axios from 'axios'

type ErrorResponse = {
  message?: string | string[]
}

export function getErrorMessage(
  error: unknown,
  fallbackMessage: string,
) {
  if (axios.isAxiosError<ErrorResponse>(error)) {
    const message = error.response?.data?.message

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

  return fallbackMessage
}
