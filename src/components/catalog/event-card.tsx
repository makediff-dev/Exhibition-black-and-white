"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Calendar, MapPin, Sparkles } from "lucide-react";
import { CatalogCard } from "@/components/catalog/catalog-card";
import { CatalogCardImageSlider } from "@/components/catalog/catalog-card-image-slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import type { Event } from "@/data/types";
import { formatShortDate } from "@/lib/utils/formatters";
import { useCatalogCardHoverScrub } from "@/lib/hooks/use-catalog-card-hover-scrub";
import { getEventCardSlides } from "@/lib/utils/catalog-card-images";

const EVENT_CATEGORY_LABELS: Record<Event["category"], string> = {
  exhibition: "Выставка",
  forum: "Форум",
  conference: "Конференция",
};

interface EventCardProps {
  event: Event;
  recommended?: boolean;
  imageIndex?: number;
}

export function EventCard({ event, recommended = false, imageIndex = 0 }: EventCardProps) {
  const slides = useMemo(
    () => getEventCardSlides(event, imageIndex),
    [event, imageIndex],
  );
  const { scrubRatio, cardHoverHandlers } = useCatalogCardHoverScrub(slides.length);

  return (
    <CatalogCard className="relative flex flex-col h-full pb-4" {...cardHoverHandlers}>
      <Link
        href={`/events/${event.id}`}
        className="absolute inset-0 z-0"
        aria-label={`Открыть мероприятие «${event.title}»`}
      />

      <CatalogCardImageSlider slides={slides} scrubRatio={scrubRatio} hoverScrub />

      <div className="relative z-10 flex flex-col flex-1 px-0 pt-3 min-h-0">
        <div className="flex flex-col flex-1 pointer-events-none">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="outline">{EVENT_CATEGORY_LABELS[event.category]}</Badge>
            {recommended ? (
              <Badge variant="dashed" icon={Sparkles}>
                Рекомендуем
              </Badge>
            ) : null}
          </div>
          <CardTitle className="text-sm font-semibold leading-snug">{event.title}</CardTitle>
          <CardDescription className="flex items-center gap-1 text-xs mt-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {event.city} · {event.venue}
          </CardDescription>
          <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatShortDate(event.startDate)} — {formatShortDate(event.endDate)}
          </p>
          <p className="text-sm text-gray-700 mt-2 line-clamp-2 flex-1">{event.description}</p>
          <div className="mt-3 space-y-1 text-xs text-gray-600">
            <p>
              <span className="font-medium text-gray-900">Отрасль:</span> {event.industry}
            </p>
            <p>
              <span className="font-medium text-gray-900">Услуг:</span> {event.relatedServiceIds.length}
            </p>
          </div>
        </div>

        <div className="mt-auto pt-4 pointer-events-auto">
          <Link href={`/events/${event.id}`} className="block w-full">
            <Button size="sm" variant="teal" className="w-full">
              Подробнее
            </Button>
          </Link>
        </div>
      </div>
    </CatalogCard>
  );
}