"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { PortfolioItem } from "@/data/types";
import { cn } from "@/lib/utils/cn";

interface PortfolioCardProps {
  item: PortfolioItem;
  href?: string;
}

function getPortfolioPhotoSlides(item: PortfolioItem) {
  const labels = [...item.photos, "", "", ""].slice(0, 3);
  const mediaUrls = [...(item.mediaUrls ?? []), "", "", ""].slice(0, 3);

  const slides = labels.map((label, index) => ({
    label: label || `Фото ${index + 1}`,
    imageUrl: mediaUrls[index] || undefined,
  }));

  const filledSlides = slides.filter((slide, index) => slide.imageUrl || labels[index]);
  return filledSlides.length > 0 ? filledSlides : [{ label: "Фото 1", imageUrl: undefined }];
}

function PortfolioCardCarousel({ item }: { item: PortfolioItem }) {
  const slides = getPortfolioPhotoSlides(item);
  const [photoIndex, setPhotoIndex] = useState(0);
  const currentSlide = slides[photoIndex] ?? slides[0];
  const hasMultiple = slides.length > 1;

  return (
    <div className="mb-3">
      <div className="aspect-[4/3] border border-dashed border-gray-300 bg-gray-50 overflow-hidden relative">
        {currentSlide?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentSlide.imageUrl}
            alt={currentSlide.label}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center p-2 text-center text-[10px] text-gray-400">
            {currentSlide?.label || "Фото 1"}
          </div>
        )}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setPhotoIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center border border-gray-300 bg-white/95"
              aria-label="Предыдущее фото"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setPhotoIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center border border-gray-300 bg-white/95"
              aria-label="Следующее фото"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {slides.map((slide, index) => (
                <button
                  key={`${item.id}-dot-${slide.label}-${index}`}
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setPhotoIndex(index);
                  }}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    index === photoIndex ? "bg-gray-900" : "bg-gray-300"
                  )}
                  aria-label={`Фото ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {currentSlide?.label && hasMultiple && (
        <p className="mt-1 text-[10px] text-gray-500 truncate">{currentSlide.label}</p>
      )}
    </div>
  );
}

export function PortfolioCard({ item, href }: PortfolioCardProps) {
  const content = (
    <>
      <PortfolioCardCarousel item={item} />
      <p className="text-xs text-gray-500">{item.year}</p>
      <CardTitle className="mt-1 text-sm">{item.title}</CardTitle>
      <CardDescription className="mt-2 flex-1 line-clamp-2 text-xs">{item.description}</CardDescription>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="block w-full h-full min-w-0">
        <Card hoverable className="flex flex-col h-full">
          {content}
        </Card>
      </Link>
    );
  }

  return <Card className="flex flex-col h-full min-w-0">{content}</Card>;
}