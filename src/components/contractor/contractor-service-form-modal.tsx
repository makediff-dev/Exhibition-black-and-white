"use client";

import { useRef, useState } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CITIES, SERVICE_CATEGORIES } from "@/constants/categories";
import type { Service, ServicePhotoCard } from "@/data/types";
import { resizeImageFile } from "@/lib/utils/resize-image";

export interface ServiceFormState {
  title: string;
  category: string;
  city: string;
  price: string;
  priceFormat: string;
  deadline: string;
  description: string;
  terms: string;
  prepaymentPercent: number;
  guaranteeRefund: boolean;
  photoCards: ServicePhotoCard[];
}

const PRICE_FORMAT_OPTIONS = [
  { value: "фиксированная", label: "Фиксированная" },
  { value: "от", label: "От" },
  { value: "от за кв.м.", label: "От … за кв.м." },
  { value: "за день", label: "За день" },
  { value: "за комплект", label: "За комплект" },
];

export function createEmptyServiceForm(): ServiceFormState {
  return {
    title: "",
    category: SERVICE_CATEGORIES[0],
    city: CITIES[0],
    price: "",
    priceFormat: "фиксированная",
    deadline: "",
    description: "",
    terms: "",
    prepaymentPercent: 100,
    guaranteeRefund: false,
    photoCards: [],
  };
}

export function serviceToFormState(service: Service): ServiceFormState {
  return {
    title: service.title,
    category: service.category,
    city: service.city,
    price: String(service.price),
    priceFormat: service.priceFormat,
    deadline: service.deadline,
    description: service.description,
    terms: service.terms,
    prepaymentPercent: service.prepaymentPercent ?? 100,
    guaranteeRefund: service.guaranteeRefund ?? false,
    photoCards: service.photoCards ?? [],
  };
}

function PhotoCardEditor({
  card,
  onChange,
  onRemove,
  onError,
}: {
  card: ServicePhotoCard;
  onChange: (next: ServicePhotoCard) => void;
  onRemove: () => void;
  onError: (message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await resizeImageFile(file, 640, 0.85);
      onChange({ ...card, imageUrl });
    } catch (error) {
      onError(error instanceof Error ? error.message : "Не удалось загрузить фото");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border border-gray-200 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium">Карточка услуги</p>
        <button
          type="button"
          onClick={onRemove}
          className="text-gray-500 hover:text-gray-900"
          aria-label="Удалить карточку"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="aspect-[4/3] border border-dashed border-gray-300 bg-gray-50 overflow-hidden flex items-center justify-center">
        {card.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={card.imageUrl} alt={card.title || "Фото услуги"} className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs text-gray-400 px-4 text-center">Загрузите фото для мини-лендинга</span>
        )}
      </div>

      <Input
        label="Заголовок карточки"
        value={card.title}
        onChange={(event) => onChange({ ...card, title: event.target.value })}
        placeholder="Например: Срок монтажа"
      />
      <Textarea
        label="Пояснение"
        value={card.caption}
        onChange={(event) => onChange({ ...card, caption: event.target.value })}
        placeholder="Кратко опишите преимущество или характеристику"
      />
      <Button type="button" size="sm" variant="outline" disabled={uploading} onClick={() => inputRef.current?.click()}>
        <Upload className="h-4 w-4" />
        {uploading ? "Загрузка..." : card.imageUrl ? "Заменить фото" : "Загрузить фото"}
      </Button>
      <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={handleUpload} />
    </div>
  );
}

interface Props {
  open: boolean;
  editingServiceId: string | null;
  form: ServiceFormState;
  errors: Record<string, string>;
  onClose: () => void;
  onChange: (form: ServiceFormState) => void;
  onSave: () => void;
  onError: (message: string) => void;
}

export function ContractorServiceFormModal({
  open,
  editingServiceId,
  form,
  errors,
  onClose,
  onChange,
  onSave,
  onError,
}: Props) {
  const postpaymentPercent = 100 - form.prepaymentPercent;

  const updatePhotoCard = (id: string, next: ServicePhotoCard) => {
    onChange({
      ...form,
      photoCards: form.photoCards.map((card) => (card.id === id ? next : card)),
    });
  };

  const addPhotoCard = () => {
    onChange({
      ...form,
      photoCards: [
        ...form.photoCards,
        { id: `spc-${Date.now()}`, title: "", caption: "" },
      ],
    });
  };

  const removePhotoCard = (id: string) => {
    onChange({
      ...form,
      photoCards: form.photoCards.filter((card) => card.id !== id),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title={editingServiceId ? "Редактировать услугу" : "Добавить услугу"}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={onSave}>{editingServiceId ? "Сохранить" : "Добавить"}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Название услуги"
          value={form.title}
          onChange={(event) => onChange({ ...form, title: event.target.value })}
          error={errors.title}
          placeholder="Например: Дизайн-проект стенда"
        />
        <Select
          label="Категория"
          options={SERVICE_CATEGORIES.map((category) => ({ value: category, label: category }))}
          value={form.category}
          onChange={(event) => onChange({ ...form, category: event.target.value })}
        />
        <Select
          label="Город"
          options={CITIES.map((city) => ({ value: city, label: city }))}
          value={form.city}
          onChange={(event) => onChange({ ...form, city: event.target.value })}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Цена, ₽"
            type="number"
            value={form.price}
            onChange={(event) => onChange({ ...form, price: event.target.value })}
            error={errors.price}
            placeholder="0"
          />
          <Select
            label="Формат цены"
            options={PRICE_FORMAT_OPTIONS}
            value={form.priceFormat}
            onChange={(event) => onChange({ ...form, priceFormat: event.target.value })}
          />
        </div>
        <Input
          label="Сроки"
          value={form.deadline}
          onChange={(event) => onChange({ ...form, deadline: event.target.value })}
          error={errors.deadline}
          placeholder="Например: 10 рабочих дней"
        />

        <div className="space-y-3 border border-gray-200 p-4">
          <div>
            <p className="text-sm font-medium">Условия оплаты</p>
            <p className="text-xs text-gray-500 mt-1">
              100% — полная предоплата, 0% — постоплата после выполнения работ
            </p>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={form.prepaymentPercent}
            onChange={(event) =>
              onChange({ ...form, prepaymentPercent: Number(event.target.value) })
            }
            className="w-full accent-gray-900"
          />
          <div className="flex justify-between text-sm">
            <span>Постоплата: {postpaymentPercent}%</span>
            <span className="font-medium">Предоплата: {form.prepaymentPercent}%</span>
          </div>
        </div>

        <Textarea
          label="Описание"
          value={form.description}
          onChange={(event) => onChange({ ...form, description: event.target.value })}
          placeholder="Что входит в услугу"
        />
        <Textarea
          label="Условия"
          value={form.terms}
          onChange={(event) => onChange({ ...form, terms: event.target.value })}
          placeholder="Например: монтаж включён в стоимость"
        />
        <label className="flex items-start gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.guaranteeRefund}
            onChange={(event) => onChange({ ...form, guaranteeRefund: event.target.checked })}
            className="mt-0.5"
          />
          <span>Гарантия результата или возврат денежных средств</span>
        </label>

        <div className="space-y-3 border-t border-gray-200 pt-4">
          <div>
            <p className="text-sm font-medium">Фото-карточки услуги</p>
            <p className="text-xs text-gray-500 mt-1">
              Как мини-лендинг: несколько карточек с фото и пояснениями ключевых характеристик
            </p>
          </div>
          {form.photoCards.map((card) => (
            <PhotoCardEditor
              key={card.id}
              card={card}
              onChange={(next) => updatePhotoCard(card.id, next)}
              onRemove={() => removePhotoCard(card.id)}
              onError={onError}
            />
          ))}
          <Button type="button" size="sm" variant="outline" onClick={addPhotoCard}>
            <Plus className="h-4 w-4" />
            Добавить карточку
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function buildServicePayload(form: ServiceFormState) {
  return {
    title: form.title.trim(),
    city: form.city,
    category: form.category,
    price: Number(form.price),
    priceFormat: form.priceFormat,
    description: form.description.trim(),
    terms: form.terms.trim(),
    deadline: form.deadline.trim(),
    prepaymentPercent: form.prepaymentPercent,
    guaranteeRefund: form.guaranteeRefund,
    photoCards: form.photoCards.filter(
      (card) => card.title.trim() || card.caption.trim() || card.imageUrl
    ),
  };
}

export { buildServicePayload };
