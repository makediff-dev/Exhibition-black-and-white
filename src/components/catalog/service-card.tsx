"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Heart, ImageIcon, ShoppingCart } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
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

interface ServiceCardImageSliderPlaceholderProps {
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

function ServiceCardImageSliderPlaceholder({
  isFavorite = false,
  onToggleFavorite,
}: ServiceCardImageSliderPlaceholderProps) {
  return (
    <div
      className="relative aspect-[16/10] overflow-hidden border-b border-dashed border-gray-300 bg-gray-50"
      aria-hidden
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
        <ImageIcon className="h-6 w-6" />
        <span className="text-xs">Слайдер изображений</span>
      </div>

      {onToggleFavorite && (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onToggleFavorite();
          }}
          className="pointer-events-auto absolute top-2 right-2 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white/95 text-gray-500 shadow-sm transition-colors hover:text-gray-900"
          aria-label={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
        >
          <Heart
            className={`h-4 w-4 ${isFavorite ? "fill-gray-900 text-gray-900" : ""}`}
          />
        </button>
      )}

      <div className="absolute left-2 top-1/2 -translate-y-1/2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-white/90 text-gray-500">
          <ChevronLeft className="h-3.5 w-3.5 shrink-0" />
        </span>
      </div>
      <div className="absolute right-2 top-1/2 -translate-y-1/2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-white/90 text-gray-500">
          <ChevronRight className="h-3.5 w-3.5 shrink-0 translate-x-px" />
        </span>
      </div>

      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-gray-900" />
        <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
        <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
      </div>
    </div>
  );
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

      <ServiceCardImageSliderPlaceholder
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
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

      <div className="relative z-10 flex gap-2 px-4 pb-4 pt-0 pointer-events-auto">
        <div className="flex w-full gap-2 border-t border-gray-200 pt-4">
          <Link
            href={`/contractors/${service.contractorId}#portfolio`}
            onClick={(event) => event.stopPropagation()}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded border border-gray-900 bg-white px-3 py-1.5 text-xs font-medium text-gray-900 transition-colors hover:bg-gray-50"
          >
            Портфолио
          </Link>
          {onAdd && (
            <Button size="sm" className="flex-1" onClick={onAdd}>
              <ShoppingCart className="h-4 w-4 mr-1" />
              В корзину
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
