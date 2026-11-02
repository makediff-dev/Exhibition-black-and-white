import { CITIES, EVENT_INDUSTRIES, SERVICE_CATEGORIES } from "@/constants/categories";

export interface HomeFilterField {
  id: string;
  placeholder: string;
  options: string[];
  hug?: boolean;
}

export const HOME_FILTER_PRESETS = {
  contractors: [
    { id: "city", placeholder: "Москва", options: CITIES },
    { id: "category", placeholder: "Категория", options: [...SERVICE_CATEGORIES] },
    { id: "sort", placeholder: "Сортировка", options: ["По рейтингу", "По отзывам", "По названию"] },
  ],
  orders: [
    { id: "city", placeholder: "Москва", options: CITIES },
    { id: "category", placeholder: "Категория", options: [...SERVICE_CATEGORIES] },
    { id: "sort", placeholder: "Сортировка", options: ["Сначала новые", "По сроку", "По бюджету"] },
  ],
  events: [
    { id: "city", placeholder: "Все города", options: CITIES },
    { id: "industry", placeholder: "Отрасль", options: [...EVENT_INDUSTRIES] },
    { id: "type", placeholder: "Тип мероприятия", options: ["Выставка", "Форум", "Конференция"], hug: true },
  ],
  venues: [
    { id: "city", placeholder: "Москва", options: CITIES },
    { id: "sort", placeholder: "Сортировка", options: ["По популярности", "По названию"] },
    { id: "dates", placeholder: "Даты", options: ["Ближайшая неделя", "Ближайший месяц", "Ближайшие 3 месяца"] },
  ],
} as const satisfies Record<string, HomeFilterField[]>;

export type HomeFilterPreset = keyof typeof HOME_FILTER_PRESETS;
