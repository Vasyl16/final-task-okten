import { Container } from '@/shared/ui/container'

export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <Container className="flex min-h-14 flex-col gap-3 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <span>© Піячок — знаходьте заклади та домовляйтесь про зустрічі.</span>
        <span className="shrink-0 text-xs sm:text-sm">React · Vite · Tailwind</span>
      </Container>
    </footer>
  )
}
