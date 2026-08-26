"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CatalogCard } from "@/components/catalog/catalog-card";
import { CatalogCardImageSlider } from "@/components/catalog/catalog-card-image-slider";
import { CardTitle } from "@/components/ui/card";
import { usePrototypeStore } from "@/lib/store";
import { formatServicePrice } from "@/lib/utils/formatters";
import type { Service } from "@/data/types";
import { Button } from "@/components/ui/button";
import { useCatalogCardHoverScrub } from "@/lib/hooks/use-catalog-card-hover-scrub";
import { getServiceCardSlides } from "@/lib/utils/catalog-card-images";

interface ServiceCardProps {
  service: Service;
  cardIndex?: number;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onAdd?: () => void;
}

function formatContractorServicesLabel(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) {
    return `${count} услуга у исполнителя`;
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${count} услуги у исполнителя`;
  }
  return `${count} услуг у исполнителя`;
}

export function ServiceCard({
  service,
  cardIndex = 0,
  isFavorite = false,
  onToggleFavorite,
  onAdd,
}: ServiceCardProps) {
  const allServices = usePrototypeStore((s) => s.services);
  const contractorServicesCount = allServices.filter(
    (item) => item.contractorId === service.contractorId,
  ).length;
  const contractorServicesLabel = formatContractorServicesLabel(contractorServicesCount);

  const slides = useMemo(
    () => getServiceCardSlides(service, cardIndex),
    [service, cardIndex],
  );
  const { scrubRatio, cardHoverHandlers } = useCatalogCardHoverScrub(slides.length);

  return (
    <CatalogCard className="relative flex flex-col h-full pb-4" {...cardHoverHandlers}>
      <Link
        href={`/services/${service.id}`}
        className="absolute inset-0 z-0"
        aria-label={`Открыть услугу «${service.title}»`}
      />

      <CatalogCardImageSlider
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
        slides={slides}
        scrubRatio={scrubRatio}
        hoverScrub
      />

      <div className="relative z-10 flex flex-col flex-1 px-0 pt-3 min-h-0">
        <div className="flex flex-col flex-1 pointer-events-none">
          <CardTitle className="text-sm font-semibold leading-snug">{service.title}</CardTitle>
          <p className="text-xs text-gray-600 mt-1">
            {service.contractorName} · {service.city}
          </p>
          <p className="text-lg font-semibold mt-3">{formatServicePrice(service)}</p>
          <p className="text-xs text-gray-600 mt-1">
            ★ {service.rating} · {service.reviewCount} отзывов
          </p>
          <Link
            href={`/services?contractor=${service.contractorId}`}
            onClick={(event) => event.stopPropagation()}
            className="pointer-events-auto text-xs text-gray-900 underline mt-1 w-fit"
          >
            {contractorServicesLabel}
          </Link>
        </div>

        <div className="mt-auto pt-4 pointer-events-auto">
          <div className="flex w-full flex-col gap-2">
            {onAdd && (
            <Button size="sm" variant="green" className="w-full" onClick={onAdd}>
              В корзину
            </Button>
            )}
            <Link
              href={`/contractors/${service.contractorId}#portfolio`}
              onClick={(event) => event.stopPropagation()}
              className="block w-full"
            >
              <Button size="sm" variant="ghost" className="w-full">
                Портфолио
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </CatalogCard>
  );
}
