"use client";

import { useMemo, useRef, useState } from "react";
import { Image, Play, Trash2, Upload, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { VenueProfileMedia } from "@/data/types";
import { useAuthStore, usePrototypeStore } from "@/lib/store";

interface Props {
  venueId?: string;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

function MediaTile({
  item,
  onRemove,
}: {
  item: VenueProfileMedia;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="relative aspect-[4/3] border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
        {item.type === "photo" ? (
          <Image className="h-8 w-8 text-gray-400" />
        ) : (
          <Play className="h-8 w-8 text-gray-400" />
        )}
        <button
          type="button"
          aria-label="Удалить"
          onClick={() => onRemove(item.id)}
          className="absolute top-2 right-2 inline-flex h-7 w-7 items-center justify-center bg-white hover:bg-gray-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="text-sm font-medium">{item.title}</p>
      {item.fileName && <p className="text-xs text-gray-500">{item.fileName}</p>}
    </div>
  );
}

function UploadButton({
  label,
  accept,
  onUpload,
}: {
  label: string;
  accept: string;
  onUpload: (fileName: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 border border-dashed border-gray-400 px-4 py-3 text-sm hover:border-gray-900"
      >
        <Upload className="h-4 w-4" />
        {label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          onUpload(file.name);
          event.target.value = "";
        }}
      />
    </>
  );
}

export function VenueProfileSection({ venueId = "venue-1", showToast }: Props) {
  const user = useAuthStore((state) => state.user);
  const { venueProfileMedia, addVenueProfileMedia, removeVenueProfileMedia } =
    usePrototypeStore();

  const [name, setName] = useState(user?.name ?? "");
  const [description, setDescription] = useState(user?.description ?? "");

  const media = useMemo(
    () => venueProfileMedia.filter((item) => item.venueId === venueId),
    [venueProfileMedia, venueId]
  );

  const venuePhotos = media.filter((item) => item.type === "photo" && item.category === "venue");
  const infrastructurePhotos = media.filter(
    (item) => item.type === "photo" && item.category === "infrastructure"
  );
  const venueVideos = media.filter((item) => item.type === "video" && item.category === "venue");
  const infrastructureVideos = media.filter(
    (item) => item.type === "video" && item.category === "infrastructure"
  );

  const handleAddMedia = (
    type: VenueProfileMedia["type"],
    category: VenueProfileMedia["category"],
    fileName: string
  ) => {
    const title = fileName.replace(/\.[^.]+$/, "");
    addVenueProfileMedia({
      id: `vpm-${Date.now()}`,
      venueId,
      type,
      category,
      title,
      fileName,
    });
    showToast(type === "photo" ? "Фото добавлено" : "Видео добавлено", "success");
  };

  return (
    <div className="max-w-3xl space-y-8">
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Основная информация</h2>
          <p className="text-sm text-gray-600 mt-1">
            Представьте площадку организаторам и участникам мероприятий
          </p>
        </div>
        <Input label="Название площадки" value={name} onChange={(e) => setName(e.target.value)} />
        <Textarea
          label="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Фото площадки</h2>
          <p className="text-sm text-gray-600 mt-1">
            Загрузите фотографии залов, фасада и ключевых зон площадки
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {venuePhotos.map((item) => (
            <MediaTile key={item.id} item={item} onRemove={removeVenueProfileMedia} />
          ))}
        </div>
        <UploadButton
          label="Добавить фото"
          accept="image/*"
          onUpload={(fileName) => handleAddMedia("photo", "venue", fileName)}
        />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Видео о площадке</h2>
          <p className="text-sm text-gray-600 mt-1">
            Короткий видео-тур помогает организаторам оценить площадку удалённо
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {venueVideos.map((item) => (
            <MediaTile key={item.id} item={item} onRemove={removeVenueProfileMedia} />
          ))}
        </div>
        <UploadButton
          label="Добавить видео"
          accept="video/*"
          onUpload={(fileName) => handleAddMedia("video", "venue", fileName)}
        />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Video className="h-4 w-4" />
            Инфраструктура
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Покажите парковку, склады, подъезды, электроснабжение и другие важные моменты
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {infrastructurePhotos.map((item) => (
            <MediaTile key={item.id} item={item} onRemove={removeVenueProfileMedia} />
          ))}
        </div>
        <UploadButton
          label="Добавить фото инфраструктуры"
          accept="image/*"
          onUpload={(fileName) => handleAddMedia("photo", "infrastructure", fileName)}
        />
        {infrastructureVideos.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            {infrastructureVideos.map((item) => (
              <MediaTile key={item.id} item={item} onRemove={removeVenueProfileMedia} />
            ))}
          </div>
        )}
        <UploadButton
          label="Добавить видео инфраструктуры"
          accept="video/*"
          onUpload={(fileName) => handleAddMedia("video", "infrastructure", fileName)}
        />
      </section>

      <Button onClick={() => showToast("Профиль площадки сохранён", "success")}>
        Сохранить
      </Button>
    </div>
  );
}
