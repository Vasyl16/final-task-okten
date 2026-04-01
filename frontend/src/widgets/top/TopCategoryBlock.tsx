import type { TopCategory } from '@/entities/institution/types';
import { InstitutionCard } from '@/entities/institution/InstitutionCard';

type TopCategoryBlockProps = {
  category: TopCategory;
  favoriteIds: Set<string>;
};

export function TopCategoryBlock({
  category,
  favoriteIds,
}: TopCategoryBlockProps) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          {category.name}
        </h2>
        <p className="text-sm text-muted-foreground">
          Добірка найкращих закладів у цій категорії.
        </p>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex gap-4">
          {category.institutions.map((institution) => (
            <div
              key={institution.id}
              className="min-w-[280px] max-w-[320px] flex-1"
            >
              <InstitutionCard
                institution={{
                  ...institution,
                  isFavorite: favoriteIds.has(institution.id),
                }}
                badge="Top pick 🔥"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
