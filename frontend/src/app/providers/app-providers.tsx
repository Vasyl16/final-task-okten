import type { PropsWithChildren } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { useAuthStore } from '@/entities/user/model/auth.store'
import { apiStore } from '@/shared/api/rtk/api-store'
import { setUnauthorizedHandler } from '@/shared/api/base-api'
import { getGoogleClientId } from '@/shared/lib/runtime-env'
import { FullScreenLoader } from '@/shared/ui/full-screen-loader'
import { Toaster } from '@/shared/ui/sonner'

export function AppProviders({ children }: PropsWithChildren) {
  const fetchMe = useAuthStore((state) => state.fetchMe)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  useEffect(() => {
    setUnauthorizedHandler(() => {
      useAuthStore.getState().clearAuthState()
    })

    void fetchMe().finally(() => {
      setIsBootstrapping(false)
    })

    return () => {
      setUnauthorizedHandler(null)
    }
  }, [fetchMe])

  if (isBootstrapping) {
    return <FullScreenLoader />
  }

  const googleClientId = getGoogleClientId()

  const tree = (
    <Provider store={apiStore}>
      {children}
      <Toaster />
    </Provider>
  )

  return googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>{tree}</GoogleOAuthProvider>
  ) : (
    tree
  )
}
