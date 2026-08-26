"use client";

import Link from "next/link";
import { Building2, Calendar, MapPin, Maximize2 } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { PublicVenue } from "@/constants/venues";
import { SEED_EVENTS } from "@/data/mocks/seed";
import { getVenueStats } from "@/lib/utils/venue-stats";
import { formatPrice, formatShortDate } from "@/lib/utils/formatters";

interface VenueDetailSectionProps {
  venue: PublicVenue;
}

export function VenueDetailSection({ venue }: VenueDetailSectionProps) {
  const stats = venue.catalogId ? getVenueStats(venue.catalogId) : null;
  const relatedEvents = SEED_EVENTS.filter(
    (event) => event.venue === venue.name || event.venueId === venue.catalogId,
  );

  return (
    <div className="space-y-8">
      <BackButton fallbackHref="/venues" />

      <section className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-8 items-start">
        <div className="space-y-6">
          <div className="overflow-hidden border border-gray-200 rounded-[14px] bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={venue.imageUrl} alt="" className="w-full h-[320px] object-cover" />
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
                  {stats.priceMin > 0 ? (
                    <p>
                      Аренда: {formatPrice(stats.priceMin)}
                      {stats.priceMax > stats.priceMin ? ` – ${formatPrice(stats.priceMax)}` : ""} / кв. м
                    </p>
                  ) : null}
                  <p>Свободных залов: {stats.freeHalls}</p>
                </>
              ) : null}
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Link href={`/events?venue=${encodeURIComponent(venue.name)}`}>
                <Button className="w-full" variant="pink">Смотреть мероприятия</Button>
              </Link>
              <Link href="/register">
                <Button variant="soft-outline" className="w-full">
                  Связаться с площадкой
                </Button>
              </Link>
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
                <Card className="h-full hover:border-gray-900">
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
