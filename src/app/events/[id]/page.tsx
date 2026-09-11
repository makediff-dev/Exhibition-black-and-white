"use client";

import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";
import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";
import { useLayoutEffect, useMemo, useState } from "react";
import { Calendar, MapPin, Users } from "lucide-react";
import { EventRemindersModal } from "@/components/events/event-reminders-modal";
import { CabinetAwareLayout } from "@/components/layout/cabinet-aware-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import {
  FEDERAL_DISTRICT_OPTIONS,
  getCitiesByDistrict,
  getDistrictByCity,
  SERVICE_CATEGORIES,
} from "@/constants/categories";
import {
  SEED_CONTRACTORS,
  SEED_EVENTS,
  SEED_HALLS,
  SEED_SERVICES,
} from "@/data/mocks/seed";
import type { Contractor, Event, UserRole } from "@/data/types";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { formatDate, formatShortDate } from "@/lib/utils/formatters";
import { getContractorProfileHref } from "@/lib/utils/contractor-profile-links";
import {
  getCabinetBackHref,
  resolveMessageRelatedHref,
  withFromParam,
} from "@/lib/utils/message-related-links";

const EVENT_CATEGORY_LABELS: Record<Event["category"], string> = {
  exhibition: "Выставка",
  forum: "Форум",
  conference: "Конференция",
};

const HALL_REMAINING_SPOTS: Record<string, string> = {
  "hall-1": "Осталось 14 мест",
  "hall-2": "Осталось 10 мест",
};

const ORGANIZER_VENUE_SERVICES = [
  "Аренда площади, заказ электричества и т.д.",
  "Заказ пропусков, и т.д.",
];

function FloorPlanPreview() {
  const { floorCells } = usePrototypeStore();
  const previewCells = floorCells.slice(0, 12);

  const statusClass = (status: string) => {
    switch (status) {
      case "free":
        return "bg-white border-gray-300 text-gray-700";
      case "booked":
        return "bg-gray-900 text-white border-gray-900";
      case "unavailable":
        return "bg-gray-200 text-gray-400 border-gray-300";
      default:
        return "bg-gray-100 border-gray-900";
    }
  };

  return (
    <div className="grid grid-cols-6 gap-1 max-w-md">
      {previewCells.map((cell) => (
        <div
          key={cell.id}
          className={`aspect-square flex items-center justify-center text-xs border ${statusClass(cell.status)}`}
          title={cell.label}
        >
          {cell.label}
        </div>
      ))}
    </div>
  );
}

function ContractorsGrid({
  contractors,
  moreHref,
  moreLabel,
  role,
  from,
}: {
  contractors: Contractor[];
  moreHref: string;
  moreLabel: string;
  role?: UserRole;
  from?: string | null;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {contractors.map((contractor) => (
        <Link
          key={contractor.id}
          href={getContractorProfileHref(contractor.id, {
            role,
            from: from ?? undefined,
          })}
        >
          <Card hoverable className="h-full">
            <CardTitle>{contractor.name}</CardTitle>
            <div className="flex flex-wrap gap-1 mt-2">
              {contractor.categories.map((category) => (
                <span key={category} className="text-xs border border-[#d4d4d4] rounded-[10px] px-2 py-0.5">
                  {category}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              ★ {contractor.rating} · {contractor.reviewCount} отзывов
            </p>
          </Card>
        </Link>
      ))}
      <Link href={moreHref}>
        <Card hoverable className="h-full border-dashed flex items-center justify-center min-h-[120px]">
          <CardTitle className="text-sm font-normal text-center px-4">{moreLabel}</CardTitle>
        </Card>
      </Link>
    </div>
  );
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = useAuthStore((state) => state.user?.role);
  const id = params.id as string;
  const event = SEED_EVENTS.find((e) => e.id === id);
  const from = searchParams.get("from");
  const fromMessages = from === "messages";
  const bookingHref = from
    ? withFromParam(`/events/${id}/booking`, from)
    : `/events/${id}/booking`;

  useLayoutEffect(() => {
    if (!fromMessages || !event) return;
    const cabinetHref = resolveMessageRelatedHref(
      { relatedType: "event", relatedId: event.id, relatedLink: `/events/${event.id}` },
      role
    );
    if (cabinetHref.startsWith("/account/")) {
      const [path, query = ""] = cabinetHref.split("?");
      const nextParams = new URLSearchParams(query);
      nextParams.set("from", "messages");
      router.replace(`${path}?${nextParams.toString()}`);
    }
  }, [event, fromMessages, role, router]);
  const [localCategory, setLocalCategory] = useState("");
  const [regionCategory, setRegionCategory] = useState("");
  const [contractorRegion, setContractorRegion] = useState(
    () => getDistrictByCity(SEED_EVENTS.find((e) => e.id === id)?.city ?? "")
  );
  const [contractorCity, setContractorCity] = useState(
    () => SEED_EVENTS.find((e) => e.id === id)?.city ?? ""
  );
  const [remindersModalOpen, setRemindersModalOpen] = useState(false);

  const contractorCategoryOptions = useMemo(
    () => [
      { value: "", label: "Все категории" },
      ...SERVICE_CATEGORIES.map((category) => ({ value: category, label: category })),
    ],
    []
  );

  const contractorCityOptions = useMemo(() => {
    const cities = contractorRegion ? getCitiesByDistrict(contractorRegion) : [];
    return [
      { value: "", label: "Все города региона" },
      ...cities.map((city) => ({ value: city, label: city })),
    ];
  }, [contractorRegion]);

  const localFilteredContractors = useMemo(() => {
    let list = SEED_CONTRACTORS.filter((contractor) => contractor.city === event?.city);

    if (localCategory) {
      list = list.filter((contractor) => contractor.categories.includes(localCategory));
    }

    return list;
  }, [event?.city, localCategory]);

  const regionFilteredContractors = useMemo(() => {
    let list = SEED_CONTRACTORS;

    if (contractorRegion) {
      const regionCities = getCitiesByDistrict(contractorRegion);
      list = list.filter((contractor) => regionCities.includes(contractor.city));
    }

    if (contractorCity) {
      list = list.filter((contractor) => contractor.city === contractorCity);
    }

    if (regionCategory) {
      list = list.filter((contractor) => contractor.categories.includes(regionCategory));
    }

    return list;
  }, [contractorRegion, contractorCity, regionCategory]);

  const handleContractorRegionChange = (region: string) => {
    setContractorRegion(region);
    if (!region) {
      setContractorCity("");
      return;
    }
    const cities = getCitiesByDistrict(region);
    setContractorCity((currentCity) => (currentCity && cities.includes(currentCity) ? currentCity : ""));
  };

  const services = useMemo(
    () => SEED_SERVICES.filter((s) => event?.relatedServiceIds.includes(s.id)),
    [event]
  );

  const halls = useMemo(
    () => SEED_HALLS.filter((h) => h.venueId === event?.venueId),
    [event]
  );

  if (!event) notFound();

  return (
    <CabinetAwareLayout>
      <BackButton fallbackHref={getCabinetBackHref(from, "/events", role)} className="mb-4" />

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline">{EVENT_CATEGORY_LABELS[event.category]}</Badge>
              <Badge variant="dashed">{event.industry}</Badge>
              {event.bookingAvailable && (
                <Badge variant="solid">Бронирование в тестовом режиме</Badge>
              )}
            </div>

            <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
            <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
              <MapPin className="h-4 w-4" />
              {event.city} · {event.venue}
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(event.startDate)} — {formatDate(event.endDate)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <Button type="button" variant="outline" onClick={() => setRemindersModalOpen(true)}>
              Подключить напоминания
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-2">Описание</h2>
              <p className="text-sm text-gray-700">{event.description}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <Link href={`/services?city=${encodeURIComponent(event.city)}`}>
                  <Button variant="primary">Найти услуги</Button>
                </Link>
                {event.bookingAvailable && (
                  <Link href={bookingHref}>
                    <Button variant="outline">Забронировать площадь</Button>
                  </Link>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Условия участия</h2>
              <p className="text-sm text-gray-700 catalog-content-box p-4">{event.participationTerms}</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">Услуги организаторов и площадки проведения</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {ORGANIZER_VENUE_SERVICES.map((service) => (
                  <Card key={service} className="h-full">
                    <CardTitle className="text-sm font-normal">{service}</CardTitle>
                  </Card>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">Связанные услуги</h2>
              {services.length === 0 ? (
                <p className="text-sm text-gray-600">Услуги не указаны</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {services.map((service) => (
                    <Link key={service.id} href={`/services/${service.id}`}>
                      <Card hoverable className="h-full">
                        <CardTitle>{service.title}</CardTitle>
                        <CardDescription>{service.contractorName}</CardDescription>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
                <Users className="h-5 w-5" />
                Исполнители в городе ({event.city})
                {localCategory ? ` · ${localCategory}` : ""}
              </h2>
              <div className="flex flex-wrap gap-2 mb-4 max-w-md">
                <Select
                  label="Категория"
                  value={localCategory}
                  onChange={(e) => setLocalCategory(e.target.value)}
                  options={contractorCategoryOptions}
                  className="min-w-[220px]"
                />
              </div>
              <ContractorsGrid
                contractors={localFilteredContractors}
                moreHref={
                  localCategory
                    ? `/contractors?city=${encodeURIComponent(event.city)}&category=${encodeURIComponent(localCategory)}`
                    : `/contractors?city=${encodeURIComponent(event.city)}`
                }
                moreLabel="Больше исполнителей в городе"
                role={role}
                from={from}
              />
            </section>

            <section>
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
                <Users className="h-5 w-5" />
                Исполнители по регионам
                ({contractorCity || contractorRegion || "вся Россия"})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4 max-w-3xl">
                <Select
                  label="Регион"
                  value={contractorRegion}
                  onChange={(e) => handleContractorRegionChange(e.target.value)}
                  options={[
                    { value: "", label: "Все регионы" },
                    ...FEDERAL_DISTRICT_OPTIONS.map((region) => ({
                      value: region,
                      label: region,
                    })),
                  ]}
                />
                <Select
                  label="Город"
                  value={contractorCity}
                  onChange={(e) => setContractorCity(e.target.value)}
                  options={contractorCityOptions}
                  disabled={!contractorRegion}
                />
                <Select
                  label="Категория"
                  value={regionCategory}
                  onChange={(e) => setRegionCategory(e.target.value)}
                  options={contractorCategoryOptions}
                />
              </div>
              <ContractorsGrid
                contractors={regionFilteredContractors}
                moreHref={(() => {
                  const params = new URLSearchParams();
                  if (contractorCity) params.set("city", contractorCity);
                  if (regionCategory) params.set("category", regionCategory);
                  const query = params.toString();
                  return query ? `/contractors?${query}` : "/contractors";
                })()}
                moreLabel="Больше исполнителей по регионам"
                role={role}
                from={from}
              />
            </section>
          </div>

          <aside className="space-y-6">
            <section className="catalog-content-box p-4">
              <h2 className="text-base font-semibold mb-3">Доступные площади</h2>
              <div className="space-y-2">
                {halls.map((hall) => (
                  <div key={hall.id} className="text-sm border-b border-gray-200 pb-2 last:border-0">
                    <p className="font-medium">{hall.name}</p>
                    <p className="text-gray-600">{hall.area} м² · до {hall.capacity} участников</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant={hall.available ? "outline" : "dashed"}>
                        {hall.available ? "Доступен" : "Занят"}
                      </Badge>
                      {hall.available && HALL_REMAINING_SPOTS[hall.id] && (
                        <span className="text-xs text-gray-600">{HALL_REMAINING_SPOTS[hall.id]}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="catalog-content-box p-4">
              <h2 className="text-base font-semibold mb-3">План площадки</h2>
              <FloorPlanPreview />
              {event.bookingAvailable && (
                <Link href={bookingHref} className="block mt-4">
                  <Button className="w-full" variant="primary" size="sm">Бронирование в тестовом режиме</Button>
                </Link>
              )}
            </section>

            <section className="catalog-content-box p-4 text-sm space-y-2">
              <p><span className="font-medium">Период:</span> {formatShortDate(event.startDate)} — {formatShortDate(event.endDate)}</p>
              <p><span className="font-medium">Организатор ID:</span> {event.organizerId}</p>
              <p><span className="font-medium">ОКВЭД-теги:</span> {event.okvedTags.join(", ")}</p>
            </section>
          </aside>
        </div>

      <EventRemindersModal
        open={remindersModalOpen}
        onClose={() => setRemindersModalOpen(false)}
        event={event}
      />
    </CabinetAwareLayout>
  );
}