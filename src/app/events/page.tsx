"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EventsDateFilter, isEventInSelectedPeriod } from "@/components/catalog/events-calendar";
import { Calendar, Filter, MapPin, Sparkles } from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { CITIES, EVENT_INDUSTRIES, FEDERAL_DISTRICT_OPTIONS, getCitiesByDistrict, getDistrictByCity } from "@/constants/categories";
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

function EventCard({ event, recommended }: { event: Event; recommended?: boolean }) {
  return (
    <Link href={`/events/${event.id}`}>
      <Card className="h-full hover:border-gray-900">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge variant="outline">{EVENT_CATEGORY_LABELS[event.category]}</Badge>
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
  viewYear,
  viewMonth,
  onShiftViewMonth,
  selectedDays,
  onToggleDay,
  onClearPeriod,
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
  viewYear: number;
  viewMonth: number;
  onShiftViewMonth: (delta: number) => void;
  selectedDays: string[];
  onToggleDay: (dateKey: string) => void;
  onClearPeriod: () => void;
}) {
  return (
    <div className="space-y-4">
      <EventsDateFilter
        events={SEED_EVENTS}
        viewYear={viewYear}
        viewMonth={viewMonth}
        onShiftViewMonth={onShiftViewMonth}
        selectedDays={selectedDays}
        onToggleDay={onToggleDay}
        onClearPeriod={onClearPeriod}
      />
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
      <label className="flex items-start gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={bookingOnly}
          onChange={(e) => setBookingOnly(e.target.checked)}
          className="border-gray-900 mt-0.5"
        />
        <span>
          Только с бронированием площадей
          <span className="block text-xs text-gray-500 mt-1">
            Будет работать в тестовом режиме какое-то время
          </span>
        </span>
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
      <div className="grid grid-cols-1 gap-2 pt-2 border-t border-gray-200">
        <Link
          href="/contractors"
          className="block border border-gray-300 bg-white px-3 py-2 text-sm text-center hover:border-gray-900"
        >
          Найти исполнителя
        </Link>
        <Link
          href="/services"
          className="block border border-gray-300 bg-white px-3 py-2 text-sm text-center hover:border-gray-900"
        >
          Найти услугу
        </Link>
      </div>
    </div>
  );
}

function CityPickerModal({
  open,
  onClose,
  detectedCity,
  cityDraft,
  setCityDraft,
  districtDraft,
  setDistrictDraft,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  detectedCity: string;
  cityDraft: string;
  setCityDraft: (value: string) => void;
  districtDraft: string;
  setDistrictDraft: (value: string) => void;
  onConfirm: () => void;
}) {
  const availableCities = useMemo(() => getCitiesByDistrict(districtDraft), [districtDraft]);

  useEffect(() => {
    if (availableCities.length > 0 && !availableCities.includes(cityDraft)) {
      setCityDraft(availableCities[0]);
    }
  }, [availableCities, cityDraft, setCityDraft]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Определение города"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Пропустить</Button>
          <Button onClick={onConfirm}>Подтвердить</Button>
        </>
      }
    >
      <p className="text-sm text-gray-700 mb-4">
        Мы определили ваш город автоматически по геопозиции как <strong>{detectedCity}</strong>.
        Выберите федеральный округ и город для показа актуальных мероприятий.
      </p>
      <div className="space-y-4">
        <Select
          label="Федеральный округ"
          value={districtDraft}
          onChange={(e) => setDistrictDraft(e.target.value)}
          options={[
            { value: "", label: "Все федеральные округа" },
            ...FEDERAL_DISTRICT_OPTIONS.map((district) => ({ value: district, label: district })),
          ]}
        />
        <Select
          label="Город"
          value={cityDraft}
          onChange={(e) => setCityDraft(e.target.value)}
          options={availableCities.map((city) => ({ value: city, label: city }))}
        />
      </div>
    </Modal>
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
      <main className="flex-1 mx-auto max-w-site w-full px-4 py-6">
        <LoadingState message="Загрузка мероприятий..." />
      </main>
      <Footer />
    </div>
  );
}

function EventsPageContent() {
  const { isAuthenticated, user } = useAuthStore();
  const { selectedCity, setSelectedCity } = usePrototypeStore();

  const [loading, setLoading] = useState(true);
  const detectedCity = "Санкт-Петербург";
  const [cityModalOpen, setCityModalOpen] = useState(true);
  const [cityDraft, setCityDraft] = useState(detectedCity);
  const [districtDraft, setDistrictDraft] = useState(getDistrictByCity(detectedCity));
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(2);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
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

  const activeMonthKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;

  const filteredEvents = useMemo(() => {
    let list = SEED_EVENTS.filter((event) => {
      if (!isEventInSelectedPeriod(event, activeMonthKey, selectedDays)) return false;
      if (city && event.city !== city) return false;
      if (industry && event.industry !== industry) return false;
      if (category && event.category !== category) return false;
      if (venue && event.venue !== venue) return false;
      if (bookingOnly && !event.bookingAvailable) return false;
      if (recommendedOnly && !isRecommended(event)) return false;
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
    activeMonthKey,
    selectedDays,
    city,
    industry,
    category,
    venue,
    bookingOnly,
    recommendedOnly,
    sort,
    isRecommended,
  ]);

  const recommendedEvents = useMemo(() => {
    if (!isAuthenticated || !user) return [];
    return SEED_EVENTS.filter((e) => isRecommended(e)).slice(0, 3);
  }, [isAuthenticated, user, isRecommended]);

  const shiftViewMonth = (delta: number) => {
    setViewMonth((prev) => {
      const next = prev + delta;
      if (next < 0) {
        setViewYear((year) => year - 1);
        return 11;
      }
      if (next > 11) {
        setViewYear((year) => year + 1);
        return 0;
      }
      return next;
    });
  };

  const toggleDay = (dateKey: string) => {
    setSelectedDays((prev) =>
      prev.includes(dateKey) ? prev.filter((day) => day !== dateKey) : [...prev, dateKey]
    );
  };

  const clearPeriod = () => {
    setSelectedDays([]);
  };

  const resetFilters = () => {
    setCity("");
    setIndustry("");
    setCategory("");
    setVenue("");
    setRecommendedOnly(false);
    setBookingOnly(false);
    setSort("date-asc");
    clearPeriod();
  };

  const confirmCity = () => {
    setSelectedCity(cityDraft);
    setCity(cityDraft);
    setCityModalOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />

      <CityPickerModal
        open={cityModalOpen}
        onClose={() => setCityModalOpen(false)}
        detectedCity={detectedCity}
        cityDraft={cityDraft}
        setCityDraft={setCityDraft}
        districtDraft={districtDraft}
        setDistrictDraft={setDistrictDraft}
        onConfirm={confirmCity}
      />

      <main className="flex-1 mx-auto max-w-site w-full px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Выставки и мероприятия</h1>
          <p className="text-sm text-gray-600 mt-1">
            Город: {selectedCity} · Каталог мероприятий для участия
          </p>
        </div>

        <Button variant="outline" className="md:hidden w-full mb-4" onClick={() => setFilterDrawerOpen(true)}>
          <Filter className="h-4 w-4" />
          Фильтры
        </Button>

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

        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
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
                viewYear={viewYear}
                viewMonth={viewMonth}
                onShiftViewMonth={shiftViewMonth}
                selectedDays={selectedDays}
                onToggleDay={toggleDay}
                onClearPeriod={clearPeriod}
              />
            </div>
          </aside>

          <section>
            {loading ? (
              <LoadingState message="Загрузка мероприятий..." />
            ) : filteredEvents.length === 0 ? (
              <EmptyState
                title="Мероприятия не найдены"
                description="Измените фильтры или выберите другой период"
                actionLabel="Сбросить фильтры"
                onAction={resetFilters}
              />
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">Найдено: {filteredEvents.length}</p>
                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
          viewYear={viewYear}
          viewMonth={viewMonth}
          onShiftViewMonth={shiftViewMonth}
          selectedDays={selectedDays}
          onToggleDay={toggleDay}
          onClearPeriod={clearPeriod}
        />
        <Button className="w-full mt-4" onClick={() => setFilterDrawerOpen(false)}>Применить</Button>
      </Drawer>

      <Footer />
    </div>
  );
}
