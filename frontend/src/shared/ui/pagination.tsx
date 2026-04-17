import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'

type PaginationProps = {
  page: number
  pageCount: number
  onPageChange: (nextPage: number) => void
  className?: string
  /** Numbered buttons + bullets (default). */
  variant?: 'default' | 'bullets'
}

function getPageWindow(
  page: number,
  pageCount: number,
  windowSize: number,
): number[] {
  let start = Math.max(1, page - Math.floor(windowSize / 2))
  const end = Math.min(pageCount, start + windowSize - 1)

  if (end - start + 1 < windowSize) {
    start = Math.max(1, end - windowSize + 1)
  }

  const pages: number[] = []
  for (let index = start; index <= end; index += 1) {
    pages.push(index)
  }

  return pages
}

function PaginationBullets({
  page,
  pageCount,
  onPageChange,
}: {
  page: number
  pageCount: number
  onPageChange: (nextPage: number) => void
}) {
  const windowSize = Math.min(15, pageCount)
  const visible = getPageWindow(page, pageCount, windowSize)

  return (
    <div
      className="flex max-w-full items-center justify-center gap-1.5 overflow-x-auto px-1 py-1"
      role="tablist"
      aria-label="Сторінки (крапки)"
    >
      {visible.map((pageNumber) => {
        const isActive = pageNumber === page

        return (
          <button
            key={pageNumber}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`Сторінка ${pageNumber}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onPageChange(pageNumber)}
            className={cn(
              'shrink-0 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              isActive
                ? 'h-2.5 w-6 bg-primary'
                : 'h-2 w-2 bg-muted-foreground/35 hover:bg-muted-foreground/60',
            )}
          />
        )
      })}
    </div>
  )
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
  className,
  variant = 'default',
}: PaginationProps) {
  if (pageCount < 1) {
    return null
  }

  const canPrev = page > 1
  const canNext = page < pageCount

  const windowSize = 5
  const pages = getPageWindow(page, pageCount, windowSize)

  if (variant === 'bullets') {
    return (
      <nav
        className={cn('flex flex-col items-center gap-4', className)}
        aria-label="Пагінація"
      >
        <div className="flex w-full max-w-md flex-wrap items-center justify-center gap-3 sm:flex-nowrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canPrev}
            onClick={() => onPageChange(page - 1)}
            aria-label="Попередня сторінка"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <PaginationBullets
            page={page}
            pageCount={pageCount}
            onPageChange={onPageChange}
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canNext}
            onClick={() => onPageChange(page + 1)}
            aria-label="Наступна сторінка"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <span className="text-sm text-muted-foreground">
          Сторінка {page} з {pageCount}
        </span>
      </nav>
    )
  }

  return (
    <nav
      className={cn('flex flex-col items-center gap-4', className)}
      aria-label="Пагінація"
    >
      <PaginationBullets page={page} pageCount={pageCount} onPageChange={onPageChange} />

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
          aria-label="Попередня сторінка"
        >
          <ChevronLeft className="size-4" />
        </Button>

        {pages.map((pageNumber) => (
          <Button
            key={pageNumber}
            type="button"
            variant={pageNumber === page ? 'default' : 'outline'}
            size="sm"
            className="min-w-9"
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </Button>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
          aria-label="Наступна сторінка"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <span className="text-sm text-muted-foreground">
        Сторінка {page} з {pageCount}
      </span>
    </nav>
  )
}
