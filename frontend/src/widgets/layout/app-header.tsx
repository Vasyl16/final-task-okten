import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/entities/user/model/auth.store';
import { Container } from '@/shared/ui/container';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import { LoadingSpinner } from '@/shared/ui/loading-spinner';

const navigation = [
  { to: '/', label: 'Головна' },
  { to: '/institutions', label: 'Заклади' },
  { to: '/top', label: 'Топ' },
  { to: '/news', label: 'Новини' },
  { to: '/piyachok', label: 'Піячок' },
  { to: '/profile', label: 'Профіль' },
] as const;

function navLinkClass(isActive: boolean) {
  return cn(
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    'hover:bg-accent hover:text-accent-foreground',
    isActive && 'bg-accent text-accent-foreground',
  );
}

export function AppHeader() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const logout = useAuthStore((state) => state.logout);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const mobileDrawer =
    mobileOpen &&
    typeof document !== 'undefined' &&
    createPortal(
      <>
        <button
          type="button"
          className="fixed inset-0 z-100 bg-black/50 lg:hidden"
          aria-hidden
          onClick={() => setMobileOpen(false)}
        />
        <div
          id="mobile-navigation"
          className="fixed inset-y-0 right-0 z-110 flex w-[min(100vw-2rem,20rem)] max-w-[calc(100vw-1rem)] flex-col border-l border-border bg-background shadow-xl lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Меню"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
            <span className="font-semibold">Меню</span>
            <button
              type="button"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-accent"
              onClick={() => setMobileOpen(false)}
              aria-label="Закрити меню"
            >
              <X className="size-5" strokeWidth={2} />
            </button>
          </div>
          <nav
            className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain p-4"
            aria-label="Мобільна навігація"
          >
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-3 text-base font-medium',
                    navLinkClass(isActive),
                  )
                }
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            {user?.role === 'ADMIN' ? (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-3 text-base font-medium',
                    navLinkClass(isActive),
                  )
                }
                onClick={() => setMobileOpen(false)}
              >
                Адмін
              </NavLink>
            ) : null}
          </nav>
          <div className="shrink-0 border-t border-border p-4">
            {isAuthenticated && user ? (
              <div className="space-y-3">
                <p className="truncate text-sm text-muted-foreground">
                  {user.name}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => void logout()}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner />
                      Вихід…
                    </>
                  ) : (
                    'Вийти'
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button asChild variant="outline" className="w-full">
                  <NavLink to="/login" onClick={() => setMobileOpen(false)}>
                    Вхід
                  </NavLink>
                </Button>
                <Button asChild className="w-full">
                  <NavLink to="/register" onClick={() => setMobileOpen(false)}>
                    Реєстрація
                  </NavLink>
                </Button>
              </div>
            )}
          </div>
        </div>
      </>,
      document.body,
    );

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-md supports-backdrop-filter:bg-background/75">
      <Container className="flex h-14 items-center justify-between gap-3 sm:h-16">
        <NavLink
          className="min-w-0 shrink-0 text-lg font-semibold tracking-tight text-foreground"
          to="/"
        >
          Піячок
        </NavLink>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Головна навігація"
          >
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => navLinkClass(isActive)}
              >
                {item.label}
              </NavLink>
            ))}
            {user?.role === 'ADMIN' ? (
              <NavLink
                to="/admin"
                className={({ isActive }) => navLinkClass(isActive)}
              >
                Адмін
              </NavLink>
            ) : null}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {isAuthenticated && user ? (
              <>
                <span className="max-w-[140px] truncate text-sm text-muted-foreground xl:max-w-[200px]">
                  {user.name}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void logout()}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <LoadingSpinner />
                      Вихід…
                    </span>
                  ) : (
                    'Вийти'
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <NavLink to="/login">Вхід</NavLink>
                </Button>
                <Button asChild size="sm">
                  <NavLink to="/register">Реєстрація</NavLink>
                </Button>
              </>
            )}
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            aria-label="Відкрити меню"
          >
            <Menu className="size-5 shrink-0" strokeWidth={2} aria-hidden />
          </button>
        </div>
      </Container>

      {mobileDrawer}
    </header>
  );
}
