const STRICT_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

export function isValidEmail(value: string): boolean {
  return STRICT_EMAIL_REGEX.test(normalizeEmail(value))
}

export const INVALID_EMAIL_MESSAGE =
  'Введіть коректний email у форматі name@example.com.'
