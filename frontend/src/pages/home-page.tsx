import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Newspaper, Sparkles, Users } from 'lucide-react'
import { Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Button } from '@/shared/ui/button'

const slides = [
  {
    icon: MapPin,
    title: 'Заклади поруч',
    description:
      'Переглядайте ресторани та бари з рейтингами, фото та відгуками — оберіть місце під настрій.',
    to: '/institutions',
    cta: 'До каталогу',
  },
  {
    icon: Newspaper,
    title: 'Новини та події',
    description:
      'Актуальні новини від закладів: акції, концерти та спеціальні пропозиції.',
    to: '/news',
    cta: 'Читати новини',
  },
  {
    icon: Users,
    title: 'Запити на зустріч',
    description:
      'Створюйте публічні запити на вихід у компанію — без зайвих соціальних функцій, лише суть.',
    to: '/piyachok',
    cta: 'Перейти до піячок',
  },
] as const

export function HomePage() {
  return (
    <div className="space-y-10 sm:space-y-14">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary/5 px-5 py-10 shadow-sm sm:px-8 sm:py-12 lg:px-12 lg:py-16">
        <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 size-56 rounded-full bg-accent blur-3xl" />
        <div className="relative space-y-5">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Sparkles className="size-3.5" />
            Локальна платформа
          </p>
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Заклади, новини та зустрічі в одному місці
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Піячок допомагає знайти заклад за рейтингом і відгуками, читати новини від ініціаторів і
            шукати компанію для вечора — без зайвого шуму.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild size="lg" className="gap-2">
              <Link to="/institutions">
                Заклади
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/news">Новини</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="px-1">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Швидкий старт</h2>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Гортайте картки — оберіть розділ (на мобільному зручно свайпом).
          </p>
        </div>
        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true }}
          spaceBetween={16}
          slidesPerView={1.08}
          breakpoints={{
            480: { slidesPerView: 1.2, spaceBetween: 16 },
            640: { slidesPerView: 2, spaceBetween: 16 },
            1024: { slidesPerView: 3, spaceBetween: 20 },
          }}
          className="pb-10"
        >
          {slides.map((slide) => {
            const Icon = slide.icon
            return (
              <SwiperSlide key={slide.to}>
                <div className="flex h-full min-h-[220px] flex-col rounded-2xl border border-border bg-card p-5 shadow-sm sm:min-h-[240px] sm:p-6">
                  <div className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{slide.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {slide.description}
                  </p>
                  <Button asChild variant="outline" className="mt-4 w-full sm:w-auto">
                    <Link to={slide.to} className="gap-2">
                      {slide.cta}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </SwiperSlide>
            )
          })}
        </Swiper>
      </section>
    </div>
  )
}
