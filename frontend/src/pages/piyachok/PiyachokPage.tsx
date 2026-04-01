import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PiyachokCard } from '@/entities/piyachok/PiyachokCard';
import { CreatePiyachokForm } from '@/features/piyachok/CreatePiyachokForm';
import { useAuthStore } from '@/entities/user/model/auth.store';
import {
  useDeletePiyachokMutation,
  useGetAllPiyachokQuery,
  useGetMyPiyachokQuery,
} from '@/shared/api/piyachok.api';
import { getErrorMessage } from '@/shared/lib/get-error-message';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Pagination } from '@/shared/ui/pagination';

const PAGE_SIZE = 10;

export function PiyachokPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 350);
    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [sortBy, sortOrder, search]);

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      sortBy,
      sortOrder,
      ...(search ? { search } : {}),
    }),
    [page, search, sortBy, sortOrder],
  );

  const {
    data: publicData,
    isLoading: isPublicLoading,
    error: publicError,
    refetch: refetchPublic,
  } = useGetAllPiyachokQuery(queryParams);
  const publicFeed = publicData?.items ?? [];
  const pageCount = publicData?.pageCount ?? 1;
  const {
    data: myFeed = [],
    isLoading: isMyLoading,
    error: myError,
    refetch: refetchMy,
  } = useGetMyPiyachokQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [deletePiyachok, { isLoading: isDeleting }] =
    useDeletePiyachokMutation();

  async function handleDelete(id: string) {
    try {
      await deletePiyachok(id).unwrap();
      toast.success('Piyachok видалено');
    } catch (error) {
      toast.error('Помилка видалення', {
        description: getErrorMessage(error, 'Не вдалося видалити запис.'),
      });
    }
  }

  return (
    <section className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Піячок</h1>
        <p className="text-muted-foreground">
          Публічна стрічка запитів на зустрічі та керування власними записами —
          без коментарів і лайків.
        </p>
      </div>

      <CreatePiyachokForm />

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">Усі піячки</h2>
          <p className="text-sm text-muted-foreground">
            Публічна стрічка нових запитів (лише перегляд).
          </p>
        </div>

        <div className="grid gap-3 rounded-2xl border bg-card p-4 md:grid-cols-4">
          <label className="flex flex-col gap-1 text-sm md:col-span-2">
            <span className="text-muted-foreground">Пошук за текстом</span>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                className="pl-9"
                placeholder="Введіть слова з тексту запиту…"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                type="search"
                autoComplete="off"
              />
            </div>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Сортувати за</span>
            <select
              className="flex h-10 rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value as 'date' | 'createdAt')
              }
            >
              <option value="createdAt">Датою публікації</option>
              <option value="date">Датою зустрічі</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Порядок</span>
            <select
              className="flex h-10 rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={sortOrder}
              onChange={(event) =>
                setSortOrder(event.target.value as 'asc' | 'desc')
              }
            >
              <option value="desc">Спочатку новіші</option>
              <option value="asc">Спочатку старіші</option>
            </select>
          </label>
        </div>

        {isPublicLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-2xl border bg-card p-5">
                <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
                <div className="mt-4 h-16 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : null}

        {!isPublicLoading && publicError ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-5">
            <p className="text-sm text-destructive">
              Не вдалося завантажити публічну стрічку piyachok.
            </p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => void refetchPublic()}
            >
              Спробувати ще раз
            </Button>
          </div>
        ) : null}

        {!isPublicLoading && !publicError && publicFeed.length === 0 ? (
          <div className="rounded-2xl border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              {search
                ? 'Нічого не знайдено за цим запитом.'
                : 'Ще немає piyachok'}
            </p>
          </div>
        ) : null}

        {!isPublicLoading && !publicError && publicFeed.length > 0 ? (
          <div className="space-y-4">
            {publicFeed.map((item) => (
              <PiyachokCard key={item.id} item={item} />
            ))}
            <Pagination
              page={page}
              pageCount={pageCount}
              onPageChange={setPage}
            />
          </div>
        ) : null}
      </section>

      {isAuthenticated ? (
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Мої піячки</h2>
            <p className="text-sm text-muted-foreground">
              Ваші власні запити, які можна видаляти.
            </p>
          </div>

          {isMyLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="rounded-2xl border bg-card p-5">
                  <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
                  <div className="mt-4 h-16 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : null}

          {!isMyLoading && myError ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-5">
              <p className="text-sm text-destructive">
                Не вдалося завантажити ваші piyachok.
              </p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => void refetchMy()}
              >
                Спробувати ще раз
              </Button>
            </div>
          ) : null}

          {!isMyLoading && !myError && myFeed.length === 0 ? (
            <div className="rounded-2xl border bg-card p-8 text-center">
              <p className="text-muted-foreground">
                У вас ще немає власних piyachok.
              </p>
            </div>
          ) : null}

          {!isMyLoading && !myError && myFeed.length > 0 ? (
            <div className="space-y-4">
              {myFeed.map((item) => (
                <PiyachokCard
                  key={item.id}
                  item={item}
                  isOwn
                  isDeleting={isDeleting}
                  onDelete={() => void handleDelete(item.id)}
                />
              ))}
            </div>
          ) : null}
        </section>
      ) : null}
    </section>
  );
}
