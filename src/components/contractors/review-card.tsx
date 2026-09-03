"use client";

import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ContractorReview } from "@/data/types";
import { formatShortDate } from "@/lib/utils/formatters";

interface Props {
  review: ContractorReview;
  onClick?: () => void;
}

export function ReviewCard({ review, onClick }: Props) {
  const photos = review.photos ?? [];
  const photoPreview = photos.slice(0, 3);
  const extraPhotos = Math.max(photos.length - photoPreview.length, 0);

  const content = (
    <Card className="h-full flex flex-col">
      <p className="text-sm font-medium leading-snug mb-[10px]">{review.author}</p>

      <p className="text-sm text-gray-700 flex-1">{review.text}</p>

      {photoPreview.length > 0 && (
        <div className="mt-[10px] grid grid-cols-3 gap-2">
          {photoPreview.map((photo, index) => (
            <div
              key={`${review.id}-photo-${index}`}
              className="aspect-[4/3] border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center p-1 text-center text-[10px] text-gray-500 leading-tight"
            >
              {photo}
            </div>
          ))}
        </div>
      )}

      {extraPhotos > 0 && (
        <p className="text-xs text-gray-500 mt-2">+{extraPhotos} фото</p>
      )}

      {review.videos && review.videos.length > 0 && (
        <p className="text-xs text-gray-500 mt-1">Видео: {review.videos.join(", ")}</p>
      )}

      <div className="mt-[10px] flex items-end justify-between gap-3">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={`${review.id}-star-${index}`}
              className={`h-4 w-4 ${index < review.rating ? "fill-gray-900 text-gray-900" : "text-gray-300"}`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-500 shrink-0">{formatShortDate(review.date)}</span>
      </div>
    </Card>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="w-full text-left h-full">
        {content}
      </button>
    );
  }

  return content;
}