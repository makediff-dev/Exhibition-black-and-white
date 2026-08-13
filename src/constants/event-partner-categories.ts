import type { EventPartnerCategoryId } from "@/data/types";

export interface EventPartnerCategory {
  id: EventPartnerCategoryId;
  label: string;
}

export const EVENT_PARTNER_CATEGORIES: EventPartnerCategory[] = [
  { id: "build", label: "Партнёр по эксклюзивному строительству" },
  { id: "logistics", label: "Логистический партнёр" },
  { id: "hotel", label: "Гостиничный партнёр" },
  { id: "design", label: "Партнёр по дизайну" },
];

export function getEventPartnerCategoryLabel(categoryId: EventPartnerCategoryId): string {
  return EVENT_PARTNER_CATEGORIES.find((category) => category.id === categoryId)?.label ?? categoryId;
}
