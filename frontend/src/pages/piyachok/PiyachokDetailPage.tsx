import { CalendarDays, MapPin, Navigation, UserRound } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useGetPiyachokByIdQuery } from '@/shared/api/piyachok.api';
import {
  googleMapsDirectionsUrl,
  googleMapsEmbedUrl,
  googleMapsSearchUrl,
} from '@/shared/lib/maps';
import { getGoogleMapsApiKey } from '@/shared/lib/runtime-env';
import { Button } from '@/shared/ui/button';
import { LoadingSpinner } from '@/shared/ui/loading-spinner';

const mapsApiKey = getGoogleMapsApiKey();

function formatDate(value: string) {
  return new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function PiyachokDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useGetPiyachokByIdQuery(id, {
    skip: !id,
  });

  if (!id) {
    return <Navigate to="/piyachok" replace />;
  }

  if (isLoading) {
    return (
      <section className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner />
      </section>
    );
  }

  if (isError || !data) {
    return (
      <section className="space-y-4">
        <Link
          className="text-sm text-muted-foreground hover:text-foreground"
          to="/piyachok"
        >
          Назад до стрічки
        </Link>
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-sm text-destructive">
          Не вдалося завантажити запис.
        </div>
        <Button variant="outline" onClick={() => void refetch()}>
          Спробувати ще раз
        </Button>
      </section>
    );
  }

  const { institutionLat, institutionLng, institutionId, institutionName } =
    data;

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <Link
        className="inline-flex text-sm text-muted-foreground transition-colors hover:text-foreground"
        to="/piyachok"
      >
        Назад до стрічки
      </Link>

      <article className="space-y-6 rounded-3xl border bg-card p-6 shadow-sm">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-4" />
              {formatDate(data.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1">
              <UserRound className="size-4" />
              {data.user?.name || 'Анонім'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium">
              {institutionName}
            </span>
            <Button asChild variant="outline" size="sm">
              <Link to={`/institutions/${institutionId}`}>
                Сторінка закладу
              </Link>
            </Button>
          </div>
        </header>

        <div className="space-y-2">
          <h1 className="text-lg font-semibold">Повідомлення</h1>
          <p className="whitespace-pre-line text-foreground">{data.message}</p>
        </div>

        <dl className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <div>
            <dt className="font-medium text-foreground">Дата зустрічі</dt>
            <dd>{formatDate(data.date)}</dd>
          </div>
          {data.peopleCount ? (
            <div>
              <dt className="font-medium text-foreground">Людей</dt>
              <dd>{data.peopleCount}</dd>
            </div>
          ) : null}
          {data.budget !== null && data.budget !== undefined ? (
            <div>
              <dt className="font-medium text-foreground">Бюджет</dt>
              <dd>{data.budget}</dd>
            </div>
          ) : null}
        </dl>

        <div className="space-y-3 border-t pt-6">
          <h2 className="text-lg font-semibold">Заклад на карті</h2>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <a
                href={googleMapsDirectionsUrl(institutionLat, institutionLng)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Navigation className="size-4" />
                Маршрут
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a
                href={googleMapsSearchUrl(institutionLat, institutionLng)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin className="size-4" />
                Google Maps
              </a>
            </Button>
          </div>
          {mapsApiKey.trim() ? (
            <div className="overflow-hidden rounded-2xl border">
              <iframe
                title={`Карта: ${institutionName}`}
                className="aspect-video w-full min-h-[220px] border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                src={googleMapsEmbedUrl(
                  institutionLat,
                  institutionLng,
                  mapsApiKey,
                )}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Додайте{' '}
              <code className="rounded bg-muted px-1">
                VITE_GOOGLE_MAPS_API_KEY
              </code>{' '}
              для вбудованої карти.
            </p>
          )}
        </div>
      </article>
    </section>
  );
}
