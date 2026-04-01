type JwtPayload = {
  sub: string
  name: string
  email: string
  role: 'USER' | 'ADMIN'
  isCritic: boolean
  exp?: number
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = normalized.length % 4
  const padded = padding ? normalized.padEnd(normalized.length + (4 - padding), '=') : normalized
  const binary = window.atob(padded)
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))

  return new TextDecoder().decode(bytes)
}

export function decodeJwtPayload(token: string) {
  const [, payload] = token.split('.')

  if (!payload) {
    return null
  }

  try {
    return JSON.parse(decodeBase64Url(payload)) as JwtPayload
  } catch {
    return null
  }
}
