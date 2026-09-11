"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { CatalogCard } from "@/components/catalog/catalog-card";
import { CatalogCardImageSlider } from "@/components/catalog/catalog-card-image-slider";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import type { Contractor } from "@/data/types";
import { useCatalogCardHoverScrub } from "@/lib/hooks/use-catalog-card-hover-scrub";
import { getContractorCardSlides } from "@/lib/utils/catalog-card-images";
import {
  getContractorCheckHref,
  getContractorProfileHref,
} from "@/lib/utils/contractor-profile-links";

interface ContractorCardProps {
  contractor: Contractor;
  cardIndex?: number;
  onInvite: (contractor: Contractor) => void;
}

export function ContractorCard({ contractor, cardIndex = 0, onInvite }: ContractorCardProps) {
  const slides = useMemo(
    () => getContractorCardSlides(contractor.id, contractor.name, cardIndex),
    [contractor.id, contractor.name, cardIndex],
  );
  const { scrubRatio, cardHoverHandlers } = useCatalogCardHoverScrub(slides.length);

  return (
    <CatalogCard className="relative flex flex-col h-full" {...cardHoverHandlers}>
      <Link
        href={getContractorProfileHref(contractor.id)}
        className="absolute inset-0 z-0"
        aria-label={`Открыть профиль ${contractor.name}`}
      />

      <CatalogCardImageSlider slides={slides} scrubRatio={scrubRatio} hoverScrub />

      <div className="relative z-10 flex flex-col flex-1 px-0 pt-3 pb-4 min-h-0 pointer-events-none">
        <div className="flex flex-col flex-1">
          <CardTitle className="text-sm font-semibold leading-snug">{contractor.name}</CardTitle>
          <CardDescription className="text-xs mt-1">
            {contractor.city} · {contractor.geography}
          </CardDescription>
          <p className="text-sm text-gray-700 mt-2 line-clamp-2 flex-1">{contractor.description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {contractor.categories.slice(0, 3).map((cat) => (
              <span key={cat} className="text-xs border border-[#d4d4d4] rounded-[10px] px-1.5 py-0.5">
                {cat}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-gray-900" />
            {contractor.rating} · {contractor.reviewCount} отзывов
          </p>
        </div>

        <div className="mt-auto pt-4 pointer-events-auto">
          <div className="flex w-full flex-col gap-2">
            <Button
              size="sm"
              variant="violet"
              className="w-full"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onInvite(contractor);
              }}
            >
              Пригласить в заявку
            </Button>
            <Link
              href={getContractorCheckHref(contractor.id)}
              className="block w-full"
            >
              <Button size="sm" variant="ghost" className="w-full">
                Проверка
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </CatalogCard>
  );
}