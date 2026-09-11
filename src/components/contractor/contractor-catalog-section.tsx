"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  buildCatalogItemPayload,
  catalogItemToFormState,
  ContractorCatalogItemFormModal,
  createEmptyCatalogItemForm,
  type CatalogItemFormState,
} from "@/components/contractor/contractor-catalog-item-form-modal";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CITIES, SERVICE_CATEGORIES } from "@/constants/categories";
import type { ServiceCatalog, ServiceCatalogItem } from "@/data/types";
import { usePrototypeStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils/formatters";

const SERVICES_LIST_HREF = "/account/contractor/services";

export function createCatalogItem(): ServiceCatalogItem {
  return {
    id: `ci-${Date.now()}`,
    title: "",
    description: "",
    price: 0,
    unit: "шт.",
    terms: "",
    additionalTerms: "",
  };
}

export function createDraftCatalog(contractorId: string, contractorName: string): ServiceCatalog {
  return {
    id: `cat-${Date.now()}`,
    contractorId,
    contractorName,
    title: "",
    category: "Аренда мебели",
    city: CITIES[0],
    description: "",
    items: [],
  };
}

interface FormProps {
  contractorId: string;
  contractorName: string;
  catalogId: string;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

export function ContractorCatalogFormSection({
  contractorId,
  contractorName,
  catalogId,
  showToast,
}: FormProps) {
  const router = useRouter();
  const { getContractorCatalogs, upsertServiceCatalog, removeServiceCatalog } = usePrototypeStore();

  const isNew = catalogId === "new";
  const existingCatalog = isNew
    ? null
    : getContractorCatalogs(contractorId).find((entry) => entry.id === catalogId);

  const [catalog, setCatalog] = useState<ServiceCatalog>(
    () => existingCatalog ?? createDraftCatalog(contractorId, contractorName)
  );
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState<CatalogItemFormState>(createEmptyCatalogItemForm);
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({});

  if (!isNew && !existingCatalog) {
    return (
      <EmptyState
        title="Каталог не найден"
        actionLabel="К услугам"
        actionHref={SERVICES_LIST_HREF}
      />
    );
  }

  const resetItemForm = () => {
    setEditingItemId(null);
    setItemForm(createEmptyCatalogItemForm());
    setItemErrors({});
  };

  const openCreateItemModal = () => {
    resetItemForm();
    setItemModalOpen(true);
  };

  const openEditItemModal = (item: ServiceCatalogItem) => {
    setEditingItemId(item.id);
    setItemForm(catalogItemToFormState(item));
    setItemErrors({});
    setItemModalOpen(true);
  };

  const closeItemModal = () => {
    setItemModalOpen(false);
    resetItemForm();
  };

  const handleSaveItem = () => {
    const errs: Record<string, string> = {};
    if (!itemForm.title.trim()) errs.title = "Укажите название позиции";
    if (!itemForm.price || Number(itemForm.price) <= 0) errs.price = "Укажите корректную стоимость";
    setItemErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = buildCatalogItemPayload(itemForm, editingItemId ?? undefined);

    setCatalog((current) => {
      const exists = current.items.some((item) => item.id === payload.id);
      return {
        ...current,
        items: exists
          ? current.items.map((item) => (item.id === payload.id ? payload : item))
          : [...current.items, payload],
      };
    });

    closeItemModal();
  };

  const handleRemoveItem = (itemId: string) => {
    setCatalog((current) => ({
      ...current,
      items: current.items.filter((item) => item.id !== itemId),
    }));
  };

  const handleSave = () => {
    if (!catalog.title.trim()) {
      showToast("Укажите название каталога", "error");
      return;
    }

    const filledItems = catalog.items.filter(
      (item) => item.title.trim() || item.description.trim() || item.price > 0 || item.imageUrl
    );

    upsertServiceCatalog({ ...catalog, items: filledItems });
    showToast("Каталог сохранён", "success");
    router.push(SERVICES_LIST_HREF);
  };

  const handleDelete = () => {
    if (!isNew) {
      removeServiceCatalog(catalog.id);
    }
    showToast("Каталог удалён", "info");
    router.push(SERVICES_LIST_HREF);
  };

  return (
    <div className="max-w-3xl space-y-4">
      <BackButton fallbackHref={SERVICES_LIST_HREF} className="mb-2" />

      <div>
        <h1 className="text-xl font-bold">
          {isNew ? "Новый каталог" : catalog.title || "Редактирование каталога"}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Для флористов, аренды мебели, кейтеринга и других позиционных услуг
        </p>
      </div>

      <Card className="space-y-4">
        <Input
          label="Название каталога"
          value={catalog.title}
          onChange={(event) => setCatalog({ ...catalog, title: event.target.value })}
          placeholder="Например: Аренда мебели"
        />
        <Select
          label="Категория"
          options={SERVICE_CATEGORIES.map((category) => ({ value: category, label: category }))}
          value={catalog.category}
          onChange={(event) => setCatalog({ ...catalog, category: event.target.value })}
        />
        <Select
          label="Город"
          options={CITIES.map((city) => ({ value: city, label: city }))}
          value={catalog.city}
          onChange={(event) => setCatalog({ ...catalog, city: event.target.value })}
        />
        <Textarea
          label="Описание каталога"
          value={catalog.description}
          onChange={(event) => setCatalog({ ...catalog, description: event.target.value })}
          placeholder="Кратко опишите, что входит в каталог"
        />
      </Card>

      <div className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Позиции каталога</h2>
          <p className="text-sm text-gray-600 mt-1">
            Фото, описание, стоимость, единица измерения, условия и доп. условия
          </p>
        </div>

        {catalog.items.length === 0 ? (
          <Card className="border-dashed">
            <p className="text-sm text-gray-600">
              Добавьте первую позицию — например, конкретный предмет мебели или блюдо из меню.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {catalog.items.map((item) => (
              <Card key={item.id} onClick={() => openEditItemModal(item)}>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
                  <div className="flex gap-3 min-w-0">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.title || "Фото позиции"}
                        className="h-16 w-16 shrink-0 object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="h-16 w-16 shrink-0 border border-dashed border-gray-300 bg-gray-50" />
                    )}
                    <div className="min-w-0">
                      <CardTitle className="text-sm">{item.title ||"Без названия"}</CardTitle>
                      <CardDescription>
                        {item.price > 0 ? `${formatPrice(item.price)} / ${item.unit}` : "Стоимость не указана"}
                      </CardDescription>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleRemoveItem(item.id);
                    }}
                  >
                    Удалить
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Button type="button" size="sm" variant="outline" onClick={openCreateItemModal}>
          <Plus className="h-4 w-4" />
          Добавить позицию
        </Button>
      </div>

      <ContractorCatalogItemFormModal
        open={itemModalOpen}
        editingItemId={editingItemId}
        form={itemForm}
        errors={itemErrors}
        onClose={closeItemModal}
        onChange={setItemForm}
        onSave={handleSaveItem}
        onError={(message) => showToast(message, "error")}
      />

      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
        <Button type="button" size="sm" onClick={handleSave}>
          Сохранить
        </Button>
        {!isNew && (
          <Button type="button" size="sm" variant="outline" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            Удалить каталог
          </Button>
        )}
      </div>
    </div>
  );
}

interface ListProps {
  services: import("@/data/types").Service[];
  catalogs: ServiceCatalog[];
  onAddService: () => void;
  onEditService: (service: import("@/data/types").Service) => void;
  onRemoveService: (serviceId: string) => void;
  onRemoveCatalog: (catalogId: string) => void;
}

export function ContractorServicesListSection({
  services,
  catalogs,
  onAddService,
  onEditService,
  onRemoveService,
  onRemoveCatalog,
}: ListProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={onAddService}>
          <Plus className="h-4 w-4" />
          Добавить услугу
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push(`${SERVICES_LIST_HREF}/catalog/new`)}
        >
          <Plus className="h-4 w-4" />
          Добавить каталог
        </Button>
      </div>

      {services.length === 0 && catalogs.length === 0 ? (
        <EmptyState
          title="Услуги не добавлены"
          description="Добавьте услугу или каталог позиций для флористики, аренды мебели, кейтеринга и других направлений"
          actionLabel="Добавить услугу"
          onAction={onAddService}
        />
      ) : (
        <>
          {services.length > 0 && (
            <div className="space-y-3">
              {services.map((service) => (
                <Card
                  key={service.id}
                  onClick={() => router.push(`/account/contractor/services/${service.id}`)}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
                    <div className="min-w-0">
                      <CardTitle>{service.title}</CardTitle>
                      <CardDescription>
                        {formatPrice(service.price)} · {service.city} · {service.category}
                      </CardDescription>
                      {service.deadline && (
                        <p className="text-xs text-gray-500 mt-1">Сроки: {service.deadline}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        className="text-sm text-gray-900 hover:text-gray-600"
                        onClick={(event) => {
                          event.stopPropagation();
                          onEditService(service);
                        }}
                      >
                        Редактировать
                      </button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(event) => {
                          event.stopPropagation();
                          onRemoveService(service.id);
                        }}
                      >
                        Удалить
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {catalogs.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold">Каталоги</h2>
              {catalogs.map((catalog) => (
                <Card
                  key={catalog.id}
                  onClick={() => router.push(`${SERVICES_LIST_HREF}/catalog/${catalog.id}`)}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
                    <div className="min-w-0">
                      <CardTitle>{catalog.title}</CardTitle>
                      <CardDescription>
                        {catalog.city} · {catalog.category} · {catalog.items.length} позиций
                      </CardDescription>
                      {catalog.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{catalog.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(event) => {
                          event.stopPropagation();
                          onRemoveCatalog(catalog.id);
                        }}
                      >
                        Удалить
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}