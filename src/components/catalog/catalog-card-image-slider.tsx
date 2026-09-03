"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Heart, ImageIcon } from "lucide-react";

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
}

export function CatalogCardImageSlider({
  isFavorite = false,
  onToggleFavorite,
  slides = [],
  scrubRatio = null,
  hoverScrub = false,
}: CatalogCardImageSliderProps) {
  const [index, setIndex] = useState(0);
  const hasSlides = slides.length > 0;

  const displayIndex = useMemo(() => {
    if (scrubRatio !== null && slides.length > 1) {
      return Math.min(slides.length - 1, Math.floor(scrubRatio * slides.length));
    }
    return index;
  }, [scrubRatio, slides.length, index]);

  const currentSlide = hasSlides ? slides[displayIndex] : null;
  const showControls = hasSlides && slides.length > 1 && !hoverScrub;

  const goPrev = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!hasSlides) return;
    setIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goNext = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!hasSlides) return;
    setIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      className="relative aspect-[16/10] overflow-hidden rounded-t-[14px] bg-gray-50"
      aria-hidden={!hasSlides}
    >
      {currentSlide?.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentSlide.imageUrl}
          alt={currentSlide.title || "Фото карточки"}
          className="h-full w-full object-cover transition-opacity duration-150"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
          <ImageIcon className="h-6 w-6" />
          <span className="text-xs">{hasSlides ? "Без фото" : "Слайдер изображений"}</span>
        </div>
      )}

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

      {showControls && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="pointer-events-auto absolute left-2 top-1/2 -translate-y-1/2 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-white/90 text-gray-500"
            aria-label="Предыдущее фото"
          >
            <ChevronLeft className="h-3.5 w-3.5 shrink-0" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="pointer-events-auto absolute right-2 top-1/2 -translate-y-1/2 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-white/90 text-gray-500"
            aria-label="Следующее фото"
          >
            <ChevronRight className="h-3.5 w-3.5 shrink-0 translate-x-px" />
          </button>
        </>
      )}

      {hasSlides && slides.length > 1 && (
        <div className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
          {slides.map((slide, slideIndex) => (
            <span
              key={slide.id}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                slideIndex === displayIndex ? "bg-gray-900" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}