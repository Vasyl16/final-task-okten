import { BarChart3, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { InstitutionCard } from '@/entities/institution/InstitutionCard';
import { ReviewCard } from '@/entities/review/ReviewCard';
import { UserInfo } from '@/entities/user/UserInfo';
import { PiyachokCard } from '@/entities/piyachok/PiyachokCard';
import { useGetFavoritesQuery } from '@/shared/api/favorites/get-favorites.query';
import { useRemoveFromFavoritesMutation } from '@/shared/api/favorites/remove-from-favorites.mutation';
import { useDeleteInstitutionMutation } from '@/shared/api/institutions/delete.mutation';
import { useGetMyInstitutionsQuery } from '@/shared/api/institutions/get-mine.query';
import {
  useDeletePiyachokMutation,
  useGetMyPiyachokQuery,
} from '@/shared/api/piyachok.api';
import {
  type ProfileUser,
  useGetCurrentUserQuery,
} from '@/shared/api/profile.api';
import {
  useDeleteReviewMutation,
  useGetMyReviewsQuery,
} from '@/shared/api/reviews.api';
import { getErrorMessage } from '@/shared/lib/get-error-message';
import {
  type ProfileTab,
  useProfileListingParams,
} from '@/shared/lib/listing-search-params';
import { useClampPage } from '@/shared/lib/use-search-param-page';
import { Button } from '@/shared/ui/button';
import { Pagination } from '@/shared/ui/pagination';

const PAGE_SIZE = 12;

const tabs: { id: ProfileTab; label: string }[] = [
  { id: 'info', label: 'Про мене' },
  { id: 'institutions', label: 'Мої заклади' },
  { id: 'favorites', label: 'Обране' },
  { id: 'reviews', label: 'Мої відгуки' },
  { id: 'piyachok', label: 'Мої піячки' },
];

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-1">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
      {text}
    </div>
  );
}

function LoadingCards({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border bg-card">
          <div className="aspect-16/10 animate-pulse bg-muted" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfilePage() {
  const {
    tab: activeTab,
    setTab: setActiveTab,
    institutionsPage,
    setInstitutionsPage,
    favoritesPage,
    setFavoritesPage,
    reviewsPage,
    setReviewsPage,
    piyachokPage,
    setPiyachokPage,
  } = useProfileListingParams();
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [deletingInstitutionId, setDeletingInstitutionId] = useState<
    string | null
  >(null);

  const { data: currentUser, isLoading: isUserLoading } =
    useGetCurrentUserQuery();
  const { data: myInstitutionsData, isLoading: isInstitutionsLoading } =
    useGetMyInstitutionsQuery(
      { page: institutionsPage, limit: PAGE_SIZE },
      {
        skip: activeTab !== 'institutions',
      },
    );
  const { data: favoritesData, isLoading: isFavoritesLoading } =
    useGetFavoritesQuery(
      { page: favoritesPage, limit: PAGE_SIZE },
      { skip: activeTab !== 'favorites' },
    );
  const { data: myReviewsData, isLoading: isReviewsLoading } =
    useGetMyReviewsQuery(
      { page: reviewsPage, limit: PAGE_SIZE },
      { skip: activeTab !== 'reviews' },
    );
  const { data: myPiyachokData, isLoading: isPiyachokLoading } =
    useGetMyPiyachokQuery(
      { page: piyachokPage, limit: PAGE_SIZE },
      { skip: activeTab !== 'piyachok' },
    );

  const myInstitutions = myInstitutionsData?.items ?? [];
  const institutionsPageCount = myInstitutionsData?.pageCount ?? 1;
  const favorites = favoritesData?.items ?? [];
  const favoritesPageCount = favoritesData?.pageCount ?? 1;
  const myReviews = myReviewsData?.items ?? [];
  const reviewsPageCount = myReviewsData?.pageCount ?? 1;
  const myPiyachok = myPiyachokData?.items ?? [];
  const piyachokPageCount = myPiyachokData?.pageCount ?? 1;

  useClampPage(
    institutionsPage,
    institutionsPageCount,
    setInstitutionsPage,
    activeTab === 'institutions',
  );
  useClampPage(
    favoritesPage,
    favoritesPageCount,
    setFavoritesPage,
    activeTab === 'favorites',
  );
  useClampPage(
    reviewsPage,
    reviewsPageCount,
    setReviewsPage,
    activeTab === 'reviews',
  );
  useClampPage(
    piyachokPage,
    piyachokPageCount,
    setPiyachokPage,
    activeTab === 'piyachok',
  );

  const [deleteInstitution] = useDeleteInstitutionMutation();
  const [removeFromFavorites, { isLoading: isRemovingFavorite }] =
    useRemoveFromFavoritesMutation();
  const [deleteReview, { isLoading: isDeletingReview }] =
    useDeleteReviewMutation();
  const [deletePiyachok, { isLoading: isDeletingPiyachok }] =
    useDeletePiyachokMutation();

  useEffect(() => {
    if (currentUser) {
      setProfileUser(currentUser);
    }
  }, [currentUser]);

  async function handleDeleteInstitution(id: string) {
    if (!window.confirm('Видалити цей заклад?')) {
      return;
    }

    setDeletingInstitutionId(id);
    try {
      await deleteInstitution(id).unwrap();
      toast.success('Заклад видалено');
    } catch (deleteError) {
      toast.error('Помилка видалення закладу', {
        description: getErrorMessage(
          deleteError,
          'Не вдалося видалити заклад.',
        ),
      });
    } finally {
      setDeletingInstitutionId(null);
    }
  }

  async function handleRemoveFavorite(id: string) {
    if (!window.confirm('Видалити заклад з обраного?')) {
      return;
    }

    try {
      await removeFromFavorites(id).unwrap();
      toast.success('Заклад видалено з обраного');
    } catch (removeError) {
      toast.error('Помилка видалення з обраного', {
        description: getErrorMessage(removeError, 'Не вдалося оновити обране.'),
      });
    }
  }

  async function handleDeleteReview(reviewId: string, institutionId?: string) {
    if (!institutionId) {
      toast.error('Не вдалося визначити заклад для цього відгуку.');
      return;
    }

    if (!window.confirm('Видалити цей відгук?')) {
      return;
    }

    try {
      await deleteReview({ reviewId, institutionId }).unwrap();
      toast.success('Відгук видалено');
    } catch (deleteError) {
      toast.error('Помилка видалення відгуку', {
        description: getErrorMessage(
          deleteError,
          'Не вдалося видалити відгук.',
        ),
      });
    }
  }

  async function handleDeletePiyachok(id: string) {
    if (!window.confirm('Видалити цей запит?')) {
      return;
    }

    try {
      await deletePiyachok(id).unwrap();
      toast.success('Запис видалено');
    } catch (deleteError) {
      toast.error('Помилка видалення', {
        description: getErrorMessage(deleteError, 'Не вдалося видалити запис.'),
      });
    }
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Профіль</h1>
        <p className="text-muted-foreground">
          Керуйте інформацією про себе, власними закладами, відгуками, обраним і
          piyachok.
        </p>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto overflow-y-hidden rounded-2xl border bg-card p-2 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={[
              'shrink-0 rounded-xl px-3 py-2 text-sm font-medium transition-colors sm:px-4',
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            ].join(' ')}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'info' ? (
        isUserLoading || !profileUser ? (
          <div className="h-56 animate-pulse rounded-3xl border bg-card" />
        ) : (
          <UserInfo user={profileUser} onUpdated={setProfileUser} />
        )
      ) : null}

      {activeTab === 'institutions' ? (
        <section className="space-y-4">
          <SectionHeader
            title="Мої заклади"
            description="Заклади, які ви створили. Огляд і статистика — публічна сторінка закладу; редагування — форма даних."
          />

          {isInstitutionsLoading ? <LoadingCards count={2} /> : null}

          {!isInstitutionsLoading && myInstitutions.length === 0 ? (
            <EmptyState text="У вас ще немає власних закладів." />
          ) : null}

          {!isInstitutionsLoading && myInstitutions.length > 0 ? (
            <>
              <div className="grid gap-6 items-start lg:grid-cols-2">
                {myInstitutions.map((institution) => (
                  <div key={institution.id} className="w-full space-y-3">
                    <InstitutionCard
                      institution={institution}
                      imageLayout="first"
                      disableNavigation
                      showFavorite={false}
                      deletePending={deletingInstitutionId === institution.id}
                      onDelete={() =>
                        void handleDeleteInstitution(institution.id)
                      }
                    />
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        asChild
                        className="w-full gap-2 sm:flex-1"
                        variant="default"
                      >
                        <Link to={`/institutions/${institution.id}`}>
                          <BarChart3 className="size-4 shrink-0" aria-hidden />
                          Огляд і статистика
                        </Link>
                      </Button>
                      <Button
                        asChild
                        className="w-full gap-2 sm:flex-1"
                        variant="outline"
                      >
                        <Link to={`/institutions/${institution.id}/edit`}>
                          <Pencil className="size-4 shrink-0" aria-hidden />
                          Редагувати
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Pagination
                page={institutionsPage}
                pageCount={institutionsPageCount}
                onPageChange={setInstitutionsPage}
              />
            </>
          ) : null}
        </section>
      ) : null}

      {activeTab === 'favorites' ? (
        <section className="space-y-4">
          <SectionHeader
            title="Обране"
            description="Ваші улюблені заклади, які можна швидко переглянути або прибрати зі списку."
          />

          {isFavoritesLoading ? <LoadingCards count={2} /> : null}

          {!isFavoritesLoading && favorites.length === 0 ? (
            <EmptyState text="У вас ще немає обраних закладів." />
          ) : null}

          {!isFavoritesLoading && favorites.length > 0 ? (
            <>
              <div className="grid gap-6 items-start lg:grid-cols-2">
                {favorites.map((institution) => (
                  <div key={institution.id} className="w-full space-y-3">
                    <InstitutionCard
                      institution={{ ...institution, isFavorite: true }}
                      imageLayout="first"
                    />
                    <Button
                      className="w-full"
                      variant="outline"
                      disabled={isRemovingFavorite}
                      onClick={() => void handleRemoveFavorite(institution.id)}
                    >
                      {isRemovingFavorite
                        ? 'Прибираємо…'
                        : 'Прибрати з обраного'}
                    </Button>
                  </div>
                ))}
              </div>
              <Pagination
                page={favoritesPage}
                pageCount={favoritesPageCount}
                onPageChange={setFavoritesPage}
              />
            </>
          ) : null}
        </section>
      ) : null}

      {activeTab === 'reviews' ? (
        <section className="space-y-4">
          <SectionHeader
            title="Мої відгуки"
            description="Усі відгуки, які ви залишили для закладів."
          />

          {isReviewsLoading ? <LoadingCards count={2} /> : null}

          {!isReviewsLoading && myReviews.length === 0 ? (
            <EmptyState text="У вас ще немає власних відгуків." />
          ) : null}

          {!isReviewsLoading && myReviews.length > 0 ? (
            <>
              <div className="space-y-4">
                {myReviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    isDeleting={isDeletingReview}
                    onDelete={() =>
                      void handleDeleteReview(review.id, review.institution?.id)
                    }
                  />
                ))}
              </div>
              <Pagination
                page={reviewsPage}
                pageCount={reviewsPageCount}
                onPageChange={setReviewsPage}
              />
            </>
          ) : null}
        </section>
      ) : null}

      {activeTab === 'piyachok' ? (
        <section className="space-y-4">
          <SectionHeader
            title="Мої piyachok"
            description="Ваші власні запити на зустрічі, які можна видаляти."
          />

          {isPiyachokLoading ? <LoadingCards count={2} /> : null}

          {!isPiyachokLoading && myPiyachok.length === 0 ? (
            <EmptyState text="У вас ще немає власних piyachok." />
          ) : null}

          {!isPiyachokLoading && myPiyachok.length > 0 ? (
            <>
              <div className="space-y-4">
                {myPiyachok.map((item) => (
                  <PiyachokCard
                    key={item.id}
                    item={item}
                    isOwn
                    isDeleting={isDeletingPiyachok}
                    onDelete={() => void handleDeletePiyachok(item.id)}
                  />
                ))}
              </div>
              <Pagination
                page={piyachokPage}
                pageCount={piyachokPageCount}
                onPageChange={setPiyachokPage}
              />
            </>
          ) : null}
        </section>
      ) : null}
    </section>
  );
}
