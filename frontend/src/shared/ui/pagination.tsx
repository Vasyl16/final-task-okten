import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'

type PaginationProps = {
  page: number
  pageCount: number
  onPageChange: (nextPage: number) => void
  className?: string
}

export function Pagination({ page, pageCount, onPageChange, className }: PaginationProps) {
  if (pageCount <= 1) {
    return null
  }

  const canPrev = page > 1
  const canNext = page < pageCount

  const windowSize = 5
  let start = Math.max(1, page - Math.floor(windowSize / 2))
  const end = Math.min(pageCount, start + windowSize - 1)

  if (end - start + 1 < windowSize) {
    start = Math.max(1, end - windowSize + 1)
  }

  const pages: number[] = []
  for (let index = start; index <= end; index += 1) {
    pages.push(index)
  }

  return (
    <nav
      className={cn('flex flex-wrap items-center justify-center gap-2', className)}
      aria-label="Пагінація"
    >
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

      <span className="text-sm text-muted-foreground">
        Сторінка {page} з {pageCount}
      </span>
    </nav>
  )
}
