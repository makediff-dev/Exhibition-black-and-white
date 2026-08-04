"use client";

import { useRef, useState } from "react";
import { MessageSquare, Star, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import type { Deal, DealReview } from "@/data/types";
import { formatShortDate } from "@/lib/utils/formatters";
import { useToast } from "@/components/ui/toast-provider";

interface Props {
  deal: Deal;
  isContractor: boolean;
  isCustomer: boolean;
  onUpdate: (updates: Partial<Deal>) => void;
  uploadModalOpen?: boolean;
  onUploadModalOpenChange?: (open: boolean) => void;
}

function ReviewDisplay({ review }: { review: DealReview }) {
  const photos = review.photos ?? [];
  const photoPreview = photos.slice(0, 3);
  const extraPhotos = Math.max(photos.length - photoPreview.length, 0);

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-[10px]">
        <CardTitle className="text-sm">Отзыв заказчика</CardTitle>
        <Badge variant={review.status === "published" ? "solid" : "outline"}>
          {review.status === "published" ? "Опубликован" : "На модерации"}
        </Badge>
      </div>

      <p className="text-sm font-medium leading-snug mb-[10px]">{review.author}</p>
      <p className="text-sm text-gray-700 whitespace-pre-wrap">{review.text}</p>

      {photoPreview.length > 0 && (
        <div className="mt-[10px] flex flex-wrap gap-2">
          {photoPreview.map((photo, index) => (
            <div
              key={`${review.id}-photo-${index}`}
              className="h-16 w-16 border border-gray-300 bg-gray-50 flex items-center justify-center text-[10px] text-gray-500 text-center px-1"
            >
              {photo}
            </div>
          ))}
          {extraPhotos > 0 && (
            <div className="h-16 w-16 border border-gray-300 bg-gray-100 flex items-center justify-center text-xs text-gray-600">
              +{extraPhotos}
            </div>
          )}
        </div>
      )}

      {review.videos && review.videos.length > 0 && (
        <p className="text-xs text-gray-500 mt-[10px]">Видео: {review.videos.join(", ")}</p>
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
}

export function DealReviewTab({
  deal,
  isContractor,
  isCustomer,
  onUpdate,
  uploadModalOpen: externalUploadOpen,
  onUploadModalOpenChange,
}: Props) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [internalUploadOpen, setInternalUploadOpen] = useState(false);
  const uploadModalOpen = externalUploadOpen ?? internalUploadOpen;
  const setUploadModalOpen = onUploadModalOpenChange ?? setInternalUploadOpen;
  const [copyrightConfirmed, setCopyrightConfirmed] = useState(false);
  const [pendingPhotos, setPendingPhotos] = useState<string[]>([]);

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewFiles, setReviewFiles] = useState<string[]>([]);

  const projectPhotos = deal.projectPhotos ?? [];
  const hasReview = !!deal.review;

  const handleRequestReview = () => {
    onUpdate({
      reviewRequested: true,
      reviewRequestedAt: new Date().toISOString().slice(0, 10),
      history: [
        ...deal.history,
        {
          date: new Date().toISOString().slice(0, 10),
          action: "Исполнитель запросил отзыв у заказчика",
          actor: deal.contractorName,
        },
      ],
    });
    showToast(
      "Заказчику отправлено сообщение с просьбой оценить исполнителя, загрузить фото и видео, написать текст и поставить звёзды",
      "success"
    );
  };

  const handleUploadProjectPhotos = () => {
    if (!copyrightConfirmed) {
      showToast("Подтвердите, что вы являетесь правообладателем фотографий", "error");
      return;
    }
    if (pendingPhotos.length === 0) {
      showToast("Выберите хотя бы одно фото", "error");
      return;
    }

    onUpdate({
      projectPhotos: [...projectPhotos, ...pendingPhotos],
      history: [
        ...deal.history,
        {
          date: new Date().toISOString().slice(0, 10),
          action: `Загружено фото проекта: ${pendingPhotos.length}`,
          actor: deal.contractorName,
        },
      ],
    });
    showToast("Фото проекта загружены", "success");
    setPendingPhotos([]);
    setCopyrightConfirmed(false);
    setUploadModalOpen(false);
  };

  const handleProjectPhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    setPendingPhotos((prev) => [...prev, ...files.map((file) => file.name)]);
    event.target.value = "";
  };

  const handleSubmitReview = () => {
    if (rating === 0) {
      showToast("Поставьте оценку от 1 до 5 звёзд", "error");
      return;
    }
    if (!reviewText.trim()) {
      showToast("Напишите текст отзыва", "error");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const review: DealReview = {
      id: `dr-${deal.id}-${Date.now()}`,
      author: deal.customerName,
      rating,
      text: reviewText.trim(),
      date: today,
      photos: reviewFiles.filter((file) => !file.match(/\.(mp4|mov|webm)$/i)),
      videos: reviewFiles.filter((file) => file.match(/\.(mp4|mov|webm)$/i)),
      status: "pending_moderation",
    };

    onUpdate({
      review,
      history: [
        ...deal.history,
        {
          date: today,
          action: "Заказчик оставил отзыв — ожидает модерации",
          actor: deal.customerName,
        },
      ],
    });
    showToast(
      "Отзыв отправлен на модерацию. После проверки он будет опубликован в профиле исполнителя",
      "success"
    );
    setRating(0);
    setReviewText("");
    setReviewFiles([]);
  };

  return (
    <div className="space-y-6">
      {isContractor && (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setUploadModalOpen(true)}>
            <Upload className="h-4 w-4" />
            Загрузить фото проекта
          </Button>
          {!deal.reviewRequested && !hasReview && (
            <Button variant="outline" size="sm" onClick={handleRequestReview}>
              <MessageSquare className="h-4 w-4" />
              Запросить отзыв у заказчика
            </Button>
          )}
        </div>
      )}

      {projectPhotos.length > 0 && (
        <Card>
          <CardTitle className="text-sm mb-3">Фото проекта</CardTitle>
          <div className="flex flex-wrap gap-2">
            {projectPhotos.map((photo, index) => (
              <div
                key={`${deal.id}-project-photo-${index}`}
                className="h-20 w-20 border border-gray-300 bg-gray-50 flex items-center justify-center text-[10px] text-gray-500 text-center px-1"
              >
                {photo}
              </div>
            ))}
          </div>
        </Card>
      )}

      {deal.reviewRequested && !hasReview && (
        <Card>
          <CardTitle className="text-sm mb-2">Запрос отзыва отправлен</CardTitle>
          <CardDescription>
            {isContractor
              ? "Заказчик получил сообщение с просьбой оценить исполнителя, загрузить фото и видео, написать текст и поставить звёзды (максимум 5). После модерации отзыв будет опубликован."
              : "Исполнитель запросил отзыв. Оцените работу, приложите фото и видео — отзыв будет опубликован после модерации."}
          </CardDescription>
          {deal.reviewRequestedAt && (
            <p className="text-xs text-gray-500 mt-2">
              Запрос отправлен: {formatShortDate(deal.reviewRequestedAt)}
            </p>
          )}
        </Card>
      )}

      {hasReview && deal.review && <ReviewDisplay review={deal.review} />}

      {isCustomer && !hasReview && (
        <div>
          <CardTitle className="text-sm mb-2">Оставить отзыв</CardTitle>
          <CardDescription className="mb-4">
            Оцените исполнителя, загрузите фото и видео, напишите текст. Максимум 5 звёзд. Отзыв
            будет опубликован после модерации.
          </CardDescription>

          <p className="text-xs text-gray-500 mb-2">Заказчик: {deal.customerName}</p>

          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className="border border-gray-300 p-2 hover:border-gray-900"
                onClick={() => setRating(value)}
                aria-label={`Оценка ${value}`}
              >
                <Star
                  className={`h-4 w-4 ${value <= rating ? "fill-gray-900 text-gray-900" : "text-gray-300"}`}
                />
              </button>
            ))}
          </div>

          <Textarea
            label="Текст отзыва"
            value={reviewText}
            onChange={(event) => setReviewText(event.target.value)}
            placeholder="Опишите результат работы исполнителя"
          />

          <div className="mt-4">
            <FileUpload
              label="Прикрепить фото и видео"
              accept="image/*,video/*"
              onUpload={(fileName) => setReviewFiles((prev) => [...prev, fileName])}
            />
          </div>

          <Button className="mt-4" onClick={handleSubmitReview}>
            Отправить отзыв
          </Button>
        </div>
      )}

      <Modal
        open={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false);
          setCopyrightConfirmed(false);
          setPendingPhotos([]);
        }}
        title="Загрузить фото проекта"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setUploadModalOpen(false);
                setCopyrightConfirmed(false);
                setPendingPhotos([]);
              }}
            >
              Отмена
            </Button>
            <Button onClick={handleUploadProjectPhotos}>Загрузить</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600 mb-4">
          Добавьте фотографии выполненного проекта. Они будут доступны в карточке сделки и могут
          использоваться в портфолио исполнителя.
        </p>

        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          Выбрать файлы
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={handleProjectPhotoSelect}
        />

        {pendingPhotos.length > 0 && (
          <ul className="mt-3 space-y-1 text-xs text-gray-600">
            {pendingPhotos.map((photo) => (
              <li key={photo}>📷 {photo}</li>
            ))}
          </ul>
        )}

        <label className="mt-4 flex items-start gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={copyrightConfirmed}
            onChange={(event) => setCopyrightConfirmed(event.target.checked)}
            className="mt-0.5"
          />
          <span>
            Подтверждаю, что являюсь правообладателем загружаемых фотографий и имею право их
            публиковать на сервисе
          </span>
        </label>
      </Modal>
    </div>
  );
}
