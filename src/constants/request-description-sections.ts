import type { TorSection } from "../data/types/index.ts";

export interface RequestDescriptionField {
  id: string;
  label: string;
  type: "input" | "textarea";
  required?: boolean;
  placeholder?: string;
}

export interface RequestDescriptionSectionTemplate {
  title: string;
  required: boolean;
  fields: RequestDescriptionField[];
}

export const COMPANY_DESCRIPTION_SECTION: RequestDescriptionSectionTemplate = {
  title: "Компания и контакты",
  required: true,
  fields: [
    { id: "companyName", label: "Компания", type: "input", required: true, placeholder: "ООО «Профиль Металл»" },
    { id: "preparedDate", label: "Дата составления", type: "input", placeholder: "06.01.2026" },
    {
      id: "companyDescription",
      label: "Краткое описание компании",
      type: "textarea",
      required: true,
      placeholder: "Чем занимается компания, ключевые компетенции",
    },
    {
      id: "productLines",
      label: "Ключевые продуктовые линейки",
      type: "textarea",
      placeholder: "Перечислите основные линейки продукции",
    },
    {
      id: "competitiveAdvantages",
      label: "Конкурентные преимущества",
      type: "textarea",
      placeholder: "Что отличает компанию от конкурентов",
    },
    { id: "contactPerson", label: "Контактное лицо", type: "input", required: true, placeholder: "Иванов Иван Иванович" },
    { id: "contactPosition", label: "Должность", type: "input", placeholder: "Исполнительный директор" },
    {
      id: "contactPhoneEmail",
      label: "Телефон / E-mail",
      type: "input",
      required: true,
      placeholder: "+7 900 000-00-00, email@company.ru",
    },
    { id: "website", label: "Web-сайт", type: "input", placeholder: "https://www.company.ru/" },
  ],
};

export const STAND_DESCRIPTION_SECTIONS: RequestDescriptionSectionTemplate[] = [
  COMPANY_DESCRIPTION_SECTION,
  {
    title: "Выставка и площадка",
    required: true,
    fields: [
      { id: "exhibitionName", label: "Название выставки", type: "input", required: true, placeholder: "MosBuild 2026" },
      {
        id: "exhibitionVenue",
        label: "Место проведения",
        type: "textarea",
        required: true,
        placeholder: "Город, павильон, зал",
      },
      {
        id: "exhibitionDates",
        label: "Сроки проведения и монтажа",
        type: "input",
        required: true,
        placeholder: "31 марта — 03 апреля 2026, монтаж",
      },
      {
        id: "pavilionLayout",
        label: "Планировка павильона / расположение стенда",
        type: "textarea",
        placeholder: "Опишите расположение или приложите файл на шаге «Файлы»",
      },
    ],
  },
  {
    title: "Технические параметры стенда",
    required: true,
    fields: [
      { id: "standNumber", label: "Номер стенда", type: "input", placeholder: "Уточняется" },
      { id: "standArea", label: "Площадь, м²", type: "input", required: true, placeholder: "36" },
      { id: "standDimensions", label: "Размеры (глубина × фронт)", type: "input", required: true, placeholder: "4 × 9 м" },
      {
        id: "standType",
        label: "Тип стенда",
        type: "input",
        required: true,
        placeholder: "Индивидуальная застройка",
      },
      {
        id: "standConfiguration",
        label: "Конфигурация",
        type: "textarea",
        placeholder: "Угловой, открытые стороны, особенности",
      },
      { id: "mainWallHeight", label: "Высота основных стен, м", type: "input", placeholder: "4.0" },
      { id: "friezeHeight", label: "Высота фриза, м", type: "input", placeholder: "4.5" },
      {
        id: "configurationNotes",
        label: "Дополнительные особенности",
        type: "textarea",
        placeholder: "Например: левая стена глухая, граничит с соседями",
      },
    ],
  },
  {
    title: "Цели и задачи участия в выставке",
    required: true,
    fields: [
      {
        id: "mainGoal",
        label: "Главная цель участия",
        type: "textarea",
        required: true,
        placeholder: "Основная бизнес-цель участия в выставке",
      },
      {
        id: "keyTasks",
        label: "Ключевые задачи",
        type: "textarea",
        required: true,
        placeholder: "Перечислите ключевые задачи",
      },
      {
        id: "targetAudience",
        label: "Целевая аудитория",
        type: "textarea",
        placeholder: "Кто является целевой аудиторией стенда",
      },
      {
        id: "expectedContacts",
        label: "Ожидаемое количество контактов",
        type: "input",
        placeholder: "150–250 визитов за 4 дня",
      },
      {
        id: "plannedMeetings",
        label: "Планируемое количество встреч",
        type: "input",
        placeholder: "30–50 встреч",
      },
    ],
  },
  {
    title: "Характеристика экспонируемой продукции",
    required: false,
    fields: [
      {
        id: "productCharacteristics",
        label: "Краткая характеристика продукции",
        type: "textarea",
        placeholder: "Что будет представлено на стенде",
      },
    ],
  },
  {
    title: "Стилевые пожелания и концепция дизайна",
    required: false,
    fields: [
      {
        id: "stylePreferences",
        label: "Стилевые пожелания",
        type: "textarea",
        placeholder: "Световые короба, радиусные элементы, флористика, мультимедиа и т.д.",
      },
      { id: "designConcept", label: "Основная идея", type: "textarea", placeholder: "Главная идея концепции" },
      {
        id: "stylingAtmosphere",
        label: "Стилистика и атмосфера",
        type: "textarea",
        placeholder: "Профессиональная, техническая, современная и т.д.",
      },
      {
        id: "designReferences",
        label: "Референсы",
        type: "textarea",
        placeholder: "Примеры из портфолио или референсы",
      },
    ],
  },
  {
    title: "Описание зон",
    required: false,
    fields: [
      {
        id: "leftZone",
        label: "Левая зона (информационно-мультимедийная)",
        type: "textarea",
        placeholder: "Состав зоны, оборудование, материалы",
      },
      {
        id: "centralZone",
        label: "Центральная экспозиционная зона",
        type: "textarea",
        placeholder: "Зоны 1–4: название, ширина, продукция, оформление",
      },
      {
        id: "meetingZone",
        label: "Переговорная зона",
        type: "textarea",
        placeholder: "Столы, стулья, рассадка",
      },
    ],
  },
  {
    title: "Фирменные цвета, графика и объёмные элементы",
    required: false,
    fields: [
      {
        id: "brandColors",
        label: "Фирменные цвета и логотип",
        type: "textarea",
        placeholder: "RAL, применение цветов",
      },
      {
        id: "graphicRequirements",
        label: "Пожелания по графике",
        type: "textarea",
        placeholder: "Размещение логотипов, брендинг",
      },
      {
        id: "volumeElements",
        label: "Объёмные элементы",
        type: "textarea",
        placeholder: "3D-логотип, подсветка, фриз",
      },
    ],
  },
  {
    title: "Переговорные зоны и мебель",
    required: false,
    fields: [
      {
        id: "meetingZonesAvailability",
        label: "Переговорные зоны",
        type: "textarea",
        placeholder: "Открытые / закрытые зоны, назначение",
      },
      {
        id: "furniture",
        label: "Мебель",
        type: "textarea",
        placeholder: "Столы, стулья, материалы и модели",
      },
    ],
  },
];

export const RENTAL_DESCRIPTION_SECTIONS: RequestDescriptionSectionTemplate[] = [
  COMPANY_DESCRIPTION_SECTION,
  {
    title: "Место и период аренды",
    required: true,
    fields: [
      { id: "exhibitionName", label: "Мероприятие или площадка", type: "input", required: true, placeholder: "MosBuild 2026" },
      { id: "deliveryAddress", label: "Адрес подачи", type: "textarea", required: true, placeholder: "Город, павильон, стенд" },
      { id: "rentalPeriod", label: "Период аренды", type: "input", required: true, placeholder: "31 марта — 03 апреля 2026" },
    ],
  },
  {
    title: "Состав оборудования или мебели",
    required: true,
    fields: [
      { id: "itemList", label: "Перечень позиций", type: "textarea", required: true, placeholder: "LED 3×2, стойка ресепшн, 6 стульев" },
      { id: "itemQuantity", label: "Количество", type: "input", required: true, placeholder: "1 экран, 1 комплект мебели" },
      { id: "technicalSpecs", label: "Технические требования", type: "textarea", placeholder: "Питание, разрешение, цвет обивки" },
    ],
  },
  {
    title: "Логистика и монтаж",
    required: false,
    fields: [
      { id: "deliveryWindow", label: "Окно доставки", type: "input", placeholder: "30 марта, 10:00–14:00" },
      { id: "installationNotes", label: "Монтаж / демонтаж", type: "textarea", placeholder: "Нужен монтаж экрана и вывоз после выставки" },
    ],
  },
];

export const LOGISTICS_DESCRIPTION_SECTIONS: RequestDescriptionSectionTemplate[] = [
  COMPANY_DESCRIPTION_SECTION,
  {
    title: "Маршрут и сроки",
    required: true,
    fields: [
      { id: "pickupAddress", label: "Откуда", type: "textarea", required: true, placeholder: "Склад / производство" },
      { id: "deliveryAddress", label: "Куда", type: "textarea", required: true, placeholder: "Площадка, павильон, стенд" },
      { id: "transportDates", label: "Даты перевозки и монтажа", type: "input", required: true, placeholder: "28–30 марта 2026" },
    ],
  },
  {
    title: "Груз",
    required: true,
    fields: [
      { id: "cargoDescription", label: "Состав груза", type: "textarea", required: true, placeholder: "Конструкции стенда, оборудование" },
      { id: "cargoVolume", label: "Объём и вес", type: "input", required: true, placeholder: "12 м³, 800 кг" },
      { id: "handlingNotes", label: "Погрузка и особые условия", type: "textarea", placeholder: "Хрупкое, нужна стрела, страхование" },
    ],
  },
];

export const SERVICE_DESCRIPTION_SECTIONS: RequestDescriptionSectionTemplate[] = [
  COMPANY_DESCRIPTION_SECTION,
  {
    title: "Место и формат услуги",
    required: true,
    fields: [
      { id: "serviceLocation", label: "Место оказания", type: "textarea", required: true, placeholder: "Павильон, стенд, офис" },
      { id: "serviceDates", label: "Дата и время", type: "input", required: true, placeholder: "1 апреля, 10:00–18:00" },
      { id: "serviceFormat", label: "Формат", type: "textarea", required: true, placeholder: "Фуршет, ежедневная уборка, хостес на смену" },
    ],
  },
  {
    title: "Параметры сервиса",
    required: true,
    fields: [
      { id: "guestCount", label: "Количество гостей или объём", type: "input", required: true, placeholder: "50 персон / 36 м²" },
      { id: "menuOrScope", label: "Состав услуги", type: "textarea", required: true, placeholder: "Меню, частота клининга, число хостес" },
      { id: "dietaryNotes", label: "Ограничения и пожелания", type: "textarea", placeholder: "Аллергии, дресс-код, расходники" },
    ],
  },
];

export const REQUEST_DESCRIPTION_SECTIONS = STAND_DESCRIPTION_SECTIONS;

export const ALL_DESCRIPTION_SECTION_TEMPLATES: RequestDescriptionSectionTemplate[] = [
  ...STAND_DESCRIPTION_SECTIONS,
  ...RENTAL_DESCRIPTION_SECTIONS,
  ...LOGISTICS_DESCRIPTION_SECTIONS,
  ...SERVICE_DESCRIPTION_SECTIONS,
];

export function createDefaultDescriptionSections(
  templates: RequestDescriptionSectionTemplate[] = STAND_DESCRIPTION_SECTIONS
): TorSection[] {
  return templates.map((section, index) => ({
    id: `desc-${index + 1}`,
    title: section.title,
    content: serializeSectionFieldValues({}),
    required: section.required,
  }));
}

export function getDescriptionSectionTemplate(title: string) {
  return ALL_DESCRIPTION_SECTION_TEMPLATES.find((section) => section.title === title);
}

export function parseSectionFieldValues(content: string): Record<string, string> {
  if (!content.trim()) return {};
  try {
    const parsed = JSON.parse(content) as Record<string, string>;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    return { _legacy: content };
  }
  return {};
}

export function serializeSectionFieldValues(values: Record<string, string>): string {
  const cleaned = Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== undefined),
  );
  return JSON.stringify(cleaned);
}

export function formatSectionContentForDisplay(title: string, content: string): string {
  const values = parseSectionFieldValues(content);
  if (values._legacy) return values._legacy;

  const template = getDescriptionSectionTemplate(title);
  if (!template) return content;

  return template.fields
    .map((field) => {
      const value = values[field.id]?.trim();
      if (!value) return "";
      return `${field.label}:\n${value}`;
    })
    .filter(Boolean)
    .join("\n\n");
}

export function isDescriptionSectionComplete(title: string, content: string): boolean {
  const template = getDescriptionSectionTemplate(title);
  if (!template) return !!content.trim();

  const values = parseSectionFieldValues(content);
  if (values._legacy) return !!values._legacy.trim();

  const requiredFields = template.fields.filter((field) => field.required);
  return requiredFields.every((field) => values[field.id]?.trim());
}

export function isDescriptionSectionFilled(title: string, content: string): boolean {
  const values = parseSectionFieldValues(content);
  if (values._legacy) return !!values._legacy.trim();
  return Object.entries(values).some(([key, value]) => key !== "_legacy" && value.trim());
}
