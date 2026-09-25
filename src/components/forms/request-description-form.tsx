"use client";

import { cn } from "@/lib/utils/cn";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getDescriptionSectionTemplate,
  parseSectionFieldValues,
  serializeSectionFieldValues,
} from "@/constants/request-description-sections";
import type { TorSection } from "@/data/types";

export type RequestDescriptionMode = "structured" | "freeform";

interface RequestDescriptionFormProps {
  title: string;
  summary: string;
  expectedResult: string;
  sections: TorSection[];
  descriptionMode: RequestDescriptionMode;
  freeformDescription: string;
  onTitleChange: (value: string) => void;
  onSummaryChange: (value: string) => void;
  onExpectedResultChange: (value: string) => void;
  onSectionsChange: (sections: TorSection[]) => void;
  onDescriptionModeChange: (mode: RequestDescriptionMode) => void;
  onFreeformDescriptionChange: (value: string) => void;
  compact?: boolean;
}

const DESCRIPTION_MODE_OPTIONS: {
  id: RequestDescriptionMode;
  label: string;
  description: string;
}[] = [
  {
    id: "structured",
    label: "Составить полноценное ТЗ",
    description: "Пошаговое заполнение всех разделов проекта",
  },
  {
    id: "freeform",
    label: "Составить ТЗ в свободной форме",
    description: "Один текстовый блок для чернового описания задачи",
  },
];

export function RequestDescriptionForm({
  title,
  summary,
  expectedResult,
  sections,
  descriptionMode,
  freeformDescription,
  onTitleChange,
  onSummaryChange,
  onExpectedResultChange,
  onSectionsChange,
  onDescriptionModeChange,
  onFreeformDescriptionChange,
  compact = false,
}: RequestDescriptionFormProps) {
  const visibleSections = compact
    ? sections.filter((section) => section.required)
    : sections;

  const updateField = (sectionId: string, fieldId: string, value: string) => {
    onSectionsChange(
      sections.map((section) => {
        if (section.id !== sectionId) return section;

        const currentValues = parseSectionFieldValues(section.content);
        if (currentValues._legacy) {
          delete currentValues._legacy;
        }

        return {
          ...section,
          content: serializeSectionFieldValues({
            ...currentValues,
            [fieldId]: value,
          }),
        };
      }),
    );
  };

  return (
    <div className="space-y-8">
      <Input
        id="wizard-field-title"
        label="Название заявки *"
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        placeholder="Например: Дизайн-проект и строительство выставочного стенда"
      />

      <Textarea
        id="wizard-field-description"
        label="Краткое описание *"
        value={summary}
        onChange={(event) => onSummaryChange(event.target.value)}
        placeholder="1–2 предложения: суть задачи и ключевой результат"
      />

      <Textarea
        id="wizard-field-expectedResult"
        label="Ожидаемый результат *"
        value={expectedResult}
        onChange={(event) => onExpectedResultChange(event.target.value)}
        placeholder="Что должно быть готово к концу работ"
      />

      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-900">Формат описания</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {DESCRIPTION_MODE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onDescriptionModeChange(option.id)}
              className={cn(
                "rounded-card border p-4 text-left transition-colors",
                descriptionMode === option.id
                  ? "border-gray-900 bg-[var(--account-accent-soft,#eef0fe)] ring-1 ring-gray-900"
                  : "border-gray-300 hover:border-gray-900",
              )}
            >
              <p className="text-sm font-medium text-gray-900">{option.label}</p>
              <p className="mt-1 text-xs text-gray-600">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {descriptionMode === "freeform" ? (
        <div className="space-y-3">
          <Textarea
            label="ТЗ в свободной форме *"
            value={freeformDescription}
            onChange={(event) => onFreeformDescriptionChange(event.target.value)}
            placeholder="Опишите задачу своими словами: цели, параметры стенда, пожелания по дизайну, сроки и другие важные детали"
            className="min-h-[280px]"
          />
          <p className="text-xs text-gray-600">
            * На этапе проработки проекта нужно будет вернуться к составлению подробного ТЗ.
            Так больше шансов, что исполнитель попадёт в ваши ожидания.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <p className="text-sm text-gray-700">
            Заполните разделы описания проекта. Обязательные поля отмечены *.
          </p>

          {visibleSections.map((section, index) => {
            const template = getDescriptionSectionTemplate(section.title);
            const values = parseSectionFieldValues(section.content);

            return (
              <section key={section.id} className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  {index + 1}. {section.title}
                  {section.required && <span className="text-gray-500"> *</span>}
                </h3>

                <div className="space-y-3">
                  {template?.fields.map((field) => {
                    const fieldValue = values._legacy ? "" : (values[field.id] ?? "");

                    if (field.type === "textarea") {
                      return (
                        <Textarea
                          key={field.id}
                          label={`${field.label}${field.required ? " *" : ""}`}
                          value={fieldValue}
                          onChange={(event) => updateField(section.id, field.id, event.target.value)}
                          placeholder={field.placeholder}
                        />
                      );
                    }

                    return (
                      <Input
                        key={field.id}
                        id={`wizard-field-${field.id}`}
                        type={field.type === "date" ? "date" : "text"}
                        label={`${field.label}${field.required ? " *" : ""}`}
                        value={fieldValue}
                        onChange={(event) => updateField(section.id, field.id, event.target.value)}
                        placeholder={field.type === "date" ? undefined : field.placeholder}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}

          {!compact && (
            <p className="text-xs text-gray-600">
              Всего разделов: {sections.length}. Дополнительные материалы
              можно приложить на шаге «Файлы».
            </p>
          )}
        </div>
      )}
    </div>
  );
}