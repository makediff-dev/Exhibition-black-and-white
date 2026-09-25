"use client";

import Link from "next/link";
import { Building2, Calendar, MapPin, Maximize2 } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { PublicVenue } from "@/constants/venues";
import { SEED_EVENTS } from "@/data/mocks/seed";
import { formatShortDate } from "@/lib/utils/formatters";
import { formatVenuePriceRange, getVenueStats } from "@/lib/utils/venue-stats";
import { useAuthStore } from "@/lib/store";
import { canContactVenue } from "@/lib/auth/authorization";
import { buildMessagesContextHref, canonicalizeEntityId } from "@/lib/domain/entity-ref";

interface VenueDetailSectionProps {
  venue: PublicVenue;
}

export function VenueDetailSection({ venue }: VenueDetailSectionProps) {
  const user = useAuthStore((state) => state.user);
  const venueKey = canonicalizeEntityId("venue", venue.id);
  const contact = canContactVenue(user, venueKey);
  const returnUrl = `/venues/${venue.id}`;
  const stats = venue.catalogId ? getVenueStats(venue.catalogId) : null;
  const relatedEvents = SEED_EVENTS.filter(
    (event) => event.venue === venue.name || event.venueId === venue.catalogId,
  );

  return (
    <div className="space-y-8">
      <BackButton fallbackHref="/venues" />

      <section className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-8 items-start">
        <div className="space-y-6">
          <div className="overflow-hidden border border-gray-200 rounded-[14px] bg-gray-100 aspect-video w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={venue.imageUrl} alt="" className="h-full w-full object-cover" />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">{venue.name}</h1>
            <p className="mt-2 text-sm text-gray-600 flex items-center gap-1">
              <MapPin className="h-4 w-4 shrink-0" />
              {venue.city}
              {venue.address ? ` · ${venue.address}` : ""}
            </p>
            {venue.legalName ? (
              <p className="mt-1 text-sm text-gray-500">{venue.legalName}</p>
            ) : null}
          </div>

          <p className="text-sm leading-6 text-gray-700">{venue.description}</p>

          {stats && stats.halls.length > 0 ? (
            <div>
              <h2 className="text-lg font-semibold mb-3">Залы и павильоны</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {stats.halls.map((hall) => (
                  <Card key={hall.id}>
                    <CardTitle className="text-base">{hall.name}</CardTitle>
                    <CardDescription className="mt-2 space-y-1">
                      <p>{hall.area.toLocaleString("ru-RU")} кв. м</p>
                      <p>Вместимость: {hall.capacity} стендов</p>
                      <Badge variant={hall.available ? "outline" : "dashed"}>
                        {hall.available ? "Доступен" : "Занят"}
                      </Badge>
                    </CardDescription>
                  </Card>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <Card>
            <CardTitle className="text-base">О площадке</CardTitle>
            <div className="mt-4 space-y-3 text-sm text-gray-700">
              <p className="flex items-start gap-2">
                <Building2 className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{venue.halls}</span>
              </p>
              {stats ? (
                <>
                  <p className="flex items-start gap-2">
                    <Maximize2 className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{stats.totalArea.toLocaleString("ru-RU")} кв. м суммарно</span>
                  </p>
                  <p>Аренда: {formatVenuePriceRange(stats.priceMin, stats.priceMax)}</p>
                  <p>Свободных залов: {stats.freeHalls}</p>
                  <p>
                    Загрузка {stats.occupancyPercent}% за{" "}
                    {formatShortDate(stats.occupancyPeriodStart)} —{" "}
                    {formatShortDate(stats.occupancyPeriodEnd)}
                    {stats.preliminaryOccupancyPercent > 0
                      ? ` · предварительно ${stats.preliminaryOccupancyPercent}%`
                      : ""}
                  </p>
                  <p>
                    Занято {stats.occupiedArea.toLocaleString("ru-RU")} кв.м · свободно{" "}
                    {stats.freeArea.toLocaleString("ru-RU")} кв.м
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {stats.occupancyExplanation}
                  </p>
                </>
              ) : null}
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Link href={`/events?venue=${encodeURIComponent(venue.name)}`}>
                <Button className="w-full" variant="primary">Смотреть мероприятия</Button>
              </Link>
              {!user ? (
                <Link href={`/login?returnUrl=${encodeURIComponent(returnUrl)}`}>
                  <Button variant="outline" className="w-full">
                    Связаться с площадкой
                  </Button>
                </Link>
              ) : contact.allowed ? (
                <Link href={buildMessagesContextHref({ type: "venue", id: venueKey })}>
                  <Button variant="outline" className="w-full">
                    Связаться с площадкой
                  </Button>
                </Link>
              ) : (
                <p className="text-xs text-gray-600">{contact.reason}</p>
              )}
            </div>
          </Card>
        </aside>
      </section>

      <section>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold">Мероприятия на площадке</h2>
          <Link href={`/events?venue=${encodeURIComponent(venue.name)}`} className="text-sm underline">
            Все мероприятия
          </Link>
        </div>

        {relatedEvents.length === 0 ? (
          <Card>
            <CardDescription className="p-4">
              На этой площадке пока нет опубликованных мероприятий в каталоге.
            </CardDescription>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedEvents.slice(0, 6).map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card hoverable className="h-full">
                  <CardTitle className="text-base">{event.title}</CardTitle>
                  <CardDescription className="mt-2 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    {formatShortDate(event.startDate)} — {formatShortDate(event.endDate)}
                  </CardDescription>
                  <p className="text-sm text-gray-700 mt-2 line-clamp-2">{event.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}