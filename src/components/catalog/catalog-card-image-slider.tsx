"use client";

import { useMemo, useState } from "react";
import { Heart, ImageIcon } from "lucide-react";
import { AdBadge } from "@/components/home/ad-badge";

export interface CatalogCardSlide {
  id: string;
  title?: string;
  imageUrl?: string;
}

interface CatalogCardImageSliderProps {
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  slides?: CatalogCardSlide[];
  scrubRatio?: number | null;
  hoverScrub?: boolean;
  sponsored?: boolean;
}

export function CatalogCardImageSlider({
  isFavorite = false,
  onToggleFavorite,
  slides = [],
  scrubRatio = null,
  hoverScrub = false,
  sponsored = false,
}: CatalogCardImageSliderProps) {
  const [index, setIndex] = useState(0);
  const [adMenuOpen, setAdMenuOpen] = useState(false);
  const hasSlides = slides.length > 0;

  const displayIndex = useMemo(() => {
    if (scrubRatio !== null && slides.length > 1) {
      return Math.min(slides.length - 1, Math.floor(scrubRatio * slides.length));
    }
    return index;
  }, [scrubRatio, slides.length, index]);

  const currentSlide = hasSlides ? slides[displayIndex] : null;
  const canCycle = slides.length > 1 && !hoverScrub;

  const goTo = (next: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (slides.length < 2) return;
    setIndex((next + slides.length) % slides.length);
  };

  const handlePhotoClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!canCycle) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const clickedLeft = event.clientX - rect.left < rect.width / 2;
    goTo(displayIndex + (clickedLeft ? -1 : 1), event);
  };

  return (
    <div className="relative z-[3] overflow-visible pointer-events-auto" aria-hidden={!hasSlides}>
      <div
        className="relative aspect-[16/10] w-full overflow-hidden rounded-t-[14px] bg-gray-50"
        onClick={canCycle ? handlePhotoClick : undefined}
      >
        {currentSlide?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentSlide.imageUrl}
            alt={currentSlide.title || "Фото карточки"}
            className="h-full w-full object-cover transition-opacity duration-150"
            loading="lazy"
            decoding="async"
            sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
            <ImageIcon className="h-6 w-6" />
            <span className="text-xs">{hasSlides ? "Без фото" : "Слайдер изображений"}</span>
          </div>
        )}

        {onToggleFavorite ? (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onToggleFavorite();
            }}
            className={`pointer-events-auto absolute top-2 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white/95 text-gray-500 shadow-sm transition-colors hover:text-gray-900 ${
              sponsored ? "left-2" : "right-2"
            }`}
            aria-label={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-gray-900 text-gray-900" : ""}`} />
          </button>
        ) : null}

        {hasSlides && slides.length > 1 ? (
          <div
            className="absolute bottom-2.5 left-1/2 z-10 flex h-[14px] w-[38px] -translate-x-1/2 items-center justify-center gap-1 rounded-[7px] bg-white/85"
            role="tablist"
            aria-label="Фото карточки"
          >
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-label={`Фото ${slideIndex + 1}`}
                aria-selected={slideIndex === displayIndex}
                className={`h-1.5 w-1.5 rounded-full p-0 ${
                  slideIndex === displayIndex ? "bg-[#101828]" : "bg-[#d1d5dc]"
                }`}
                onClick={(event) => goTo(slideIndex, event)}
              />
            ))}
          </div>
        ) : null}
      </div>

      {sponsored ? <AdBadge onOpenChange={setAdMenuOpen} /> : null}
    </div>
  );
}
