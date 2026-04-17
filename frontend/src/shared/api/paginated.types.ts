export type PaginatedList<T> = {
  items: T[]
  total: number
  page: number
  limit: number
  pageCount: number
}
