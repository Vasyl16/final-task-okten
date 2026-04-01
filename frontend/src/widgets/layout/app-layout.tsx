import { Outlet } from 'react-router-dom'
import { Container } from '@/shared/ui/container'
import { AppFooter } from './app-footer'
import { AppHeader } from './app-header'

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="flex-1 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] sm:py-8 lg:py-10">
        <Container>
          <Outlet />
        </Container>
      </main>
      <AppFooter />
    </div>
  )
}
