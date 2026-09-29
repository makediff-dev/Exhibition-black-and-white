"use client";

import { useMemo, useState } from "react";
import { ReviewCard } from "@/components/contractors/review-card";
import { EmptyState } from "@/components/ui/states";
import { Tabs } from "@/components/ui/tabs";
import type { ContractorReview } from "@/data/types";
import { pluralizeRu } from "@/lib/utils/formatters";

type ReviewFilter = "all" | "positive" | "neutral" | "negative";

const FILTERS: { id: ReviewFilter; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "positive", label: "Положительные" },
  { id: "neutral", label: "Нейтральные" },
  { id: "negative", label: "Отрицательные" },
];

function matchesFilter(review: ContractorReview, filter: ReviewFilter) {
  if (filter === "positive") return review.rating >= 4;
  if (filter === "neutral") return review.rating === 3;
  if (filter === "negative") return review.rating <= 2;
  return true;
}

interface Props {
  reviews: ContractorReview[];
  onSelect?: (review: ContractorReview) => void;
}

export function ReviewsList({ reviews, onSelect }: Props) {
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const visible = useMemo(
    () => reviews.filter((review) => matchesFilter(review, filter)),
    [reviews, filter]
  );

  return (
    <div className="space-y-3">
      <Tabs
        tabs={FILTERS}
        activeTab={filter}
        onChange={(id) => setFilter(id as ReviewFilter)}
        className="w-full"
      />
      <p className="text-sm text-gray-600">
        {pluralizeRu(visible.length, ["отзыв", "отзыва", "отзывов"])}
        {filter !== "all" ? " по выбранному фильтру" : ""}
      </p>
      {visible.length === 0 ? (
        <EmptyState
          title="Отзывов по фильтру нет"
          description="Снимите фильтр или выберите другую оценку, чтобы увидеть остальные отзывы"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onClick={onSelect ? () => onSelect(review) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
