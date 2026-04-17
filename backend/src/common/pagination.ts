export type PaginationInput = {
  page?: number;
  limit?: number;
};

export function resolvePagination(
  query: PaginationInput,
  defaultLimit = 12,
): { page: number; limit: number; skip: number } {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(50, Math.max(1, query.limit ?? defaultLimit));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function resolvePageCount(total: number, limit: number): number {
  return Math.max(1, Math.ceil(total / limit));
}
