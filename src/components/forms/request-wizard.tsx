"use client";

import { useCallback, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { RequestDescriptionForm } from "@/components/forms/request-description-form";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { FileUpload, StepIndicator } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { CITIES, EVENT_INDUSTRIES, SERVICE_CATEGORIES } from "@/constants/categories";
import {
  createDefaultDescriptionSections,
  formatSectionContentForDisplay,
  isDescriptionSectionComplete,
  isDescriptionSectionFilled,
} from "@/constants/request-description-sections";
import { REQUEST_FORMAT_DESCRIPTIONS, REQUEST_FORMAT_LABELS } from "@/constants/statuses";
import { SEED_CONTRACTORS, SEED_EVENTS } from "@/data/mocks/seed";
import type { Request, RequestFormat, TorSection } from "@/data/types";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { formatPrice, formatRequestDeadline, formatShortDate } from "@/lib/utils/formatters";
import {
  formatEventMonthLabel,
  getEventMonthKey,
  matchesEventSearch,
} from "@/lib/utils/event-search";
import { useToast } from "@/components/ui/toast-provider";

const STEPS = [
  "Формат",
  "Категория",
  "Мероприятие",
  "Описание",
  "Сроки",
  "Бюджет",
  "Файлы",
  "Публикация",
];

const FORMATS: RequestFormat[] = ["open_request", "closed_request", "urgent", "safe_deal"];

const BUDGET_TYPE_DESCRIPTIONS: Record<string, string> = {
  range: "Вилка «от — до».",
  fixed: "Одна фиксированная сумма.",
  hidden: "Сумма есть, но скрыта — исполнители присылают КП.",
  request_quote: "Сумму не указываете — исполнители сами предлагают цену.",
};

const MANDATORY_UPLOAD_CATEGORIES = [
  "Комплексное строительство выставочных стендов",
  "Дизайн-проект выставочного стенда",
];

const MANDATORY_FILE_ITEMS = [
  { id: "layout", label: "Планировка" },
  { id: "logo", label: "Лого" },
  { id: "references", label: "Референсы" },
  {
    id: "past-stands",
    label: "Фото прошлых стендов",
    hint: "если требуется повторить концепцию прошлогоднюю",
  },
] as const;

export interface RequestWizardData {
  format: RequestFormat;
  category: string;
  eventId: string;
  city: string;
  cities: string[];
  title: string;
  description: string;
  requirements: string;
  expectedResult: string;
  executionStart: string;
  executionEnd: string;
  budget: Request["budget"];
  files: string[];
  mandatoryFiles: Record<string, string[]>;
  cloudLinks: string;
  torSections: TorSection[];
  descriptionMode: "structured" | "freeform";
  freeformDescription: string;
  torMode: "constructor" | "template" | "upload" | "urgent";
  torFiles: string[];
  invitedContractorIds: string[];
}

const defaultData = (format: RequestFormat = "open_request"): RequestWizardData => ({
  format,
  category: "",
  eventId: "",
  city: "Москва",
  cities: ["Москва"],
  title: "",
  description: "",
  requirements: "",
  expectedResult: "",
  executionStart: "",
  executionEnd: "",
  budget: { type: "range", min: undefined, max: undefined },
  files: [],
  mandatoryFiles: {},
  cloudLinks: "",
  torSections: createDefaultDescriptionSections(),
  descriptionMode: "structured",
  freeformDescription: "",
  torMode: "constructor" as const,
  torFiles: [],
  invitedContractorIds: [],
});

interface RequestWizardProps {
  initialFormat?: RequestFormat;
  initialEventId?: string;
  initialContractorId?: string;
  initialCategory?: string;
  onPublished: (request: Request) => void;
}

function applyInitialParams(
  base: RequestWizardData,
  params: Pick<RequestWizardProps, "initialFormat" | "initialEventId" | "initialContractorId" | "initialCategory">
): RequestWizardData {
  let next = { ...base };
  if (params.initialFormat) next.format = params.initialFormat;
  if (params.initialCategory) next.category = params.initialCategory;
  if (params.initialEventId) {
    const event = SEED_EVENTS.find((item) => item.id === params.initialEventId);
    next.eventId = params.initialEventId;
    if (event) {
      next.city = event.city;
      if (!next.title) next.title = `Услуги для ${event.title}`;
    }
  }
  if (params.initialContractorId) {
    next.invitedContractorIds = [params.initialContractorId];
    if (!params.initialFormat) next.format = "closed_request";
  }
  return next;
}

export function RequestWizard({
  initialFormat,
  initialEventId,
  initialContractorId,
  initialCategory,
  onPublished,
}: RequestWizardProps) {
  const { requestWizardDraft, setRequestWizardDraft } = usePrototypeStore();
  const user = useAuthStore((state) => state.user);
  const { showToast } = useToast();
  const [step, setStep] = useState(0);
  const [eventIndustryFilter, setEventIndustryFilter] = useState("");
  const [eventCityFilter, setEventCityFilter] = useState("");
  const [eventMonthFilter, setEventMonthFilter] = useState("");
  const [eventSearch, setEventSearch] = useState("");
  const [data, setData] = useState<RequestWizardData>(() => {
    const draft = requestWizardDraft as Partial<RequestWizardData & { deadline?: string }>;
    if (draft && Object.keys(draft).length > 0) {
      const migratedDraft = { ...draft };
      if (draft.deadline && !draft.executionStart && !draft.executionEnd) {
        if (draft.deadline.includes("/")) {
          const [executionStart, executionEnd] = draft.deadline.split("/");
          migratedDraft.executionStart = executionStart;
          migratedDraft.executionEnd = executionEnd;
        } else {
          migratedDraft.executionEnd = draft.deadline;
        }
      }
      return applyInitialParams(
        {
          ...defaultData(initialFormat),
          ...migratedDraft,
          torSections: migratedDraft.torSections?.length
            ? (migratedDraft.torSections as TorSection[])
            : createDefaultDescriptionSections(),
        },
        { initialFormat, initialEventId, initialContractorId, initialCategory }
      );
    }
    return applyInitialParams(defaultData(initialFormat), {
      initialFormat,
      initialEventId,
      initialContractorId,
      initialCategory,
    });
  });

  const update = useCallback((updates: Partial<RequestWizardData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const saveDraft = useCallback(() => {
    setRequestWizardDraft(data as unknown as Record<string, unknown>);
    showToast("Черновик заявки сохранён", "info");
  }, [data, setRequestWizardDraft, showToast]);

  const selectedEvent = useMemo(
    () => SEED_EVENTS.find((e) => e.id === data.eventId),
    [data.eventId]
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

  const selectEvent = (eventId: string) => {
    const event = SEED_EVENTS.find((item) => item.id === eventId);
    update({
      eventId,
      city: event?.city ?? data.city,
      title: data.title || (event ? `Услуги для ${event.title}` : data.title),
    });
  };


  const addMandatoryFile = (itemId: string, fileName: string) => {
    update({
      mandatoryFiles: {
        ...data.mandatoryFiles,
        [itemId]: [...(data.mandatoryFiles[itemId] ?? []), fileName],
      },
    });
  };

  const toggleInvitedContractor = (contractorId: string) => {
    const exists = data.invitedContractorIds.includes(contractorId);
    update({
      invitedContractorIds: exists
        ? data.invitedContractorIds.filter((id) => id !== contractorId)
        : [...data.invitedContractorIds, contractorId],
    });
  };

  const isDescriptionValid =
    data.descriptionMode === "freeform"
      ? !!data.title.trim() &&
        !!data.description.trim() &&
        !!data.freeformDescription.trim()
      : !!data.title.trim() &&
        !!data.description.trim() &&
        data.torSections
          .filter((section) => section.required)
          .every((section) => isDescriptionSectionComplete(section.title, section.content));

  const isBudgetValid =
    data.budget.type === "range"
      ? !!(data.budget.min && data.budget.max && data.budget.min <= data.budget.max)
      : data.budget.type === "fixed"
        ? !!data.budget.min
        : !!data.budget.type;

  const isFilesValid =
    !MANDATORY_UPLOAD_CATEGORIES.includes(data.category) ||
    MANDATORY_FILE_ITEMS.slice(0, 3).every(
      (item) => (data.mandatoryFiles[item.id] ?? []).length > 0
    );

  const isPublishReady =
    !!data.format &&
    !!data.category &&
    isDescriptionValid &&
    !!data.executionStart &&
    !!data.executionEnd &&
    data.executionStart <= data.executionEnd &&
    isBudgetValid &&
    isFilesValid &&
    (data.format !== "closed_request" || data.invitedContractorIds.length > 0);

  const canProceed = useMemo(() => {
    switch (step) {
      case 0:
        return (
          !!data.format &&
          (data.format !== "closed_request" || data.invitedContractorIds.length > 0)
        );
      case 1:
        return !!data.category;
      case 2:
        return true;
      case 3:
        if (data.descriptionMode === "freeform") {
          return (
            !!data.title.trim() &&
            !!data.description.trim() &&
            !!data.freeformDescription.trim()
          );
        }
        return (
          !!data.title.trim() &&
          !!data.description.trim() &&
          data.torSections
            .filter((section) => section.required)
            .every((section) => isDescriptionSectionComplete(section.title, section.content))
        );
      case 4:
        return (
          !!data.executionStart &&
          !!data.executionEnd &&
          data.executionStart <= data.executionEnd
        );
      case 5:
        return !!data.budget.type;
      case 6:
        if (MANDATORY_UPLOAD_CATEGORIES.includes(data.category)) {
          return MANDATORY_FILE_ITEMS.slice(0, 3).every(
            (item) => (data.mandatoryFiles[item.id] ?? []).length > 0
          );
        }
        return true;
      case 7:
        return isPublishReady;
      default:
        return true;
    }
  }, [step, data, isPublishReady, isDescriptionValid, isBudgetValid, isFilesValid]);

  const publish = () => {
    if (!isPublishReady) {
      showToast("Заполните обязательные поля перед публикацией", "error");
      return;
    }
    const id = `req-${Date.now()}`;
    const request: Request = {
      id,
      title: data.title,
      format: data.format,
      category: data.category,
      city: data.city,
      cities: data.cities,
      status: "published",
      budget: data.budget,
      deadline: `${data.executionStart}/${data.executionEnd}`,
      description: data.description,
      requirements: data.requirements,
      expectedResult: data.expectedResult,
      eventId: data.eventId || undefined,
      invitedContractorIds: data.format === "closed_request" ? data.invitedContractorIds : [],
      responseCount: 0,
      publishedAt: new Date().toISOString().split("T")[0],
      customerId: user?.id ?? "user-customer",
      customerName: user?.name,
      torSections:
        data.descriptionMode === "freeform"
          ? [
              {
                id: "desc-freeform",
                title: "ТЗ в свободной форме",
                content: data.freeformDescription,
                required: false,
              },
            ]
          : data.torSections,
      files: [
        ...data.files,
        ...Object.entries(data.mandatoryFiles).flatMap(([itemId, names]) =>
          names.map((name) => {
            const label = MANDATORY_FILE_ITEMS.find((item) => item.id === itemId)?.label ?? itemId;
            return `[${label}] ${name}`;
          })
        ),
      ],
      cloudLinks: data.cloudLinks.trim() || undefined,
      history: [{ date: new Date().toISOString().split("T")[0], action: "Опубликована" }],
    };
    setRequestWizardDraft({});
    onPublished(request);
  };

  return (
    <div className="space-y-6">
      <StepIndicator steps={STEPS} currentStep={step} />

      {step === 0 && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            {FORMATS.map((format) => (
              <Card
                key={format}
                onClick={() => update({ format })}
                className={data.format === format ? "border-gray-900 ring-1 ring-gray-900" : ""}
              >
                <CardTitle className="text-sm">{REQUEST_FORMAT_LABELS[format]}</CardTitle>
                <CardDescription className="text-xs mt-2">
                  {REQUEST_FORMAT_DESCRIPTIONS[format]}
                </CardDescription>
              </Card>
            ))}
          </div>

          {data.format === "closed_request" && (
            <div className="border border-gray-300 p-4 space-y-3">
              <p className="text-sm font-medium">Пригласите исполнителей *</p>
              <p className="text-xs text-gray-600">
                Закрытая заявка видна только выбранным исполнителям.
              </p>
              <div className="grid sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {SEED_CONTRACTORS.map((contractor) => {
                  const selected = data.invitedContractorIds.includes(contractor.id);
                  return (
                    <button
                      key={contractor.id}
                      type="button"
                      onClick={() => toggleInvitedContractor(contractor.id)}
                      className={`text-left border px-3 py-2 text-sm transition-colors ${
                        selected
                          ? "border-gray-900 bg-slate-100 font-medium"
                          : "border-gray-300 hover:border-gray-500"
                      }`}
                    >
                      {contractor.name}
                      <span className="block text-xs text-gray-600 mt-0.5">{contractor.city}</span>
                    </button>
                  );
                })}
              </div>
              {data.invitedContractorIds.length === 0 && (
                <p className="text-xs text-red-600">Выберите хотя бы одного исполнителя</p>
              )}
            </div>
          )}
        </div>
      )}

      {step === 1 && (
        <Select
          label="Категория услуги *"
          value={data.category}
          onChange={(e) => update({ category: e.target.value })}
          options={[
            { value: "", label: "Выберите категорию" },
            ...SERVICE_CATEGORIES.map((c) => ({ value: c, label: c })),
          ]}
        />
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-700">Привязка к мероприятию (необязательно):</p>

          <Input
            label="Поиск по названию"
            placeholder="RU/EN, аббревиатуры: PMGF, SPIGF, Gas Forum..."
            value={eventSearch}
            onChange={(e) => setEventSearch(e.target.value)}
          />

          <div className="grid sm:grid-cols-3 gap-3">
            <Select
              label="Отрасль"
              value={eventIndustryFilter}
              onChange={(e) => setEventIndustryFilter(e.target.value)}
              options={[
                { value: "", label: "Все отрасли" },
                ...EVENT_INDUSTRIES.map((industry) => ({ value: industry, label: industry })),
              ]}
            />
            <Select
              label="Город"
              value={eventCityFilter}
              onChange={(e) => setEventCityFilter(e.target.value)}
              options={[
                { value: "", label: "Все города" },
                ...CITIES.map((city) => ({ value: city, label: city })),
              ]}
            />
            <Select
              label="Дата"
              value={eventMonthFilter}
              onChange={(e) => setEventMonthFilter(e.target.value)}
              options={[
                { value: "", label: "Все даты" },
                ...eventMonthOptions,
              ]}
            />
          </div>

          <div className="border border-gray-300 divide-y divide-gray-200 max-h-72 overflow-y-auto">
            <button
              type="button"
              onClick={() => selectEvent("")}
              className={`w-full text-left px-3 py-3 text-sm transition-colors hover:bg-gray-50 ${
                !data.eventId ? "bg-slate-100 border border-blue-600 font-medium" : "border border-transparent"
              }`}
            >
              Без привязки к мероприятию
            </button>
            {filteredEvents.length === 0 ? (
              <p className="px-3 py-4 text-sm text-gray-600">Мероприятия не найдены</p>
            ) : (
              filteredEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => selectEvent(event.id)}
                  className={`w-full text-left px-3 py-3 text-sm transition-colors hover:bg-gray-50 ${
                    data.eventId === event.id
                      ? "bg-slate-100 border border-blue-600 font-medium"
                      : "border border-transparent"
                  }`}
                >
                  <span className="block">{event.title}</span>
                  <span className="block text-xs text-gray-600 mt-1">
                    {event.industry} · {event.city} · {formatShortDate(event.startDate)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <RequestDescriptionForm
          title={data.title}
          summary={data.description}
          sections={data.torSections}
          descriptionMode={data.descriptionMode}
          freeformDescription={data.freeformDescription}
          onTitleChange={(title) => update({ title })}
          onSummaryChange={(description) => update({ description })}
          onSectionsChange={(torSections) => update({ torSections })}
          onDescriptionModeChange={(descriptionMode) => update({ descriptionMode })}
          onFreeformDescriptionChange={(freeformDescription) => update({ freeformDescription })}
          compact={data.format === "urgent"}
        />
      )}

      {step === 4 && (
        <DateRangePicker
          label="Диапазон выполнения *"
          start={data.executionStart}
          end={data.executionEnd}
          onChange={(executionStart, executionEnd) => update({ executionStart, executionEnd })}
          placeholder="Выберите период в календаре"
        />
      )}

      {step === 5 && (
        <div className="space-y-4">
          <Select
            label="Тип бюджета"
            value={data.budget.type}
            onChange={(e) => update({ budget: { ...data.budget, type: e.target.value } })}
            options={[
              { value: "range", label: "Диапазон" },
              { value: "fixed", label: "Фиксированный" },
              { value: "hidden", label: "Скрытый (по запросу КП)" },
              { value: "request_quote", label: "Запросить предложение" },
            ]}
          />
          <p className="text-xs text-gray-600">
            {BUDGET_TYPE_DESCRIPTIONS[data.budget.type]}
          </p>
          {data.budget.type === "range" && (
            <div className="grid sm:grid-cols-2 gap-3">
              <Input
                label="От, ₽"
                type="number"
                value={data.budget.min ?? ""}
                onChange={(e) =>
                  update({ budget: { ...data.budget, min: Number(e.target.value) || undefined } })
                }
              />
              <Input
                label="До, ₽"
                type="number"
                value={data.budget.max ?? ""}
                onChange={(e) =>
                  update({ budget: { ...data.budget, max: Number(e.target.value) || undefined } })
                }
              />
            </div>
          )}
          {data.budget.type === "fixed" && (
            <Input
              label="Сумма, ₽"
              type="number"
              value={data.budget.min ?? ""}
              onChange={(e) =>
                update({ budget: { ...data.budget, min: Number(e.target.value) || undefined } })
              }
            />
          )}
        </div>
      )}

      {step === 6 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-700">Прикрепите чертежи, брифы и другие материалы:</p>
          <FileUpload
            onUpload={(name) => update({ files: [...data.files, name] })}
          />
          {data.files.length > 0 && (
            <ul className="text-xs text-gray-600 space-y-1">
              {data.files.map((f) => (
                <li key={f}>📄 {f}</li>
              ))}
            </ul>
          )}

          <div className="space-y-4">
            <p className="text-sm font-medium">Обязательные к загрузке файлы:</p>
            <ol className="space-y-4">
              {MANDATORY_FILE_ITEMS.map((item, index) => (
                <li key={item.id} className="text-sm">
                  <p className="font-medium">
                    {index + 1}. {item.label}
                    {"hint" in item && item.hint && (
                      <span className="font-normal text-gray-600"> ({item.hint})</span>
                    )}
                  </p>
                  <div className="mt-2">
                    <FileUpload
                      label="Загрузить"
                      onUpload={(name) => addMandatoryFile(item.id, name)}
                    />
                  </div>
                  {(data.mandatoryFiles[item.id] ?? []).length > 0 && (
                    <ul className="mt-2 text-xs text-gray-600 space-y-1">
                      {(data.mandatoryFiles[item.id] ?? []).map((fileName) => (
                        <li key={fileName}>📄 {fileName}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              Прикрепите ссылки на облачное хранилище, если туда загружены дополнительные материалы, необходимые для реализации проекта
            </p>
            <Textarea
              label="Ссылки на облачное хранилище"
              value={data.cloudLinks}
              onChange={(e) => update({ cloudLinks: e.target.value })}
              placeholder={"https://disk.yandex.ru/...\nhttps://drive.google.com/..."}
            />
          </div>
        </div>
      )}

      {step === 7 && (
        <div className="border border-gray-900 p-4 space-y-4 bg-gray-50">
          <h3 className="font-semibold">Предпросмотр заявки</h3>
          <div className="flex flex-wrap gap-2">
            <Badge>{REQUEST_FORMAT_LABELS[data.format]}</Badge>
            <Badge variant="outline">{data.category || "—"}</Badge>
            <Badge variant="dashed">{data.city}</Badge>
          </div>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Название:</span> {data.title}</p>
            <p><span className="font-medium">Краткое описание:</span> {data.description}</p>
            <p><span className="font-medium">Диапазон выполнения:</span> {formatRequestDeadline(`${data.executionStart}/${data.executionEnd}`)}</p>
            <p>
              <span className="font-medium">Бюджет:</span>{" "}
              {data.budget.type === "hidden"
                ? "Скрытый"
                : data.budget.type === "request_quote"
                  ? "По запросу КП"
                  : data.budget.min
                    ? data.budget.max
                      ? `${formatPrice(data.budget.min)} — ${formatPrice(data.budget.max)}`
                      : formatPrice(data.budget.min)
                    : "—"}
            </p>
            {data.format === "closed_request" && (
              <p>
                <span className="font-medium">Приглашены:</span>{" "}
                {data.invitedContractorIds.length
                  ? data.invitedContractorIds
                      .map(
                        (id) =>
                          SEED_CONTRACTORS.find((contractor) => contractor.id === id)?.name ?? id
                      )
                      .join(", ")
                  : "—"}
              </p>
            )}
            {selectedEvent && (
              <p><span className="font-medium">Мероприятие:</span> {selectedEvent.title}</p>
            )}
            <p>
              <span className="font-medium">Формат описания:</span>{" "}
              {data.descriptionMode === "freeform"
                ? "ТЗ в свободной форме"
                : "Полноценное ТЗ"}
            </p>
            <p><span className="font-medium">Файлов:</span> {data.files.length}</p>
            {data.cloudLinks.trim() && (
              <p><span className="font-medium">Ссылки на облако:</span> {data.cloudLinks.trim()}</p>
            )}
            {data.descriptionMode === "structured" && (
              <p>
                <span className="font-medium">Разделов описания:</span>{" "}
                {data.torSections.filter((section) => isDescriptionSectionFilled(section.title, section.content)).length}
              </p>
            )}
          </div>
          {data.descriptionMode === "freeform" && data.freeformDescription.trim() && (
            <div className="border-t border-gray-300 pt-4 space-y-3">
              <div>
                <p className="text-sm font-medium">ТЗ в свободной форме</p>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap line-clamp-6">
                  {data.freeformDescription}
                </p>
              </div>
            </div>
          )}
          {data.descriptionMode === "structured" &&
            data.torSections.some((section) => isDescriptionSectionFilled(section.title, section.content)) && (
            <div className="border-t border-gray-300 pt-4 space-y-3">
              {data.torSections
                .filter((section) => isDescriptionSectionFilled(section.title, section.content))
                .map((section, index) => (
                  <div key={section.id}>
                    <p className="text-sm font-medium">{index + 1}. {section.title}</p>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap line-clamp-4">
                      {formatSectionContentForDisplay(section.title, section.content)}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2 justify-between border-t border-gray-300 pt-4">
        <div className="flex gap-2">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              <ChevronLeft className="h-4 w-4" />
              Назад
            </Button>
          )}
          <Button variant="ghost" onClick={saveDraft}>
            Сохранить черновик
          </Button>
        </div>
        <div className="flex gap-2">
          {step < STEPS.length - 1 ? (
            <Button disabled={!canProceed} onClick={() => setStep((s) => s + 1)}>
              Далее
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button disabled={!canProceed} onClick={publish}>
              <Check className="h-4 w-4" />
              Опубликовать
            </Button>
          )}
        </div>
      </div>

    </div>
  );
}
