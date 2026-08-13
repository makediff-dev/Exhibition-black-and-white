"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { CatalogCardImageSlider } from "@/components/catalog/catalog-card-image-slider";
import { usePrototypeStore } from "@/lib/store";
import { formatServicePrice } from "@/lib/utils/formatters";
import type { Service } from "@/data/types";
import { Button } from "@/components/ui/button";

interface ServiceCardProps {
  service: Service;
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
  isFavorite = false,
  onToggleFavorite,
  onAdd,
}: ServiceCardProps) {
  const allServices = usePrototypeStore((s) => s.services);
  const contractorServicesCount = allServices.filter(
    (item) => item.contractorId === service.contractorId,
  ).length;
  const contractorServicesLabel = formatContractorServicesLabel(contractorServicesCount);

  return (
    <Card className="relative flex flex-col h-full overflow-hidden p-0 hover:border-gray-900 transition-colors">
      <Link
        href={`/services/${service.id}`}
        className="absolute inset-0 z-0"
        aria-label={`Открыть услугу «${service.title}»`}
      />

      <CatalogCardImageSlider
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
        slides={service.photoCards
          ?.filter((card) => card.imageUrl)
          .map((card) => ({ id: card.id, title: card.title, imageUrl: card.imageUrl }))}
      />

      <div className="relative z-10 flex flex-col flex-1 p-4 pointer-events-none">
        <CardTitle className="text-base">{service.title}</CardTitle>
        <p className="text-xs text-gray-600 mt-1">
          {service.contractorName} · {service.city}
        </p>
        <p className="text-lg font-semibold mt-3">
          {formatServicePrice(service)}
        </p>
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

      <div className="relative z-10 flex flex-col gap-2 px-4 pb-4 pt-0 pointer-events-auto">
        <div className="flex w-full flex-col gap-2 border-t border-gray-200 pt-4">
          {onAdd && (
            <Button size="sm" className="w-full" onClick={onAdd}>
              <ShoppingCart className="h-4 w-4 mr-1" />
              В корзину
            </Button>
          )}
          <Link
            href={`/contractors/${service.contractorId}#portfolio`}
            onClick={(event) => event.stopPropagation()}
            className="inline-flex w-full items-center justify-center gap-2 rounded border border-gray-900 bg-white px-3 py-1.5 text-xs font-medium text-gray-900 transition-colors hover:bg-gray-50"
          >
            Портфолио
          </Link>
        </div>
      </div>
    </Card>
  );
}
