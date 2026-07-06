"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  MapPin,
  Sparkles,
} from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { CITIES, EVENT_INDUSTRIES } from "@/constants/categories";
import { SEED_EVENTS } from "@/data/mocks/seed";
import type { Event } from "@/data/types";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { formatShortDate } from "@/lib/utils/formatters";
import { getOkvedRecommendationReason, matchOkved } from "@/lib/utils/okved";

const EVENT_CATEGORY_LABELS: Record<Event["category"], string> = {
  exhibition: "Выставка",
  forum: "Форум",
  conference: "Конференция",
};

const SORT_OPTIONS = [
  { value: "date-asc", label: "По дате (ближайшие)" },
  { value: "date-desc", label: "По дате (поздние)" },
  { value: "title", label: "По названию" },
  { value: "city", label: "По городу" },
];

const VENUES = [...new Set(SEED_EVENTS.map((e) => e.venue))];

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(date);
}

function EventCard({ event, recommended }: { event: Event; recommended?: boolean }) {
  return (
    <Link href={`/events/${event.id}`}>
      <Card className="h-full hover:border-gray-900">
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge variant="outline">{EVENT_CATEGORY_LABELS[event.category]}</Badge>
          {event.bookingAvailable && <Badge variant="solid">Бронирование</Badge>}
          {recommended && (
            <Badge variant="dashed" icon={Sparkles}>
              Рекомендуем
            </Badge>
          )}
        </div>
        <CardTitle>{event.title}</CardTitle>
        <CardDescription className="flex items-center gap-1 mt-2">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {event.city} · {event.venue}
        </CardDescription>
        <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {formatShortDate(event.startDate)} — {formatShortDate(event.endDate)}
        </p>
        <p className="text-sm text-gray-700 mt-2 line-clamp-2">{event.description}</p>
        <div className="mt-3 pt-3 border-t border-gray-200 space-y-1 text-xs text-gray-600">
          <p><span className="font-medium text-gray-900">Отрасль:</span> {event.industry}</p>
          <p><span className="font-medium text-gray-900">Условия:</span> {event.participationTerms}</p>
          <p><span className="font-medium text-gray-900">Услуг:</span> {event.relatedServiceIds.length}</p>
        </div>
      </Card>
    </Link>
  );
}

function FilterFields({
  city,
  setCity,
  industry,
  setIndustry,
  category,
  setCategory,
  venue,
  setVenue,
  recommendedOnly,
  setRecommendedOnly,
  bookingOnly,
  setBookingOnly,
  sort,
  setSort,
  showRecommendedFilter,
}: {
  city: string;
  setCity: (v: string) => void;
  industry: string;
  setIndustry: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  venue: string;
  setVenue: (v: string) => void;
  recommendedOnly: boolean;
  setRecommendedOnly: (v: boolean) => void;
  bookingOnly: boolean;
  setBookingOnly: (v: boolean) => void;
  sort: string;
  setSort: (v: string) => void;
  showRecommendedFilter: boolean;
}) {
  return (
    <div className="space-y-4">
      <Select
        label="Город"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        options={[{ value: "", label: "Все города" }, ...CITIES.map((c) => ({ value: c, label: c }))]}
      />
      <Select
        label="Отрасль"
        value={industry}
        onChange={(e) => setIndustry(e.target.value)}
        options={[
          { value: "", label: "Все отрасли" },
          ...EVENT_INDUSTRIES.map((i) => ({ value: i, label: i })),
        ]}
      />
      <Select
        label="Тип мероприятия"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        options={[
          { value: "", label: "Все типы" },
          ...Object.entries(EVENT_CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
        ]}
      />
      <Select
        label="Площадка"
        value={venue}
        onChange={(e) => setVenue(e.target.value)}
        options={[{ value: "", label: "Все площадки" }, ...VENUES.map((v) => ({ value: v, label: v }))]}
      />
      <Select
        label="Сортировка"
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        options={SORT_OPTIONS}
      />
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={bookingOnly}
          onChange={(e) => setBookingOnly(e.target.checked)}
          className="border-gray-900"
        />
        Только с бронированием площадей
      </label>
      {showRecommendedFilter && (
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={recommendedOnly}
            onChange={(e) => setRecommendedOnly(e.target.checked)}
            className="border-gray-900"
          />
          Только рекомендованные по ОКВЭД
        </label>
      )}
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<EventsPageFallback />}>
      <EventsPageContent />
    </Suspense>
  );
}

function EventsPageFallback() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-6">
        <LoadingState message="Загрузка мероприятий..." />
      </main>
      <Footer />
    </div>
  );
}

function EventsPageContent() {
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();
  const { selectedCity, setSelectedCity } = usePrototypeStore();

  const [loading, setLoading] = useState(true);
  const [cityModalOpen, setCityModalOpen] = useState(true);
  const [cityDraft, setCityDraft] = useState(selectedCity);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => new Date(2026, 2, 1));
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [city, setCity] = useState("");
  const [industry, setIndustry] = useState("");
  const [category, setCategory] = useState("");
  const [venue, setVenue] = useState("");
  const [recommendedOnly, setRecommendedOnly] = useState(false);
  const [bookingOnly, setBookingOnly] = useState(false);
  const [sort, setSort] = useState("date-asc");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const isRecommended = useCallback(
    (event: Event) => {
      if (!user) return false;
      return matchOkved(user.mainOkved, event.okvedTags);
    },
    [user]
  );

  const filteredEvents = useMemo(() => {
    const month = monthKey(currentMonth);
    let list = SEED_EVENTS.filter((event) => {
      const eventMonth = event.startDate.slice(0, 7);
      if (eventMonth !== month) return false;
      if (city && event.city !== city) return false;
      if (industry && event.industry !== industry) return false;
      if (category && event.category !== category) return false;
      if (venue && event.venue !== venue) return false;
      if (bookingOnly && !event.bookingAvailable) return false;
      if (recommendedOnly && !isRecommended(event)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const haystack = `${event.title} ${event.city} ${event.venue} ${event.industry} ${event.description}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "date-desc":
          return b.startDate.localeCompare(a.startDate);
        case "title":
          return a.title.localeCompare(b.title, "ru");
        case "city":
          return a.city.localeCompare(b.city, "ru");
        default:
          return a.startDate.localeCompare(b.startDate);
      }
    });

    return list;
  }, [
    currentMonth,
    city,
    industry,
    category,
    venue,
    bookingOnly,
    recommendedOnly,
    search,
    sort,
    isRecommended,
  ]);

  const recommendedEvents = useMemo(() => {
    if (!isAuthenticated || !user) return [];
    return SEED_EVENTS.filter((e) => isRecommended(e)).slice(0, 3);
  }, [isAuthenticated, user, isRecommended]);

  const shiftMonth = (delta: number) => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const resetFilters = () => {
    setCity("");
    setIndustry("");
    setCategory("");
    setVenue("");
    setRecommendedOnly(false);
    setBookingOnly(false);
    setSort("date-asc");
    setSearch("");
  };

  const confirmCity = () => {
    setSelectedCity(cityDraft);
    setCityModalOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />

      <Modal
        open={cityModalOpen}
        onClose={() => setCityModalOpen(false)}
        title="Определение города"
        footer={
          <>
            <Button variant="outline" onClick={() => setCityModalOpen(false)}>Пропустить</Button>
            <Button onClick={confirmCity}>Подтвердить</Button>
          </>
        }
      >
        <p className="text-sm text-gray-700 mb-4">
          Мы определили ваш город как <strong>{selectedCity}</strong>. Выберите город для показа актуальных мероприятий.
        </p>
        <Select
          label="Город"
          value={cityDraft}
          onChange={(e) => setCityDraft(e.target.value)}
          options={CITIES.map((c) => ({ value: c, label: c }))}
        />
      </Modal>

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Выставки и мероприятия</h1>
            <p className="text-sm text-gray-600 mt-1">
              Город: {selectedCity} · Каталог мероприятий для участия
            </p>
          </div>
          <Link href="/requests/new">
            <Button>Разместить заявку</Button>
          </Link>
        </div>

        <div className="flex items-center justify-between border border-gray-300 bg-gray-50 px-4 py-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => shiftMonth(-1)} aria-label="Предыдущий месяц">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium capitalize">{formatMonthLabel(currentMonth)}</span>
          <Button variant="ghost" size="sm" onClick={() => shiftMonth(1)} aria-label="Следующий месяц">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Поиск по названию, городу, площадке..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button variant="outline" className="md:hidden" onClick={() => setFilterDrawerOpen(true)}>
            <Filter className="h-4 w-4" />
            Фильтры
          </Button>
        </div>

        {isAuthenticated && user && recommendedEvents.length > 0 && (
          <section className="mb-8 border border-gray-900 bg-gray-50 p-4">
            <h2 className="text-base font-semibold mb-1 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Рекомендации по ОКВЭД
            </h2>
            <p className="text-sm text-gray-600 mb-3">
              {getOkvedRecommendationReason(user.mainOkved)} — подобраны мероприятия для вашего профиля.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {recommendedEvents.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`} className="border border-gray-300 bg-white p-3 hover:border-gray-900">
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{event.city} · {formatShortDate(event.startDate)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="grid lg:grid-cols-[240px_1fr] gap-6">
          <aside className="hidden md:block">
            <div className="border border-gray-300 p-4 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold">Фильтры</h2>
                <button type="button" onClick={resetFilters} className="text-xs underline">Сбросить</button>
              </div>
              <FilterFields
                city={city}
                setCity={setCity}
                industry={industry}
                setIndustry={setIndustry}
                category={category}
                setCategory={setCategory}
                venue={venue}
                setVenue={setVenue}
                recommendedOnly={recommendedOnly}
                setRecommendedOnly={setRecommendedOnly}
                bookingOnly={bookingOnly}
                setBookingOnly={setBookingOnly}
                sort={sort}
                setSort={setSort}
                showRecommendedFilter={isAuthenticated}
              />
            </div>
          </aside>

          <section>
            {loading ? (
              <LoadingState message="Загрузка мероприятий..." />
            ) : filteredEvents.length === 0 ? (
              <EmptyState
                title="Мероприятия не найдены"
                description="Измените фильтры или выберите другой месяц"
                actionLabel="Сбросить фильтры"
                onAction={resetFilters}
              />
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">Найдено: {filteredEvents.length}</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {filteredEvents.map((event) => (
                    <EventCard key={event.id} event={event} recommended={isRecommended(event)} />
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      <Drawer open={filterDrawerOpen} onClose={() => setFilterDrawerOpen(false)} title="Фильтры">
        <FilterFields
          city={city}
          setCity={setCity}
          industry={industry}
          setIndustry={setIndustry}
          category={category}
          setCategory={setCategory}
          venue={venue}
          setVenue={setVenue}
          recommendedOnly={recommendedOnly}
          setRecommendedOnly={setRecommendedOnly}
          bookingOnly={bookingOnly}
          setBookingOnly={setBookingOnly}
          sort={sort}
          setSort={setSort}
          showRecommendedFilter={isAuthenticated}
        />
        <Button className="w-full mt-4" onClick={() => setFilterDrawerOpen(false)}>Применить</Button>
      </Drawer>

      <Footer />
    </div>
  );
}
