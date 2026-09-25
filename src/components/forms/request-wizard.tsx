"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  formatSectionContentForDisplay,
  isDescriptionSectionFilled,
} from "@/constants/request-description-sections";
import {
  collectRequestWizardIssues,
  createRequestSections,
  getRequestSchema,
} from "@/constants/request-schemas";
import { isMeaningfulRequestDraft } from "@/lib/domain/form-validation";
import { usePrototypeHydrated } from "@/lib/hooks/use-prototype-hydrated";
import { getPrototypeNowDateIso } from "@/lib/time/now";
import { REQUEST_FORMAT_DESCRIPTIONS, REQUEST_FORMAT_LABELS } from "@/constants/statuses";
import { SEED_CONTRACTORS, SEED_EVENTS } from "@/data/mocks/seed";
import type { Request, RequestFormat, TorSection } from "@/data/types";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { cn } from "@/lib/utils/cn";
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
  torSections: createRequestSections(""),
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
  initialTitle?: string;
  initialDescription?: string;
  onPublished: (request: Request) => void;
}

function applyInitialParams(
  base: RequestWizardData,
  params: Pick<
    RequestWizardProps,
    | "initialFormat"
    | "initialEventId"
    | "initialContractorId"
    | "initialCategory"
    | "initialTitle"
    | "initialDescription"
  >
): RequestWizardData {
  let next = { ...base };
  if (params.initialFormat) next.format = params.initialFormat;
  if (params.initialCategory) {
    next.category = params.initialCategory;
    next.torSections = createRequestSections(params.initialCategory);
  }
  if (params.initialTitle && !next.title) next.title = params.initialTitle;
  if (params.initialDescription && !next.description) next.description = params.initialDescription;
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

interface WizardDraftEnvelope {
  schemaVersion: 1;
  updatedAt: string;
  step: number;
  revision: number;
  tabId: string;
  data: RequestWizardData;
}

function getWizardTabId() {
  if (typeof sessionStorage === "undefined") return "ssr";
  const key = "request-wizard-tab-id";
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const next = `tab-${Date.now()}`;
  sessionStorage.setItem(key, next);
  return next;
}

function readDraftEnvelope(raw: Record<string, unknown> | null | undefined): WizardDraftEnvelope | null {
  if (!raw || Object.keys(raw).length === 0) return null;
  if (raw.schemaVersion === 1 && raw.data && typeof raw.data === "object") {
    return raw as unknown as WizardDraftEnvelope;
  }
  return {
    schemaVersion: 1,
    updatedAt: "",
    step: typeof raw.step === "number" ? raw.step : 0,
    revision: 0,
    tabId: "",
    data: raw as unknown as RequestWizardData,
  };
}

function draftStatusLabel(status: "idle" | "saving" | "saved" | "error") {
  if (status === "saving") return "Сохраняется…";
  if (status === "saved") return "Сохранено";
  if (status === "error") return "Не удалось сохранить";
  return "";
}

export function RequestWizard({
  initialFormat,
  initialEventId,
  initialContractorId,
  initialCategory,
  initialTitle,
  initialDescription,
  onPublished,
}: RequestWizardProps) {
  const { requestWizardDraft, setRequestWizardDraft } = usePrototypeStore();
  const hydrated = usePrototypeHydrated();
  const user = useAuthStore((state) => state.user);
  const { showToast } = useToast();
  const tabIdRef = useRef(getWizardTabId());
  const revisionRef = useRef(0);
  const [step, setStep] = useState(0);
  const [eventIndustryFilter, setEventIndustryFilter] = useState("");
  const [eventCityFilter, setEventCityFilter] = useState("");
  const [eventMonthFilter, setEventMonthFilter] = useState("");
  const [eventSearch, setEventSearch] = useState("");
  const [data, setData] = useState<RequestWizardData>(() =>
    applyInitialParams(defaultData(initialFormat), {
      initialFormat,
      initialEventId,
      initialContractorId,
      initialCategory,
      initialTitle,
      initialDescription,
    })
  );
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify({ step: 0, data }));
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [restoredNotice, setRestoredNotice] = useState(false);
  const [conflictNotice, setConflictNotice] = useState(false);
  const [ready, setReady] = useState(false);

  const update = useCallback((updates: Partial<RequestWizardData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const persistDraft = useCallback(
    (next: RequestWizardData, nextStep: number, silent = false) => {
      setSaveStatus("saving");
      try {
        revisionRef.current += 1;
        const envelope: WizardDraftEnvelope = {
          schemaVersion: 1,
          updatedAt: new Date().toISOString(),
          step: nextStep,
          revision: revisionRef.current,
          tabId: tabIdRef.current,
          data: next,
        };
        setRequestWizardDraft(envelope as unknown as Record<string, unknown>);
        setSavedSnapshot(JSON.stringify({ step: nextStep, data: next }));
        setSaveStatus("saved");
        if (!silent) showToast("Черновик заявки сохранён", "info");
      } catch {
        setSaveStatus("error");
        if (!silent) showToast("Не удалось сохранить черновик", "error");
      }
    },
    [setRequestWizardDraft, showToast]
  );

  const saveDraft = useCallback(() => {
    persistDraft(data, step);
  }, [data, persistDraft, step]);

  useEffect(() => {
    if (!hydrated || ready) return;
    const envelope = readDraftEnvelope(requestWizardDraft);
    if (envelope && isMeaningfulRequestDraft(envelope as unknown as Record<string, unknown>)) {
      const merged = applyInitialParams(
        {
          ...defaultData(initialFormat),
          ...envelope.data,
          torSections: envelope.data.torSections?.length
            ? envelope.data.torSections
            : createRequestSections(envelope.data.category ?? initialCategory ?? ""),
        },
        {
          initialFormat,
          initialEventId,
          initialContractorId,
          initialCategory,
          initialTitle,
          initialDescription,
        }
      );
      setData(merged);
      setStep(envelope.step || 0);
      revisionRef.current = envelope.revision || 0;
      setSavedSnapshot(JSON.stringify({ step: envelope.step || 0, data: merged }));
      setRestoredNotice(true);
      setSaveStatus("saved");
    }
    setReady(true);
  }, [
    hydrated,
    ready,
    requestWizardDraft,
    initialFormat,
    initialEventId,
    initialContractorId,
    initialCategory,
    initialTitle,
    initialDescription,
  ]);

  useEffect(() => {
    if (!ready) return;
    if (!isMeaningfulRequestDraft({ data } as Record<string, unknown>) && revisionRef.current === 0) {
      return;
    }
    const timer = window.setTimeout(() => {
      persistDraft(data, step, true);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [data, persistDraft, ready, step]);

  useEffect(() => {
    const dirty = JSON.stringify({ step, data }) !== savedSnapshot;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [data, savedSnapshot, step]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== "prototype-storage" || !event.newValue) return;
      try {
        const parsed = JSON.parse(event.newValue) as {
          state?: { requestWizardDraft?: Record<string, unknown> };
        };
        const remote = readDraftEnvelope(parsed.state?.requestWizardDraft);
        if (!remote || remote.tabId === tabIdRef.current) return;
        if (remote.revision <= revisionRef.current) return;
        const dirty = JSON.stringify({ step, data }) !== savedSnapshot;
        if (dirty) {
          setConflictNotice(true);
          return;
        }
        setData(remote.data);
        setStep(remote.step);
        revisionRef.current = remote.revision;
        setSavedSnapshot(JSON.stringify({ step: remote.step, data: remote.data }));
      } catch {
        setSaveStatus("error");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [data, savedSnapshot, step]);

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

  const removeMandatoryFile = (itemId: string, fileName: string) => {
    update({
      mandatoryFiles: {
        ...data.mandatoryFiles,
        [itemId]: (data.mandatoryFiles[itemId] ?? []).filter((name) => name !== fileName),
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

  const schema = getRequestSchema(data.category);
  const today = getPrototypeNowDateIso();
  const publishIssues = useMemo(
    () => collectRequestWizardIssues(data, today),
    [data, today]
  );
  const isPublishReady = publishIssues.length === 0;
  const dateIssue = publishIssues.find((issue) => issue.step === 4);

  const goToStep = (nextStep: number, field?: string) => {
    persistDraft(data, nextStep, true);
    setStep(nextStep);
    if (field) {
      window.requestAnimationFrame(() => {
        document.getElementById(`wizard-field-${field}`)?.focus();
      });
    }
  };

  const canProceed = useMemo(() => {
    if (step === 7) return true;
    return !publishIssues.some((issue) => issue.step === step);
  }, [step, publishIssues]);

  const publish = () => {
    if (!isPublishReady) {
      showToast("Исправьте ошибки из списка перед публикацией", "error");
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
      publishedAt: today,
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
            const label = schema.fileItems.find((item) => item.id === itemId)?.label ?? itemId;
            return `[${label}] ${name}`;
          })
        ),
      ],
      cloudLinks: data.cloudLinks.trim() || undefined,
      history: [{ date: today, action: "Опубликована" }],
    };
    setRequestWizardDraft({});
    revisionRef.current = 0;
    setSavedSnapshot(JSON.stringify({ step: 0, data: defaultData(data.format) }));
    onPublished(request);
  };

  return (
    <div className="space-y-6">
      <StepIndicator steps={STEPS} currentStep={step} />
      {draftStatusLabel(saveStatus) ? (
        <p className="text-xs text-gray-600" aria-live="polite">
          {draftStatusLabel(saveStatus)}
        </p>
      ) : null}
      {restoredNotice ? (
        <p className="text-sm text-gray-700">
          Черновик восстановлен.{" "}
          <button
            type="button"
            className="underline"
            onClick={() => {
              const empty = applyInitialParams(defaultData(initialFormat), {
                initialFormat,
                initialEventId,
                initialContractorId,
                initialCategory,
                initialTitle,
                initialDescription,
              });
              setData(empty);
              setStep(0);
              setRequestWizardDraft({});
              revisionRef.current = 0;
              setRestoredNotice(false);
              setSavedSnapshot(JSON.stringify({ step: 0, data: empty }));
            }}
          >
            Отменить и начать заново
          </button>
        </p>
      ) : null}
      {conflictNotice ? (
        <p className="text-sm text-red-700">
          Черновик изменён в другой вкладке. Текущие несохранённые правки не перезаписаны.
        </p>
      ) : null}

      {step === 0 && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            {FORMATS.map((format) => (
              <Card
                key={format}
                onClick={() => update({ format })}
                className={
                  data.format === format
                    ? "border-gray-900 ring-1 ring-gray-900 bg-[var(--account-accent-soft,#eef0fe)]"
                    : ""
                }
              >
                <CardTitle className="text-sm">{REQUEST_FORMAT_LABELS[format]}</CardTitle>
                <CardDescription className="text-xs mt-2">
                  {REQUEST_FORMAT_DESCRIPTIONS[format]}
                </CardDescription>
              </Card>
            ))}
          </div>

          {data.format === "closed_request" && (
            <div className="border border-gray-300 p-4 space-y-3 rounded-card">
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
                      className={cn(
                        "text-left border px-3 py-2 text-sm transition-colors rounded-card",
                        selected
                          ? "border-[var(--account-accent,#2939eb)] bg-[var(--account-accent-soft,#eef0fe)] font-medium"
                          : "border-gray-300 hover:border-[var(--account-accent,#2939eb)] hover:bg-[var(--account-accent-soft,#eef0fe)]",
                      )}
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
          id="wizard-field-category"
          label="Категория услуги *"
          value={data.category}
          onChange={(e) => {
            const category = e.target.value;
            update({
              category,
              torSections: createRequestSections(category),
              mandatoryFiles: {},
            });
          }}
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

          <div className="border border-gray-300 divide-y divide-gray-200 max-h-72 overflow-y-auto rounded-card">
            <button
              type="button"
              onClick={() => selectEvent("")}
              className={`w-full text-left px-3 py-3 text-sm transition-colors hover:bg-gray-50 ${
                !data.eventId
                  ? "bg-[var(--account-accent-soft,#eef0fe)] font-medium"
                  : ""
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
                      ? "bg-[var(--account-accent-soft,#eef0fe)] font-medium"
                      : ""
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
          expectedResult={data.expectedResult}
          sections={data.torSections}
          descriptionMode={data.descriptionMode}
          freeformDescription={data.freeformDescription}
          onTitleChange={(title) => update({ title })}
          onSummaryChange={(description) => update({ description })}
          onExpectedResultChange={(expectedResult) => update({ expectedResult })}
          onSectionsChange={(torSections) => update({ torSections })}
          onDescriptionModeChange={(descriptionMode) => update({ descriptionMode })}
          onFreeformDescriptionChange={(freeformDescription) => update({ freeformDescription })}
          compact={data.format === "urgent"}
        />
      )}

      {step === 4 && (
        <div className="space-y-2" id="wizard-field-executionStart">
          <DateRangePicker
            label="Диапазон выполнения *"
            start={data.executionStart}
            end={data.executionEnd}
            minDate={today}
            onChange={(executionStart, executionEnd) => update({ executionStart, executionEnd })}
            placeholder="Выберите период в календаре"
          />
          {dateIssue ? <p className="text-xs text-red-600">{dateIssue.message}</p> : null}
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <Select
            id="wizard-field-budget"
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
          <p className="text-sm text-gray-700">{schema.filesIntro}</p>
          <FileUpload
            label="Дополнительные файлы"
            files={data.files}
            onUpload={(name) => update({ files: [...data.files, name] })}
            onRemove={(name) => update({ files: data.files.filter((item) => item !== name) })}
          />

          <div className="space-y-4">
            <p className="text-sm font-medium">
              {schema.fileItems.some((item) => item.required)
                ? "Файлы по схеме категории"
                : "Дополнительные файлы (необязательно)"}
            </p>
            <ol className="space-y-4">
              {schema.fileItems.map((item, index) => (
                <li key={item.id} className="text-sm">
                  <p className="font-medium">
                    {index + 1}. {item.label}
                    {item.required ? " *" : " (необязательно)"}
                    {item.hint && (
                      <span className="font-normal text-gray-600"> ({item.hint})</span>
                    )}
                  </p>
                  <div className="mt-2">
                    <FileUpload
                      label={`Загрузить: ${item.label}`}
                      files={data.mandatoryFiles[item.id] ?? []}
                      onUpload={(name) => addMandatoryFile(item.id, name)}
                      onRemove={(name) => removeMandatoryFile(item.id, name)}
                    />
                  </div>
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
        <div className="border border-gray-900 p-4 space-y-4 bg-gray-50 rounded-card">
          {!isPublishReady && (
            <div className="border border-red-300 bg-red-50 p-3 space-y-2 rounded-card">
              <p className="text-sm font-medium text-red-800">Нельзя опубликовать, пока не исправлены поля:</p>
              <ul className="space-y-1">
                {publishIssues.map((issue) => (
                  <li key={`${issue.step}-${issue.message}`}>
                    <button
                      type="button"
                      className="text-sm text-red-800 underline text-left"
                      onClick={() => goToStep(issue.step, issue.field)}
                    >
                      Шаг «{STEPS[issue.step]}»: {issue.message}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
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

      <div className="grid w-full grid-cols-[1fr_auto] items-start gap-3 border-t border-gray-300 pt-4">
        <div className="flex flex-wrap gap-2">
          {step > 0 && (
            <Button variant="outline" onClick={() => goToStep(step - 1)}>
              <ChevronLeft className="h-4 w-4" />
              Назад
            </Button>
          )}
          <Button variant="ghost" onClick={saveDraft}>
            Сохранить черновик
          </Button>
        </div>
        <div className="flex flex-col items-end gap-1">
          {step < STEPS.length - 1 ? (
            <>
              <Button disabled={!canProceed} onClick={() => goToStep(step + 1)}>
                Далее
                <ChevronRight className="h-4 w-4" />
              </Button>
              {!canProceed ? (
                <p className="max-w-[260px] text-right text-xs text-gray-600">
                  Заполните обязательные поля этого шага, чтобы продолжить
                </p>
              ) : null}
            </>
          ) : (
            <>
              <Button disabled={!isPublishReady} onClick={publish}>
                <Check className="h-4 w-4" />
                Опубликовать
              </Button>
              {!isPublishReady ? (
                <p className="max-w-[260px] text-right text-xs text-gray-600">
                  Исправьте ошибки в списке выше — публикация закрыта
                </p>
              ) : null}
            </>
          )}
        </div>
      </div>

    </div>
  );
}