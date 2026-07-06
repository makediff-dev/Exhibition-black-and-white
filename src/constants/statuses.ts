import type { DealStatus, RequestFormat, RequestStatus } from "@/data/types";

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  draft: "Черновик",
  published: "Опубликована",
  in_progress: "В работе",
  completed: "Завершена",
};

export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  negotiation: "Согласование",
  awaiting_payment: "Ожидает оплаты",
  funds_reserved: "Средства зарезервированы",
  in_progress: "В работе",
  stage_review: "Этап передан на проверку",
  needs_revision: "Нужны исправления",
  stage_accepted: "Этап принят",
  awaiting_payout: "Ожидается выплата",
  completed: "Завершена",
  dispute: "Спор",
};

export const REQUEST_FORMAT_LABELS: Record<RequestFormat, string> = {
  safe_deal: "Безопасная сделка",
  urgent: "Срочная сделка",
  open_request: "Открытый запрос предложений",
  closed_request: "Закрытый запрос предложений",
};

export const ROLE_LABELS = {
  customer: "Заказчик",
  contractor: "Исполнитель",
  venue: "Площадка",
  organizer: "Организатор",
};
