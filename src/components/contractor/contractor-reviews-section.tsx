"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/states";
import { ReviewCard } from "@/components/contractors/review-card";
import type { CompanyProfile, ContractorReview } from "@/data/types";
import { findContractorForUser } from "@/lib/utils/user-entity-map";
import { formatShortDate } from "@/lib/utils/formatters";

interface Props {
  user: CompanyProfile | null;
}

export function ContractorReviewsSection({ user }: Props) {
  const contractor = findContractorForUser(user);
  const reviews = contractor?.reviews ?? [];
  const [reviewModal, setReviewModal] = useState<ContractorReview | null>(null);

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-baseline gap-3">
          <p className="text-3xl font-bold flex items-center gap-1">
            <Star className="h-6 w-6" /> {user?.rating ?? contractor?.rating}
          </p>
          <p className="text-sm text-gray-600">
            {user?.reviewCount ?? contractor?.reviewCount} отзывов
          </p>
        </div>
      </Card>

      {reviews.length === 0 ? (
        <EmptyState
          title="Отзывов пока нет"
          description="Отзывы появятся после завершённых сделок"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {reviews.map((rv) => (
            <ReviewCard key={rv.id} review={rv} onClick={() => setReviewModal(rv)} />
          ))}
        </div>
      )}

      <Modal
        open={!!reviewModal}
        onClose={() => setReviewModal(null)}
        title={reviewModal?.author ?? "Отзыв"}
        footer={
          <Button variant="outline" onClick={() => setReviewModal(null)}>
            Закрыть
          </Button>
        }
      >
        {reviewModal && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < reviewModal.rating ? "fill-gray-900 text-gray-900" : "text-gray-300"}`}
                  />
                ))}
                <span className="ml-1 font-medium">{reviewModal.rating}.0</span>
              </div>
              <span className="text-xs text-gray-500">{formatShortDate(reviewModal.date)}</span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{reviewModal.text}</p>
            {(reviewModal.photos?.length ?? 0) > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {reviewModal.photos?.map((photo, index) => (
                  <div
                    key={`${reviewModal.id}-modal-photo-${index}`}
                    className="aspect-[4/3] border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center p-2 text-center text-xs text-gray-500"
                  >
                    {photo}
                  </div>
                ))}
              </div>
            )}
            {(reviewModal.videos?.length ?? 0) > 0 && (
              <p className="text-xs text-gray-600">Видео: {reviewModal.videos?.join(", ")}</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
