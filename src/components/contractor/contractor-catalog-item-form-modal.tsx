"use client";

import { useRef, useState } from "react";
import { Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ServiceCatalogItem } from "@/data/types";
import { resizeImageFile } from "@/lib/utils/resize-image";

export const CATALOG_UNIT_OPTIONS = [
  { value: "шт.", label: "шт." },
  { value: "комплект", label: "комплект" },
  { value: "кв. м", label: "кв. м" },
  { value: "пог. м", label: "пог. м" },
  { value: "день", label: "день" },
  { value: "час", label: "час" },
  { value: "услуга", label: "услуга" },
  { value: "порция", label: "порция" },
];

export interface CatalogItemFormState {
  title: string;
  description: string;
  price: string;
  unit: string;
  terms: string;
  additionalTerms: string;
  imageUrl?: string;
}

export function createEmptyCatalogItemForm(): CatalogItemFormState {
  return {
    title: "",
    description: "",
    price: "",
    unit: "шт.",
    terms: "",
    additionalTerms: "",
  };
}

export function catalogItemToFormState(item: ServiceCatalogItem): CatalogItemFormState {
  return {
    title: item.title,
    description: item.description,
    price: item.price > 0 ? String(item.price) : "",
    unit: item.unit,
    terms: item.terms,
    additionalTerms: item.additionalTerms,
    imageUrl: item.imageUrl,
  };
}

export function buildCatalogItemPayload(
  form: CatalogItemFormState,
  existingId?: string
): ServiceCatalogItem {
  return {
    id: existingId ?? `ci-${Date.now()}`,
    title: form.title.trim(),
    description: form.description.trim(),
    price: Number(form.price) || 0,
    unit: form.unit,
    terms: form.terms.trim(),
    additionalTerms: form.additionalTerms.trim(),
    imageUrl: form.imageUrl,
  };
}

interface Props {
  open: boolean;
  editingItemId: string | null;
  form: CatalogItemFormState;
  errors: Record<string, string>;
  onClose: () => void;
  onChange: (form: CatalogItemFormState) => void;
  onSave: () => void;
  onError: (message: string) => void;
}

export function ContractorCatalogItemFormModal({
  open,
  editingItemId,
  form,
  errors,
  onClose,
  onChange,
  onSave,
  onError,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await resizeImageFile(file, 640, 0.85);
      onChange({ ...form, imageUrl });
    } catch (error) {
      onError(error instanceof Error ? error.message : "Не удалось загрузить фото");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      open={open}
      wide
      onClose={onClose}
      title={editingItemId ? "Редактировать позицию" : "Добавить позицию в каталог"}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={onSave}>{editingItemId ? "Сохранить" : "Добавить"}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="border border-gray-200 p-4 space-y-3">
          <p className="text-sm font-medium">Фото позиции</p>
          <div className="aspect-[4/3] border border-dashed border-gray-300 bg-gray-50 overflow-hidden flex items-center justify-center">
            {form.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.imageUrl} alt={form.title || "Фото позиции"} className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs text-gray-400 px-4 text-center">
                Загрузите фото для карточки позиции
              </span>
            )}
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Загрузка..." : form.imageUrl ? "Заменить фото" : "Загрузить фото"}
          </Button>
          <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={handleUpload} />
        </div>

        <Input
          label="Название"
          value={form.title}
          onChange={(event) => onChange({ ...form, title: event.target.value })}
          error={errors.title}
          placeholder="Например: Барный стул"
        />
        <Textarea
          label="Описание"
          value={form.description}
          onChange={(event) => onChange({ ...form, description: event.target.value })}
          placeholder="Кратко опишите позицию"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Стоимость, ₽"
            type="number"
            value={form.price}
            onChange={(event) => onChange({ ...form, price: event.target.value })}
            error={errors.price}
            placeholder="0"
          />
          <Select
            label="Единица измерения"
            options={CATALOG_UNIT_OPTIONS}
            value={form.unit}
            onChange={(event) => onChange({ ...form, unit: event.target.value })}
          />
        </div>
        <Textarea
          label="Условия"
          value={form.terms}
          onChange={(event) => onChange({ ...form, terms: event.target.value })}
          placeholder="Например: доставка включена"
        />
        <Textarea
          label="Доп. условия"
          value={form.additionalTerms}
          onChange={(event) => onChange({ ...form, additionalTerms: event.target.value })}
          placeholder="Например: минимальный заказ 10 шт."
        />
      </div>
    </Modal>
  );
}