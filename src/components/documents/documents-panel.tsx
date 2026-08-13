"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  MoreVertical,
  PenLine,
  RefreshCw,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast-provider";
import type { Document, Deal, Event, Request } from "@/data/types";
import { SEED_EVENTS } from "@/data/mocks/seed";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { formatDate } from "@/lib/utils/formatters";

const DOC_TABS = [
  { id: "all", label: "Все" },
  { id: "incoming", label: "Входящие" },
  { id: "outgoing", label: "Исходящие" },
  { id: "archive", label: "Архив" },
];

const DOC_STATUS_LABELS: Record<Document["status"], string> = {
  draft: "Черновик",
  sent: "Ожидает подписи",
  signed: "Подписан",
  archived: "Архив",
};

function getDocCategory(type: string): string {
  if (type === "Договор") return "contract";
  if (type === "Счёт") return "invoice";
  if (type === "Акт" || type === "УПД") return "act";
  return "other";
}

function getCategoryLabel(type: string): string {
  const cat = getDocCategory(type);
  if (cat === "contract") return "Договор";
  if (cat === "invoice") return "Счёт";
  if (cat === "act") return "Акт / УПД";
  return type;
}

function getDirection(doc: Document): "incoming" | "outgoing" {
  if (doc.direction) return doc.direction;
  return doc.type === "Договор" ? "incoming" : "outgoing";
}

function resolveDocumentContext(
  doc: Document,
  dealMap: Record<string, Deal>,
  requestMap: Record<string, Request>,
  eventMap: Record<string, Event>
) {
  const deal = dealMap[doc.dealId];
  const request = deal?.requestId ? requestMap[deal.requestId] : undefined;
  const eventId = doc.eventId ?? deal?.eventId ?? request?.eventId;
  const event = eventId ? eventMap[eventId] : undefined;
  const organizerId = doc.organizerId ?? event?.organizerId;
  const organizerName =
    doc.organizerName ??
    (organizerId === "user-organizer-forum"
      ? "ООО «IT Forum Организатор»"
      : organizerId === "user-organizer"
        ? "ООО «МебельЭкспо Организатор»"
        : undefined);

  return { deal, event, eventId, organizerId, organizerName };
}

interface DocumentCardMenuProps {
  doc: Document;
  showRequestAgain: boolean;
  onDownload: (doc: Document) => void;
  onRequestAgain: (doc: Document) => void;
}

function DocumentCardMenu({
  doc,
  showRequestAgain,
  onDownload,
  onRequestAgain,
}: DocumentCardMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        aria-label="Дополнительные действия"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-6 w-6 items-center justify-center hover:bg-gray-100"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-max min-w-[210px] border border-gray-300 bg-white py-1 shadow-sm">
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-left whitespace-nowrap hover:bg-gray-50"
            onClick={() => {
              onDownload(doc);
              setOpen(false);
            }}
          >
            <Download className="h-3.5 w-3.5 shrink-0" />
            Скачать
          </button>
          {showRequestAgain && (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-left whitespace-nowrap hover:bg-gray-50"
              onClick={() => {
                onRequestAgain(doc);
                setOpen(false);
              }}
            >
              <RefreshCw className="h-3.5 w-3.5 shrink-0" />
              Запросить повторно
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function DocumentsPanel({
  defaultTab = "all",
  filterMode = "default",
}: {
  defaultTab?: string;
  filterMode?: "default" | "event-top-level";
}) {
  const { user } = useAuthStore();
  const { documents, deals, requests } = usePrototypeStore();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, Document["status"]>>({});
  const [counterpartyFilter, setCounterpartyFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [organizerFilter, setOrganizerFilter] = useState("all");
  const [datePeriodFilter, setDatePeriodFilter] = useState("all");

  const edoConnected = user?.edoStatus === "connected";

  const getStatus = (doc: Document) => statusOverrides[doc.id] ?? doc.status;

  const dealMap = useMemo(
    () => Object.fromEntries(deals.map((d) => [d.id, d])),
    [deals]
  );

  const requestMap = useMemo(
    () => Object.fromEntries(requests.map((request) => [request.id, request])),
    [requests]
  );

  const eventMap = useMemo(
    () => Object.fromEntries(SEED_EVENTS.map((event) => [event.id, event])),
    []
  );

  const topLevelFilterOptions = useMemo(() => {
    const eventIds = new Set<string>();
    const organizers = new Map<string, string>();
    const years = new Set<string>();

    documents.forEach((doc) => {
      const context = resolveDocumentContext(doc, dealMap, requestMap, eventMap);
      if (context.eventId) eventIds.add(context.eventId);
      if (context.organizerId && context.organizerName) {
        organizers.set(context.organizerId, context.organizerName);
      }
      years.add(doc.date.slice(0, 4));
    });

    return {
      events: [
        { value: "all", label: "Все мероприятия" },
        ...Array.from(eventIds)
          .map((eventId) => ({
            value: eventId,
            label: eventMap[eventId]?.title ?? eventId,
          }))
          .sort((a, b) => a.label.localeCompare(b.label, "ru")),
      ],
      organizers: [
        { value: "all", label: "Все организаторы" },
        ...Array.from(organizers.entries())
          .map(([id, name]) => ({ value: id, label: name }))
          .sort((a, b) => a.label.localeCompare(b.label, "ru")),
      ],
      datePeriods: [
        { value: "all", label: "Все даты" },
        ...Array.from(years)
          .sort((a, b) => b.localeCompare(a))
          .map((year) => ({ value: year, label: year })),
      ],
    };
  }, [documents, dealMap, requestMap, eventMap]);

  const filterOptions = useMemo(() => {
    const counterparties = new Set<string>();
    const projects = new Map<string, string>();

    documents.forEach((doc) => {
      const deal = dealMap[doc.dealId];
      if (!deal) return;
      counterparties.add(deal.contractorName);
      projects.set(deal.id, deal.title);
    });

    return {
      counterparties: [
        { value: "all", label: "Все контрагенты" },
        ...Array.from(counterparties)
          .sort()
          .map((name) => ({ value: name, label: name })),
      ],
      projects: [
        { value: "all", label: "Все проекты" },
        ...Array.from(projects.entries()).map(([id, title]) => ({
          value: id,
          label: title,
        })),
      ],
    };
  }, [documents, dealMap]);

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const status = statusOverrides[doc.id] ?? doc.status;
      const context = resolveDocumentContext(doc, dealMap, requestMap, eventMap);

      if (activeTab === "incoming" && (getDirection(doc) !== "incoming" || status === "archived")) {
        return false;
      }
      if (activeTab === "outgoing" && (getDirection(doc) !== "outgoing" || status === "archived")) {
        return false;
      }
      if (activeTab === "archive" && status !== "archived") return false;

      if (filterMode === "event-top-level") {
        if (eventFilter !== "all" && context.eventId !== eventFilter) return false;
        if (organizerFilter !== "all" && context.organizerId !== organizerFilter) {
          return false;
        }
        if (datePeriodFilter !== "all" && !doc.date.startsWith(datePeriodFilter)) {
          return false;
        }
      } else {
        if (counterpartyFilter !== "all" && context.deal?.contractorName !== counterpartyFilter) {
          return false;
        }
        if (projectFilter !== "all" && doc.dealId !== projectFilter) return false;
        if (dateFrom && doc.date < dateFrom) return false;
        if (dateTo && doc.date > dateTo) return false;
      }

      return true;
    });
  }, [
    documents,
    activeTab,
    statusOverrides,
    dealMap,
    requestMap,
    eventMap,
    filterMode,
    counterpartyFilter,
    projectFilter,
    dateFrom,
    dateTo,
    eventFilter,
    organizerFilter,
    datePeriodFilter,
  ]);

  const handleDownload = (doc: Document) => {
    showToast(`Скачивание ${doc.number}.pdf (демо)`, "info");
  };

  const handleSendEdo = (doc: Document) => {
    if (!edoConnected) {
      showToast("Подключите ЭДО для отправки документов", "error");
      return;
    }
    setStatusOverrides((prev) => ({ ...prev, [doc.id]: "sent" }));
    showToast(`Документ ${doc.number} отправлен через ЭДО`, "success");
  };

  const handleSign = (doc: Document) => {
    if (!edoConnected) {
      showToast("Подключите ЭДО для подписания", "error");
      return;
    }
    setStatusOverrides((prev) => ({ ...prev, [doc.id]: "signed" }));
    showToast(`Документ ${doc.number} подписан`, "success");
  };

  const handleRequestAgain = (doc: Document) => {
    setStatusOverrides((prev) => ({ ...prev, [doc.id]: "draft" }));
    showToast(`Запрос на повторную выдачу ${doc.number} отправлен`, "success");
  };

  return (
    <>
      {!edoConnected && user && (
        <div className="border border-gray-900 bg-gray-50 p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">ЭДО не подключён</p>
            <p className="text-sm text-gray-600 mt-1">
              Для подписания и обмена документами подключите электронный документооборот.
            </p>
          </div>
          {user.role === "customer" ? (
            <Link href="/account/customer/edo">
              <Button size="sm">Подключить ЭДО</Button>
            </Link>
          ) : (
            <p className="text-xs text-gray-600">
              Подключение ЭДО доступно в кабинете заказчика
            </p>
          )}
        </div>
      )}

      <Tabs tabs={DOC_TABS} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />

      {filterMode === "event-top-level" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          <Select
            label="Мероприятие"
            value={eventFilter}
            onChange={(event) => setEventFilter(event.target.value)}
            options={topLevelFilterOptions.events}
          />
          <Select
            label="Организатор"
            value={organizerFilter}
            onChange={(event) => setOrganizerFilter(event.target.value)}
            options={topLevelFilterOptions.organizers}
          />
          <Select
            label="Даты"
            value={datePeriodFilter}
            onChange={(event) => setDatePeriodFilter(event.target.value)}
            options={topLevelFilterOptions.datePeriods}
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <SearchableSelect
            label="Контрагент"
            value={counterpartyFilter}
            onChange={setCounterpartyFilter}
            options={filterOptions.counterparties}
            searchPlaceholder="Найти контрагента..."
          />
          <SearchableSelect
            label="Проект"
            value={projectFilter}
            onChange={setProjectFilter}
            options={filterOptions.projects}
            searchPlaceholder="Найти проект..."
          />
          <Input
            label="Дата с"
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
          />
          <Input
            label="Дата по"
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
          />
        </div>
      )}

      {filteredDocs.length === 0 ? (
        <EmptyState
          title="Документы не найдены"
          description={
            filterMode === "event-top-level"
              ? eventFilter !== "all" || organizerFilter !== "all" || datePeriodFilter !== "all"
                ? "По выбранным фильтрам документов нет"
                : activeTab === "incoming"
                  ? "Нет входящих документов, ожидающих ваших действий"
                  : activeTab === "outgoing"
                    ? "Нет исходящих документов"
                    : activeTab === "archive"
                      ? "Архив пуст"
                      : "Документы появятся после заключения сделок"
              : counterpartyFilter !== "all" || projectFilter !== "all" || dateFrom || dateTo
              ? "По выбранным фильтрам документов нет"
              : activeTab === "incoming"
              ? "Нет входящих документов, ожидающих ваших действий"
              : activeTab === "outgoing"
                ? "Нет исходящих документов"
                : activeTab === "archive"
                  ? "Архив пуст"
                  : "Документы появятся после заключения сделок"
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocs.map((doc) => {
            const status = getStatus(doc);
            const context = resolveDocumentContext(doc, dealMap, requestMap, eventMap);
            const deal = context.deal;
            const canSendEdo = status === "draft" || status === "signed";
            const canRequestAgain = status === "archived" || status === "signed";

            return (
              <Card key={doc.id} className="h-full flex flex-col gap-[10px]">
                <div className="flex items-center justify-between gap-[10px]">
                  <div className="flex flex-wrap items-center gap-[10px] min-w-0">
                    <Badge variant="outline">{getCategoryLabel(doc.type)}</Badge>
                    <Badge variant="dashed">
                      {getDirection(doc) === "incoming" ? "Входящий" : "Исходящий"}
                    </Badge>
                    <Badge
                      variant={status === "sent" ? "solid" : "outline"}
                      className={status === "archived" ? "opacity-70" : undefined}
                    >
                      {DOC_STATUS_LABELS[status]}
                    </Badge>
                  </div>
                  <DocumentCardMenu
                    doc={doc}
                    showRequestAgain={canRequestAgain}
                    onDownload={handleDownload}
                    onRequestAgain={handleRequestAgain}
                  />
                </div>

                <p className="text-sm font-semibold">{doc.number}</p>
                <div className="space-y-[10px] text-sm text-gray-600 flex-1">
                  <p>
                    <span className="text-gray-900 font-medium">Дата:</span>{" "}
                    {formatDate(doc.date)}
                  </p>
                  <p>
                    <span className="text-gray-900 font-medium">Стороны:</span>{" "}
                    {doc.parties}
                  </p>
                  {filterMode === "event-top-level" && context.event && (
                    <p>
                      <span className="text-gray-900 font-medium">Мероприятие:</span>{" "}
                      {context.event.title}
                    </p>
                  )}
                  {filterMode === "event-top-level" && context.organizerName && (
                    <p>
                      <span className="text-gray-900 font-medium">Организатор:</span>{" "}
                      {context.organizerName}
                    </p>
                  )}
                  {deal && (
                    <p>
                      <span className="text-gray-900 font-medium">Сделка:</span>{" "}
                      <Link
                        href={`/deals/${deal.id}`}
                        className="underline hover:text-gray-900"
                      >
                        {deal.number} — {deal.title}
                      </Link>
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-[10px]">
                  {canSendEdo && (
                    <Button variant="outline" size="sm" onClick={() => handleSendEdo(doc)}>
                      <Send className="h-3.5 w-3.5" />
                      Отправить ЭДО
                    </Button>
                  )}
                  {status === "sent" && (
                    <Button size="sm" onClick={() => handleSign(doc)}>
                      <PenLine className="h-3.5 w-3.5" />
                      Подписать
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
