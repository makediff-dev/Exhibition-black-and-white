"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Service } from "@/data/types";
import { formatPrice, formatServicePrice } from "@/lib/utils/formatters";

const MOCK_REVIEWS = [
  { id: "rv1", author: "ООО «Альфа»", rating: 5, text: "Качественное выполнение в срок", date: "2025-12-10" },
  { id: "rv2", author: "ООО «Бета»", rating: 4, text: "Хороший сервис, рекомендуем", date: "2025-11-22" },
];

interface Props {
  service: Service;
  backHref?: string;
  onEdit?: () => void;
}

export function ContractorServiceDetailSection({
  service,
  backHref = "/account/contractor/services",
  onEdit,
}: Props) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const photoCards = service.photoCards?.filter((card) => card.imageUrl || card.title || card.caption) ?? [];
  const currentPhotoCard = photoCards[photoIndex];

  return (
    <div className="max-w-4xl space-y-6">
      <BackButton fallbackHref={backHref} className="mb-2" />

      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <Badge variant="outline" className="mb-2">{service.category}</Badge>
          <h1 className="text-2xl font-bold mb-2">{service.title}</h1>
          <p className="text-sm text-gray-600">{service.city}</p>
          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
            <Star className="h-4 w-4 fill-gray-900" />
            {service.rating} · {service.reviewCount} отзывов
          </p>
        </div>
        {onEdit && (
          <Button type="button" size="sm" variant="outline" onClick={onEdit}>
            Редактировать
          </Button>
        )}
      </div>

      <div className="cabinet-card border border-gray-900 p-4 max-w-sm">
        <p className="text-2xl font-bold">{formatServicePrice(service)}</p>
        {service.variants && service.variants.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm text-gray-700">
            {service.variants.map((variant) => (
              <li key={variant.id}>
                {variant.name} — {formatPrice(variant.price)}
              </li>
            ))}
          </ul>
        )}
        <Link
          href={`/services/${service.id}`}
          className="inline-block mt-4 text-xs underline text-gray-600"
        >
          Как видят заказчики в каталоге
        </Link>
      </div>

      {photoCards.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Ключевые характеристики</h2>
          <div className="cabinet-card border border-gray-300 overflow-hidden max-w-2xl">
            <div className="aspect-[16/10] bg-gray-50 relative">
              {currentPhotoCard?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentPhotoCard.imageUrl}
                  alt={currentPhotoCard.title || service.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-sm text-gray-400">
                  Фото карточки
                </div>
              )}
              {photoCards.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setPhotoIndex((prev) => (prev === 0 ? photoCards.length - 1 : prev - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center border border-gray-300 bg-white/95"
                    aria-label="Предыдущая карточка"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoIndex((prev) => (prev === photoCards.length - 1 ? 0 : prev + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center border border-gray-300 bg-white/95"
                    aria-label="Следующая карточка"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
            <div className="p-4 border-t border-gray-200">
              {currentPhotoCard?.title && (
                <p className="text-sm font-semibold">{currentPhotoCard.title}</p>
              )}
              {currentPhotoCard?.caption && (
                <p className="text-sm text-gray-700 mt-1">{currentPhotoCard.caption}</p>
              )}
            </div>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-2">Описание</h2>
        <p className="text-sm text-gray-700">{service.description || "—"}</p>
      </section>

      <section className="grid sm:grid-cols-2 gap-4 text-sm max-w-2xl">
        <div className="cabinet-card border border-gray-300 p-4">
          <p className="font-medium mb-1">Условия</p>
          <p className="text-gray-700">{service.terms || "—"}</p>
          {service.guaranteeRefund && (
            <p className="text-gray-900 mt-2 text-xs border border-dashed border-gray-400 px-2 py-1 inline-block">
              Гарантия результата или возврат денежных средств
            </p>
          )}
        </div>
        <div className="cabinet-card border border-gray-300 p-4">
          <p className="font-medium mb-1">Срок выполнения</p>
          <p className="text-gray-700">{service.deadline}</p>
        </div>
        {service.prepaymentPercent !== undefined && (
          <div className="cabinet-card border border-gray-300 p-4 sm:col-span-2">
            <p className="font-medium mb-1">Условия оплаты</p>
            <p className="text-gray-700">
              Предоплата {service.prepaymentPercent}%, постоплата {100 - service.prepaymentPercent}%
            </p>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Отзывы</h2>
        <div className="space-y-3 max-w-2xl">
          {MOCK_REVIEWS.map((review) => (
            <div key={review.id} className="cabinet-card border border-gray-300 p-4">
              <div className="flex justify-between">
                <p className="text-sm font-medium">{review.author}</p>
                <span className="text-xs text-gray-600">{review.date}</span>
              </div>
              <p className="text-xs mt-1">★ {review.rating}</p>
              <p className="text-sm text-gray-700 mt-2">{review.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}