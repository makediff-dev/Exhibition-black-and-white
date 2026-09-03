"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Building2, MapPin } from "lucide-react";
import { CatalogCard } from "@/components/catalog/catalog-card";
import { CatalogCardImageSlider } from "@/components/catalog/catalog-card-image-slider";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import type { PublicVenue } from "@/constants/venues";
import { getVenueStats } from "@/lib/utils/venue-stats";
import { formatPrice } from "@/lib/utils/formatters";
import { useCatalogCardHoverScrub } from "@/lib/hooks/use-catalog-card-hover-scrub";
import { getVenueCardSlides } from "@/lib/utils/catalog-card-images";

interface VenueCardProps {
  venue: PublicVenue;
  cardIndex?: number;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function VenueCard({
  venue,
  cardIndex = 0,
  isFavorite = false,
  onToggleFavorite,
}: VenueCardProps) {
  const stats = venue.catalogId ? getVenueStats(venue.catalogId) : null;
  const slides = useMemo(
    () => getVenueCardSlides(venue, cardIndex),
    [venue, cardIndex],
  );
  const { scrubRatio, cardHoverHandlers } = useCatalogCardHoverScrub(slides.length);

  return (
    <CatalogCard className="relative flex flex-col h-full pb-4" {...cardHoverHandlers}>
      <Link
        href={`/venues/${venue.id}`}
        className="absolute inset-0 z-0"
        aria-label={`Открыть площадку «${venue.name}»`}
      />

      <CatalogCardImageSlider
        isFavorite={Boolean(onToggleFavorite)}
        onToggleFavorite={onToggleFavorite}
        slides={slides}
        scrubRatio={scrubRatio}
        hoverScrub
      />

      <div className="relative z-10 flex flex-col flex-1 px-0 pt-3 min-h-0">
        <div className="flex flex-col flex-1 pointer-events-none">
          <CardTitle className="text-sm font-semibold leading-snug">{venue.name}</CardTitle>
          <CardDescription className="flex items-center gap-1 text-xs mt-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {venue.city}
          </CardDescription>
          <p className="text-sm text-gray-700 mt-2 line-clamp-2 flex-1">{venue.description}</p>
          <div className="mt-3 space-y-1 text-xs text-gray-600">
            <p className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              {venue.halls}
            </p>
            {stats && stats.totalArea > 0 ? (
              <p>{stats.totalArea.toLocaleString("ru-RU")} кв. м · свободно залов: {stats.freeHalls}</p>
            ) : null}
            {stats && stats.priceMin > 0 ? (
              <p>
                от {formatPrice(stats.priceMin)}
                {stats.priceMax > stats.priceMin ? " / кв. м" : ""}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-auto pt-4 pointer-events-auto">
          <Link href={`/venues/${venue.id}`} className="block w-full">
            <Button size="sm" variant="pink" className="w-full">
              Подробнее
            </Button>
          </Link>
        </div>
      </div>
    </CatalogCard>
  );
}