import {
  getDescriptionSectionTemplate,
  parseSectionFieldValues,
} from "../../constants/request-description-sections.ts";
import type { TorSection } from "../../data/types/index.ts";

export interface FieldIssue {
  step: number;
  field?: string;
  message: string;
}

export interface EventFormValidationInput {
  title: string;
  description: string;
  city: string;
  startDate: string;
  endDate: string;
  assemblyStart: string;
  assemblyEnd: string;
  dismantlingStart: string;
  dismantlingEnd: string;
}

export function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function collectCategoryDateValues(sections: TorSection[]): {
  id: string;
  label: string;
  value: string;
}[] {
  const dates: { id: string; label: string; value: string }[] = [];
  for (const section of sections) {
    const template = getDescriptionSectionTemplate(section.title);
    if (!template) continue;
    const values = parseSectionFieldValues(section.content);
    for (const field of template.fields) {
      if (field.type !== "date") continue;
      const value = values[field.id]?.trim() ?? "";
      dates.push({ id: field.id, label: field.label, value });
    }
  }
  return dates;
}

export function collectCategoryDateIssues(
  sections: TorSection[],
  executionStart: string,
  executionEnd: string,
  step = 3
): FieldIssue[] {
  const issues: FieldIssue[] = [];
  const dates = collectCategoryDateValues(sections);
  if (!executionStart || !executionEnd) return issues;

  for (const item of dates) {
    if (!item.value) continue;
    if (!isIsoDate(item.value)) {
      issues.push({
        step,
        field: item.id,
        message: `${item.label}: укажите дату в календаре`,
      });
      continue;
    }
    if (item.value < executionStart || item.value > executionEnd) {
      issues.push({
        step,
        field: item.id,
        message: `${item.label} должна быть внутри общего периода выполнения`,
      });
    }
  }

  const byId = Object.fromEntries(dates.map((item) => [item.id, item]));
  const pairs: [string, string][] = [
    ["exhibitionStart", "exhibitionEnd"],
    ["rentalStart", "rentalEnd"],
    ["transportStart", "transportEnd"],
    ["serviceStart", "serviceEnd"],
  ];
  for (const [startId, endId] of pairs) {
    const start = byId[startId];
    const end = byId[endId];
    if (start?.value && end?.value && start.value > end.value) {
      issues.push({
        step,
        field: endId,
        message: `${end.label} не может быть раньше, чем ${start.label}`,
      });
    }
  }

  return issues;
}

export function collectEventFormIssues(
  data: EventFormValidationInput,
  today: string,
  mode: "create" | "edit"
): FieldIssue[] {
  const issues: FieldIssue[] = [];

  if (!data.title.trim()) {
    issues.push({ step: 0, field: "title", message: "Укажите название мероприятия" });
  }
  if (!data.description.trim()) {
    issues.push({ step: 0, field: "description", message: "Добавьте описание" });
  }
  if (!data.city.trim()) {
    issues.push({ step: 0, field: "city", message: "Выберите город" });
  }
  if (!data.startDate || !data.endDate) {
    issues.push({ step: 0, field: "startDate", message: "Укажите даты начала и окончания" });
  } else {
    if (data.endDate < data.startDate) {
      issues.push({ step: 0, field: "endDate", message: "Окончание не может быть раньше начала" });
    }
    if (mode === "create" && data.startDate < today) {
      issues.push({
        step: 0,
        field: "startDate",
        message: "Для нового мероприятия нельзя выбрать прошедшую дату начала",
      });
    }
  }

  if (data.assemblyStart && data.assemblyEnd && data.assemblyEnd < data.assemblyStart) {
    issues.push({
      step: 0,
      field: "assemblyEnd",
      message: "Монтаж: окончание раньше начала",
    });
  }
  if (data.assemblyEnd && data.startDate && data.assemblyEnd > data.startDate) {
    issues.push({
      step: 0,
      field: "assemblyEnd",
      message: "Монтаж должен закончиться до начала мероприятия или в день начала",
    });
  }
  if (data.dismantlingStart && data.endDate && data.dismantlingStart < data.endDate) {
    issues.push({
      step: 0,
      field: "dismantlingStart",
      message: "Демонтаж не может начаться раньше окончания мероприятия",
    });
  }
  if (
    data.dismantlingStart &&
    data.dismantlingEnd &&
    data.dismantlingEnd < data.dismantlingStart
  ) {
    issues.push({
      step: 0,
      field: "dismantlingEnd",
      message: "Демонтаж: окончание раньше начала",
    });
  }

  return issues;
}

export function isMeaningfulRequestDraft(value: Record<string, unknown> | null | undefined): boolean {
  if (!value || Object.keys(value).length === 0) return false;
  const data = (value.data as Record<string, unknown> | undefined) ?? value;
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const category = typeof data.category === "string" ? data.category.trim() : "";
  const description = typeof data.description === "string" ? data.description.trim() : "";
  const start = typeof data.executionStart === "string" ? data.executionStart : "";
  return Boolean(title || category || description || start);
}
