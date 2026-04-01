/** Runtime config from /config.js (Docker/EB); falls back to Vite build env (local dev). */

declare global {
  interface Window {
    __ENV__?: {
      VITE_API_URL?: string
      VITE_GOOGLE_CLIENT_ID?: string
      VITE_GOOGLE_MAPS_API_KEY?: string
    }
  }
}

function fromWindow(key: keyof NonNullable<Window['__ENV__']>): string | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }
  const value = window.__ENV__?.[key]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

export function getApiBaseUrl(): string {
  return (
    fromWindow('VITE_API_URL') ??
    import.meta.env.VITE_API_URL ??
    'http://localhost:3000'
  )
}

export function getGoogleClientId(): string {
  return (
    fromWindow('VITE_GOOGLE_CLIENT_ID') ?? import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''
  )
}

export function getGoogleMapsApiKey(): string {
  return (
    fromWindow('VITE_GOOGLE_MAPS_API_KEY') ??
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ??
    ''
  )
}
