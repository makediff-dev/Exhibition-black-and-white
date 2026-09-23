import {
  createDefaultDescriptionSections,
  isDescriptionSectionComplete,
  LOGISTICS_DESCRIPTION_SECTIONS,
  RENTAL_DESCRIPTION_SECTIONS,
  SERVICE_DESCRIPTION_SECTIONS,
  STAND_DESCRIPTION_SECTIONS,
  type RequestDescriptionSectionTemplate,
} from "./request-description-sections.ts";
import type { Request, TorSection } from "../data/types/index.ts";

export type RequestSchemaKind = "stand" | "rental" | "logistics" | "service";

export interface RequestFileItem {
  id: string;
  label: string;
  hint?: string;
  required: boolean;
}

export interface RequestCategorySchema {
  kind: RequestSchemaKind;
  descriptionSections: RequestDescriptionSectionTemplate[];
  fileItems: RequestFileItem[];
  filesIntro: string;
}

const STAND_CATEGORIES = new Set([
  "Комплексное строительство выставочных стендов",
  "Дизайн-проект выставочного стенда",
  "Проектирование",
  "Корпоративные музеи",
  "Дизайн офиса",
  "Уличные конструкции",
  "Световые инсталляции",
]);

const RENTAL_CATEGORIES = new Set(["Аренда мультимедиа", "Аренда мебели"]);

const LOGISTICS_CATEGORIES = new Set(["Логистика", "Монтаж"]);

export function getRequestSchemaKind(category: string): RequestSchemaKind {
  if (STAND_CATEGORIES.has(category)) return "stand";
  if (RENTAL_CATEGORIES.has(category)) return "rental";
  if (LOGISTICS_CATEGORIES.has(category)) return "logistics";
  return "service";
}

const SCHEMAS: Record<RequestSchemaKind, RequestCategorySchema> = {
  stand: {
    kind: "stand",
    descriptionSections: STAND_DESCRIPTION_SECTIONS,
    fileItems: [
      { id: "layout", label: "Планировка", required: true },
      { id: "logo", label: "Лого", required: true },
      { id: "references", label: "Референсы", required: true },
      {
        id: "past-stands",
        label: "Фото прошлых стендов",
        hint: "если требуется повторить прошлую концепцию",
        required: false,
      },
    ],
    filesIntro: "Для застройки и дизайна стенда нужны планировка, логотип и референсы.",
  },
  rental: {
    kind: "rental",
    descriptionSections: RENTAL_DESCRIPTION_SECTIONS,
    fileItems: [
      { id: "spec", label: "Спецификация или список позиций", required: false },
      { id: "photos", label: "Фото места установки", required: false },
    ],
    filesIntro: "Файлы необязательны. Приложите спецификацию или фото, если они помогут исполнителю.",
  },
  logistics: {
    kind: "logistics",
    descriptionSections: LOGISTICS_DESCRIPTION_SECTIONS,
    fileItems: [
      { id: "packing-list", label: "Упаковочный лист", required: false },
      { id: "layout", label: "Схема разгрузки", required: false },
    ],
    filesIntro: "Файлы необязательны. Упаковочный лист ускоряет расчёт перевозки.",
  },
  service: {
    kind: "service",
    descriptionSections: SERVICE_DESCRIPTION_SECTIONS,
    fileItems: [
      { id: "brief", label: "Бриф или меню", required: false },
      { id: "references", label: "Референсы", required: false },
    ],
    filesIntro: "Файлы необязательны. Приложите бриф, меню или референсы по желанию.",
  },
};

export function getRequestSchema(category: string): RequestCategorySchema {
  return SCHEMAS[getRequestSchemaKind(category)];
}

export function createRequestSections(category: string): TorSection[] {
  return createDefaultDescriptionSections(getRequestSchema(category).descriptionSections);
}

export interface RequestWizardIssue {
  step: number;
  message: string;
}

export interface RequestWizardValidationInput {
  format: Request["format"] | "";
  category: string;
  title: string;
  description: string;
  expectedResult: string;
  descriptionMode: "structured" | "freeform";
  freeformDescription: string;
  torSections: TorSection[];
  executionStart: string;
  executionEnd: string;
  budget: Request["budget"];
  mandatoryFiles: Record<string, string[]>;
  invitedContractorIds: string[];
}

export function isBudgetValueValid(budget: Request["budget"]): boolean {
  if (budget.type === "hidden" || budget.type === "request_quote") {
    return true;
  }
  if (budget.type === "fixed") {
    return typeof budget.min === "number" && budget.min > 0;
  }
  if (budget.type === "range") {
    return (
      typeof budget.min === "number" &&
      typeof budget.max === "number" &&
      budget.min > 0 &&
      budget.max >= budget.min
    );
  }
  return false;
}

export function collectRequestWizardIssues(
  data: RequestWizardValidationInput,
  today: string
): RequestWizardIssue[] {
  const issues: RequestWizardIssue[] = [];
  const schema = getRequestSchema(data.category);

  if (!data.format) {
    issues.push({ step: 0, message: "Выберите формат заявки" });
  } else if (data.format === "closed_request" && data.invitedContractorIds.length === 0) {
    issues.push({ step: 0, message: "Для закрытой заявки пригласите хотя бы одного исполнителя" });
  }

  if (!data.category) {
    issues.push({ step: 1, message: "Выберите категорию услуги" });
  }

  if (!data.title.trim()) {
    issues.push({ step: 3, message: "Укажите название заявки" });
  }
  if (!data.description.trim()) {
    issues.push({ step: 3, message: "Добавьте краткое описание" });
  }
  if (!data.expectedResult.trim()) {
    issues.push({ step: 3, message: "Опишите ожидаемый результат" });
  }
  if (data.descriptionMode === "freeform") {
    if (!data.freeformDescription.trim()) {
      issues.push({ step: 3, message: "Заполните ТЗ в свободной форме" });
    }
  } else if (data.category) {
    const incomplete = data.torSections.filter(
      (section) => section.required && !isDescriptionSectionComplete(section.title, section.content)
    );
    if (incomplete.length > 0) {
      issues.push({
        step: 3,
        message: `Заполните обязательные разделы ТЗ: ${incomplete.map((section) => section.title).join(", ")}`,
      });
    }
  }

  if (!data.executionStart || !data.executionEnd) {
    issues.push({ step: 4, message: "Выберите диапазон выполнения" });
  } else {
    if (data.executionStart < today) {
      issues.push({ step: 4, message: "Дата начала не может быть в прошлом" });
    }
    if (data.executionEnd < data.executionStart) {
      issues.push({ step: 4, message: "Дата окончания не может быть раньше начала" });
    }
  }

  if (!data.budget.type) {
    issues.push({ step: 5, message: "Выберите тип бюджета" });
  } else if (!isBudgetValueValid(data.budget)) {
    if (data.budget.type === "range") {
      issues.push({ step: 5, message: "Укажите диапазон бюджета: «от» больше 0 и не больше «до»" });
    } else if (data.budget.type === "fixed") {
      issues.push({ step: 5, message: "Укажите фиксированную сумму больше 0" });
    } else {
      issues.push({ step: 5, message: "Проверьте значения бюджета" });
    }
  }

  const missingFiles = schema.fileItems.filter(
    (item) => item.required && (data.mandatoryFiles[item.id] ?? []).length === 0
  );
  if (data.category && missingFiles.length > 0) {
    issues.push({
      step: 6,
      message: `Загрузите обязательные файлы: ${missingFiles.map((item) => item.label).join(", ")}`,
    });
  }

  return issues;
}
