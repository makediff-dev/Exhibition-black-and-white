"use client";

import { useMemo, useState } from "react";
import { useAccountTheme } from "@/components/account/account-theme-provider";
import { useCatalogAccent } from "@/components/catalog/catalog-accent-provider";
import { ReviewCard } from "@/components/contractors/review-card";
import { EmptyState } from "@/components/ui/states";
import type { ContractorReview } from "@/data/types";
import { cn } from "@/lib/utils/cn";
import { pluralizeRu } from "@/lib/utils/formatters";

type ReviewFilter = "all" | "positive" | "negative";

const FILTERS: { id: ReviewFilter; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "positive", label: "Положительные" },
  { id: "negative", label: "Отрицательные" },
];

function matchesFilter(review: ContractorReview, filter: ReviewFilter) {
  if (filter === "positive") return review.rating >= 4;
  if (filter === "negative") return review.rating <= 3;
  return true;
}

interface Props {
  reviews: ContractorReview[];
  onSelect?: (review: ContractorReview) => void;
}

export function ReviewsList({ reviews, onSelect }: Props) {
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const accountTheme = useAccountTheme();
  const catalogAccent = useCatalogAccent();
  const visible = useMemo(
    () => reviews.filter((review) => matchesFilter(review, filter)),
    [reviews, filter]
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Фильтр отзывов по оценке">
        {FILTERS.map((item) => {
          const isActive = filter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setFilter(item.id)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? catalogAccent
                    ? "border-[var(--catalog-accent)] bg-[var(--catalog-accent)] text-white"
                    : accountTheme
                      ? "border-[var(--account-accent)] bg-[var(--account-accent)] text-white"
                      : "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-300 bg-transparent text-gray-700 hover:border-gray-900",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
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
