import { RouterProvider } from 'react-router-dom'
import { appRouter } from './router'

export function AppRouterProvider() {
  return <RouterProvider router={appRouter} />
}
