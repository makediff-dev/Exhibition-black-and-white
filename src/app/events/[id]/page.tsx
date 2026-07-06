"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useMemo } from "react";
import { Calendar, MapPin, Users } from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  SEED_CONTRACTORS,
  SEED_EVENTS,
  SEED_HALLS,
  SEED_SERVICES,
} from "@/data/mocks/seed";
import type { Event } from "@/data/types";
import { usePrototypeStore } from "@/lib/store";
import { formatDate, formatShortDate } from "@/lib/utils/formatters";

const EVENT_CATEGORY_LABELS: Record<Event["category"], string> = {
  exhibition: "Выставка",
  forum: "Форум",
  conference: "Конференция",
};

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

export default function EventDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const event = SEED_EVENTS.find((e) => e.id === id);

  const services = useMemo(
    () => SEED_SERVICES.filter((s) => event?.relatedServiceIds.includes(s.id)),
    [event]
  );

  const contractorsInCity = useMemo(
    () => SEED_CONTRACTORS.filter((c) => c.city === event?.city),
    [event]
  );

  const halls = useMemo(
    () => SEED_HALLS.filter((h) => h.venueId === event?.venueId),
    [event]
  );

  if (!event) notFound();

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8">
        <Link href="/events" className="text-sm underline mb-4 inline-block">← Все мероприятия</Link>

        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline">{EVENT_CATEGORY_LABELS[event.category]}</Badge>
          <Badge variant="dashed">{event.industry}</Badge>
          {event.bookingAvailable && <Badge variant="solid">Бронирование доступно</Badge>}
        </div>

        <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
        <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
          <MapPin className="h-4 w-4" />
          {event.city} · {event.venue}
        </p>
        <p className="text-sm text-gray-600 flex items-center gap-1 mb-6">
          <Calendar className="h-4 w-4" />
          {formatDate(event.startDate)} — {formatDate(event.endDate)}
        </p>

        <div className="flex flex-wrap gap-2 mb-8">
          <Link href={`/requests/new?eventId=${event.id}`}>
            <Button>Разместить заявку</Button>
          </Link>
          <Link href={`/services?city=${encodeURIComponent(event.city)}`}>
            <Button variant="outline">Найти услуги</Button>
          </Link>
          {event.bookingAvailable && (
            <Link href={`/events/${event.id}/booking`}>
              <Button variant="secondary">Забронировать площадь</Button>
            </Link>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-2">Описание</h2>
              <p className="text-sm text-gray-700">{event.description}</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Условия участия</h2>
              <p className="text-sm text-gray-700 border border-gray-300 p-4">{event.participationTerms}</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">Связанные услуги</h2>
              {services.length === 0 ? (
                <p className="text-sm text-gray-600">Услуги не указаны</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {services.map((service) => (
                    <Link key={service.id} href={`/services/${service.id}`}>
                      <Card className="hover:border-gray-900 h-full">
                        <CardTitle>{service.title}</CardTitle>
                        <CardDescription>{service.contractorName}</CardDescription>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Исполнители в городе ({event.city})
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {contractorsInCity.map((contractor) => (
                  <Link key={contractor.id} href={`/contractors/${contractor.id}`}>
                    <Card className="hover:border-gray-900 h-full">
                      <CardTitle>{contractor.name}</CardTitle>
                      <CardDescription>{contractor.categories.slice(0, 2).join(", ")}</CardDescription>
                      <p className="text-xs text-gray-600 mt-2">★ {contractor.rating} · {contractor.reviewCount} отзывов</p>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="border border-gray-300 p-4">
              <h2 className="text-base font-semibold mb-3">Доступные площади</h2>
              <div className="space-y-2">
                {halls.map((hall) => (
                  <div key={hall.id} className="text-sm border-b border-gray-200 pb-2 last:border-0">
                    <p className="font-medium">{hall.name}</p>
                    <p className="text-gray-600">{hall.area} м² · до {hall.capacity} участников</p>
                    <Badge variant={hall.available ? "outline" : "dashed"} className="mt-1">
                      {hall.available ? "Доступен" : "Занят"}
                    </Badge>
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-gray-300 p-4">
              <h2 className="text-base font-semibold mb-3">План площадки</h2>
              <p className="text-xs text-gray-600 mb-3">Предпросмотр схемы зала (демо)</p>
              <FloorPlanPreview />
              {event.bookingAvailable && (
                <Link href={`/events/${event.id}/booking`} className="block mt-4">
                  <Button className="w-full" size="sm">Открыть бронирование</Button>
                </Link>
              )}
            </section>

            <section className="border border-gray-300 p-4 text-sm space-y-2">
              <p><span className="font-medium">Период:</span> {formatShortDate(event.startDate)} — {formatShortDate(event.endDate)}</p>
              <p><span className="font-medium">Организатор ID:</span> {event.organizerId}</p>
              <p><span className="font-medium">ОКВЭД-теги:</span> {event.okvedTags.join(", ")}</p>
            </section>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
