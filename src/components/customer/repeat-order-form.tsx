"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import { CITIES, EVENT_INDUSTRIES } from "@/constants/categories";
import { SEED_EVENTS } from "@/data/mocks/seed";
import type { Deal, Request, TorSection } from "@/data/types";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { getContractorProfileHref } from "@/lib/utils/contractor-profile-links";
import { formatPrice, formatShortDate } from "@/lib/utils/formatters";
import {
  formatEventMonthLabel,
  getEventMonthKey,
  matchesEventSearch,
} from "@/lib/utils/event-search";
import { useToast } from "@/components/ui/toast-provider";

interface RepeatOrderItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

type EventMode = "event" | "manual";

interface RepeatOrderFormProps {
  deal: Deal;
  relatedRequest?: Request;
  onCreated: (requestId: string) => void;
  onCancel: () => void;
}

function createItemsFromDeal(deal: Deal): RepeatOrderItem[] {
  return deal.stages.map((stage) => ({
    id: stage.id,
    name: stage.title,
    description: stage.description,
    quantity: 1,
    unitPrice: stage.price,
  }));
}

export function RepeatOrderForm({
  deal,
  relatedRequest,
  onCreated,
  onCancel,
}: RepeatOrderFormProps) {
  const user = useAuthStore((state) => state.user);
  const { addRequest } = usePrototypeStore();
  const { showToast } = useToast();

  const [items, setItems] = useState<RepeatOrderItem[]>(() => createItemsFromDeal(deal));
  const [eventMode, setEventMode] = useState<EventMode>("event");
  const [eventId, setEventId] = useState("");
  const [manualVenue, setManualVenue] = useState("");
  const [manualCity, setManualCity] = useState(relatedRequest?.city ?? "Москва");
  const [executionStart, setExecutionStart] = useState("");
  const [executionEnd, setExecutionEnd] = useState("");
  const [eventIndustryFilter, setEventIndustryFilter] = useState("");
  const [eventCityFilter, setEventCityFilter] = useState("");
  const [eventMonthFilter, setEventMonthFilter] = useState("");
  const [eventSearch, setEventSearch] = useState("");

  const selectedEvent = useMemo(
    () => SEED_EVENTS.find((event) => event.id === eventId),
    [eventId]
  );

  const eventMonthOptions = useMemo(() => {
    const months = new Map<string, string>();
    SEED_EVENTS.forEach((event) => {
      const key = getEventMonthKey(event.startDate);
      months.set(key, formatEventMonthLabel(event.startDate));
    });
    return Array.from(months.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([value, label]) => ({ value, label }));
  }, []);

  const filteredEvents = useMemo(() => {
    return SEED_EVENTS.filter((event) => {
      if (eventIndustryFilter && event.industry !== eventIndustryFilter) return false;
      if (eventCityFilter && event.city !== eventCityFilter) return false;
      if (eventMonthFilter && getEventMonthKey(event.startDate) !== eventMonthFilter) return false;
      if (!matchesEventSearch(event, eventSearch)) return false;
      return true;
    });
  }, [eventIndustryFilter, eventCityFilter, eventMonthFilter, eventSearch]);

  const referenceTotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const updateItem = (id: string, updates: Partial<RepeatOrderItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => (prev.length <= 1 ? prev : prev.filter((item) => item.id !== id)));
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        name: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  };

  const isEventValid =
    eventMode === "event"
      ? !!eventId
      : !!manualVenue.trim() && !!manualCity && !!executionStart && !!executionEnd;

  const isItemsValid = items.every(
    (item) => item.name.trim() && item.quantity > 0 && item.unitPrice >= 0
  );

  const handleSubmit = () => {
    if (!isItemsValid) {
      showToast("Заполните позиции заказа", "error");
      return;
    }
    if (!isEventValid) {
      showToast("Выберите мероприятие или укажите площадку и даты", "error");
      return;
    }

    const eventTitle = selectedEvent?.title;
    const title = eventTitle
      ? `${deal.title.replace(/\s*·\s*[^·]+$/, "")} · ${eventTitle}`
      : `${deal.title} (повтор)`;

    const torSections: TorSection[] = items.map((item, index) => ({
      id: `repeat-${item.id}`,
      title: `${index + 1}. ${item.name}`,
      content: [
        item.description,
        `Количество: ${item.quantity}`,
        `Ориентировочная цена: ${formatPrice(item.unitPrice)}`,
      ]
        .filter(Boolean)
        .join("\n"),
      required: false,
    }));

    const description = `Повтор заказа ${deal.number}. Исполнитель: ${deal.contractorName}.`;
    const requirements =
      eventMode === "manual"
        ? `Площадка: ${manualVenue}, ${manualCity}`
        : relatedRequest?.requirements ?? "";

    const request: Request = {
      id: `req-${Date.now()}`,
      title,
      format: "closed_request",
      category: relatedRequest?.category ?? "Повтор заказа",
      city: selectedEvent?.city ?? manualCity,
      cities: selectedEvent ? [selectedEvent.city] : [manualCity],
      status: "published",
      budget: { type: "request_quote" },
      deadline: `${executionStart || selectedEvent?.startDate || ""}/${executionEnd || selectedEvent?.endDate || selectedEvent?.startDate || ""}`,
      description,
      requirements,
      expectedResult: relatedRequest?.expectedResult ?? "Выполнение заказа в срок",
      eventId: eventMode === "event" ? eventId : undefined,
      invitedContractorIds: [deal.contractorId],
      responseCount: 0,
      publishedAt: new Date().toISOString().split("T")[0],
      customerId: user?.id ?? deal.customerId,
      customerName: user?.name ?? deal.customerName,
      torSections,
      files: [],
      history: [
        {
          date: new Date().toISOString().split("T")[0],
          action: `Создана как повтор заказа ${deal.number}`,
        },
      ],
    };

    addRequest(request);
    showToast("Заявка создана и отправлена исполнителю", "success");
    onCreated(request.id);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border border-gray-300 bg-gray-50 p-4 text-sm rounded-card">
        <p className="font-medium text-gray-900">Повтор заказа на основе {deal.number}</p>
        <p className="text-gray-600 mt-1">{deal.title}</p>
      </div>

      <div className="flex items-start gap-2 border border-gray-300 bg-white p-3 text-sm rounded-card">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
        <p className="font-medium">Цена может измениться!</p>
      </div>

      <Card>
        <CardTitle className="text-sm mb-3">Исполнитель</CardTitle>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div>
            <Link
              href={getContractorProfileHref(deal.contractorId, { role: "customer" })}
              className="font-medium hover:underline"
            >
              {deal.contractorName}
            </Link>
            <CardDescription className="mt-1">
              Тот же исполнитель, что выполнял исходный заказ
            </CardDescription>
          </div>
          <BadgeLike>{deal.number}</BadgeLike>
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <CardTitle className="text-sm">Позиции заказа</CardTitle>
          <Button size="sm" variant="outline" onClick={addItem}>
            <Plus className="h-4 w-4" />
            Добавить позицию
          </Button>
        </div>

        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.id} className="space-y-3">
              <div className="w-full">
                <Input
                  label="Наименование"
                  className="w-full"
                  value={item.name}
                  onChange={(event) => updateItem(item.id, { name: event.target.value })}
                />
              </div>
              <div className="w-full">
                <Input
                  label="Описание"
                  className="w-full"
                  value={item.description}
                  onChange={(event) => updateItem(item.id, { description: event.target.value })}
                />
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <div className="w-24">
                  <Input
                    label="Кол-во"
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(event) =>
                      updateItem(item.id, {
                        quantity: Math.max(1, Number(event.target.value) || 1),
                      })
                    }
                  />
                </div>
                <div className="w-36">
                  <Input
                    label="Цена, ₽"
                    type="number"
                    min={0}
                    value={item.unitPrice || ""}
                    onChange={(event) =>
                      updateItem(item.id, { unitPrice: Number(event.target.value) || 0 })
                    }
                  />
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeItem(item.id)}
                  disabled={items.length <= 1}
                  aria-label="Удалить позицию"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Сумма по позиции: {formatPrice(item.quantity * item.unitPrice)}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-4 text-sm text-gray-600">
          Ориентировочная сумма:{" "}
          <span className="font-semibold text-gray-900">{formatPrice(referenceTotal)}</span>
        </p>
      </Card>

      <Card>
        <CardTitle className="text-sm mb-2">Мероприятие / площадка</CardTitle>
        <CardDescription className="mb-4">
          Поле пустое — выберите новое мероприятие или укажите площадку и даты вручную
        </CardDescription>

        <Tabs
          tabs={[
            { id: "event", label: "Выбрать мероприятие" },
            { id: "manual", label: "Площадка и даты" },
          ]}
          activeTab={eventMode}
          onChange={(tabId) => setEventMode(tabId as EventMode)}
          className="mb-4"
        />

        {eventMode === "event" ? (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Select
                label="Отрасль"
                value={eventIndustryFilter}
                onChange={(event) => setEventIndustryFilter(event.target.value)}
                options={[{ value: "", label: "Все" }, ...EVENT_INDUSTRIES.map((item) => ({ value: item, label: item }))]}
              />
              <Select
                label="Город"
                value={eventCityFilter}
                onChange={(event) => setEventCityFilter(event.target.value)}
                options={[{ value: "", label: "Все" }, ...CITIES.map((city) => ({ value: city, label: city }))]}
              />
              <Select
                label="Месяц"
                value={eventMonthFilter}
                onChange={(event) => setEventMonthFilter(event.target.value)}
                options={[{ value: "", label: "Все" }, ...eventMonthOptions]}
              />
              <Input
                label="Поиск"
                value={eventSearch}
                onChange={(event) => setEventSearch(event.target.value)}
                placeholder="Название, площадка..."
              />
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200">
              {filteredEvents.length === 0 ? (
                <p className="p-4 text-sm text-gray-500">Мероприятия не найдены</p>
              ) : (
                filteredEvents.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => {
                      setEventId(event.id);
                      setExecutionStart(event.startDate);
                      setExecutionEnd(event.endDate ?? event.startDate);
                      setManualCity(event.city);
                    }}
                    className={`w-full text-left p-3 text-sm border-b border-gray-200 last:border-b-0 hover:bg-gray-50 ${
                      eventId === event.id ? "bg-gray-100" : ""
                    }`}
                  >
                    <span className="font-medium">{event.title}</span>
                    <span className="block text-gray-600 mt-0.5">
                      {event.venue}, {event.city} · {formatShortDate(event.startDate)}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              label="Площадка"
              value={manualVenue}
              onChange={(event) => setManualVenue(event.target.value)}
              placeholder="Название площадки или адрес"
            />
            <Select
              label="Город"
              value={manualCity}
              onChange={(event) => setManualCity(event.target.value)}
              options={CITIES.map((city) => ({ value: city, label: city }))}
            />
            <DateRangePicker
              label="Даты проведения"
              start={executionStart}
              end={executionEnd}
              onChange={(start, end) => {
                setExecutionStart(start);
                setExecutionEnd(end);
              }}
            />
          </div>
        )}
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSubmit}>Создать заявку</Button>
        <Button variant="outline" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </div>
  );
}

function BadgeLike({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-1 text-xs border border-gray-300 text-gray-700">
      {children}
    </span>
  );
}