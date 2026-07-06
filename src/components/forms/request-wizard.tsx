"use client";

import { useCallback, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { TorConstructor } from "@/components/forms/tor-constructor";
import { Button } from "@/components/ui/button";
import { FileUpload, StepIndicator } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { CITIES, SERVICE_CATEGORIES } from "@/constants/categories";
import { REQUEST_FORMAT_LABELS } from "@/constants/statuses";
import { SEED_CONTRACTORS, SEED_EVENTS } from "@/data/mocks/seed";
import type { Request, RequestFormat, TorSection } from "@/data/types";
import { usePrototypeStore } from "@/lib/store";
import { formatPrice, formatShortDate } from "@/lib/utils/formatters";
import { useToast } from "@/components/ui/toast-provider";

const STEPS = [
  "Формат",
  "Категория",
  "Мероприятие",
  "География",
  "Описание",
  "Сроки",
  "Бюджет",
  "Файлы",
  "ТЗ",
  "Публикация",
];

const FORMATS: RequestFormat[] = ["open_request", "closed_request", "urgent", "safe_deal"];

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
  deadline: string;
  budget: Request["budget"];
  files: string[];
  torSections: TorSection[];
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
  deadline: "",
  budget: { type: "range", min: undefined, max: undefined },
  files: [],
  torSections: [],
  torMode: format === "urgent" ? "urgent" : "constructor",
  torFiles: [],
  invitedContractorIds: [],
});

interface RequestWizardProps {
  initialFormat?: RequestFormat;
  onPublished: (request: Request) => void;
}

export function RequestWizard({ initialFormat, onPublished }: RequestWizardProps) {
  const { requestWizardDraft, setRequestWizardDraft } = usePrototypeStore();
  const { showToast } = useToast();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<RequestWizardData>(() => {
    const draft = requestWizardDraft as Partial<RequestWizardData>;
    if (draft && Object.keys(draft).length > 0) {
      return { ...defaultData(initialFormat), ...draft };
    }
    return defaultData(initialFormat);
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

  const canProceed = useMemo(() => {
    switch (step) {
      case 0:
        return !!data.format;
      case 1:
        return !!data.category;
      case 2:
        return true;
      case 3:
        return !!data.city;
      case 4:
        return !!data.title.trim() && !!data.description.trim();
      case 5:
        return !!data.deadline;
      case 6:
        return !!data.budget.type;
      case 7:
        return true;
      case 8:
        if (data.torMode === "upload") return data.torFiles.length > 0;
        if (data.torMode === "urgent") return !!data.torSections[0]?.content?.trim();
        return (
          data.torSections.length === 0 ||
          data.torSections.filter((s) => s.required).every((s) => s.title.trim() && s.content.trim())
        );
      case 9:
        return true;
      default:
        return true;
    }
  }, [step, data]);

  const publish = () => {
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
      deadline: data.deadline,
      description: data.description,
      requirements: data.requirements,
      expectedResult: data.expectedResult,
      eventId: data.eventId || undefined,
      invitedContractorIds: data.format === "closed_request" ? data.invitedContractorIds : [],
      responseCount: 0,
      publishedAt: new Date().toISOString().split("T")[0],
      customerId: "user-customer",
      torSections: data.torSections,
      files: [...data.files, ...data.torFiles],
      history: [{ date: new Date().toISOString().split("T")[0], action: "Опубликована" }],
    };
    setRequestWizardDraft({});
    onPublished(request);
  };

  const toggleContractor = (id: string) => {
    update({
      invitedContractorIds: data.invitedContractorIds.includes(id)
        ? data.invitedContractorIds.filter((c) => c !== id)
        : [...data.invitedContractorIds, id],
    });
  };

  const toggleCity = (city: string) => {
    update({
      cities: data.cities.includes(city)
        ? data.cities.filter((c) => c !== city)
        : [...data.cities, city],
    });
  };

  return (
    <div className="space-y-6">
      <StepIndicator steps={STEPS} currentStep={step} />

      {step === 0 && (
        <div className="grid sm:grid-cols-2 gap-3">
          {FORMATS.map((format) => (
            <Card
              key={format}
              onClick={() =>
                update({
                  format,
                  torMode: format === "urgent" ? "urgent" : data.torMode === "urgent" ? "constructor" : data.torMode,
                })
              }
              className={data.format === format ? "border-gray-900 ring-1 ring-gray-900" : ""}
            >
              <CardTitle className="text-sm">{REQUEST_FORMAT_LABELS[format]}</CardTitle>
              <CardDescription className="text-xs mt-2">
                {format === "safe_deal" && "Оплата через резерв платформы"}
                {format === "urgent" && "Быстрый подбор исполнителя"}
                {format === "open_request" && "Отклики от всех исполнителей"}
                {format === "closed_request" && "Приглашения выбранным исполнителям"}
              </CardDescription>
            </Card>
          ))}
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
        <div className="space-y-3">
          <p className="text-sm text-gray-700">Привязка к мероприятию (необязательно):</p>
          <Select
            label="Мероприятие"
            value={data.eventId}
            onChange={(e) => {
              const event = SEED_EVENTS.find((ev) => ev.id === e.target.value);
              update({
                eventId: e.target.value,
                city: event?.city ?? data.city,
                title: data.title || (event ? `Услуги для ${event.title}` : data.title),
              });
            }}
            options={[
              { value: "", label: "Без привязки к мероприятию" },
              ...SEED_EVENTS.map((e) => ({
                value: e.id,
                label: `${e.title} · ${e.city} · ${formatShortDate(e.startDate)}`,
              })),
            ]}
          />
          {selectedEvent && (
            <div className="border border-gray-300 p-3 text-sm">
              <p className="font-medium">{selectedEvent.title}</p>
              <p className="text-gray-600 mt-1">{selectedEvent.venue}, {selectedEvent.city}</p>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <Select
            label="Основной город *"
            value={data.city}
            onChange={(e) => update({ city: e.target.value })}
            options={CITIES.map((c) => ({ value: c, label: c }))}
          />
          <div>
            <p className="text-sm font-medium mb-2">Дополнительные города</p>
            <div className="flex flex-wrap gap-2">
              {CITIES.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => toggleCity(city)}
                  className={`px-3 py-1 text-xs border ${
                    data.cities.includes(city)
                      ? "bg-gray-900 text-white border-gray-900"
                      : "border-gray-300 hover:border-gray-900"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
          {data.format === "closed_request" && (
            <div className="border border-gray-300 p-4 space-y-2">
              <p className="text-sm font-medium">Пригласить исполнителей</p>
              {SEED_CONTRACTORS.slice(0, 6).map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.invitedContractorIds.includes(c.id)}
                    onChange={() => toggleContractor(c.id)}
                    className="border-gray-900"
                  />
                  {c.name} · {c.city}
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <Input
            label="Название заявки *"
            value={data.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="Краткое название"
          />
          <Textarea
            label="Описание задачи *"
            value={data.description}
            onChange={(e) => update({ description: e.target.value })}
          />
          <Textarea
            label="Требования"
            value={data.requirements}
            onChange={(e) => update({ requirements: e.target.value })}
          />
          <Textarea
            label="Ожидаемый результат"
            value={data.expectedResult}
            onChange={(e) => update({ expectedResult: e.target.value })}
          />
        </div>
      )}

      {step === 5 && (
        <Input
          label="Дедлайн выполнения *"
          type="date"
          value={data.deadline}
          onChange={(e) => update({ deadline: e.target.value })}
        />
      )}

      {step === 6 && (
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

      {step === 7 && (
        <div className="space-y-3">
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
        </div>
      )}

      {step === 8 && (
        <TorConstructor
          sections={data.torSections}
          onChange={(torSections) => update({ torSections })}
          onDraftSave={saveDraft}
          mode={data.torMode}
          onModeChange={(torMode) => update({ torMode })}
          uploadedFiles={data.torFiles}
          onFilesChange={(torFiles) => update({ torFiles })}
        />
      )}

      {step === 9 && (
        <div className="border border-gray-900 p-4 space-y-4 bg-gray-50">
          <h3 className="font-semibold">Предпросмотр заявки</h3>
          <div className="flex flex-wrap gap-2">
            <Badge>{REQUEST_FORMAT_LABELS[data.format]}</Badge>
            <Badge variant="outline">{data.category || "—"}</Badge>
            <Badge variant="dashed">{data.city}</Badge>
          </div>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Название:</span> {data.title}</p>
            <p><span className="font-medium">Описание:</span> {data.description}</p>
            <p><span className="font-medium">Дедлайн:</span> {data.deadline}</p>
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
            {selectedEvent && (
              <p><span className="font-medium">Мероприятие:</span> {selectedEvent.title}</p>
            )}
            <p><span className="font-medium">Файлов:</span> {data.files.length + data.torFiles.length}</p>
            <p><span className="font-medium">Разделов ТЗ:</span> {data.torSections.length}</p>
          </div>
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
