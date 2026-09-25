import type {
  DealStatus,
  EventOrderCustomerRole,
  EventOrderPriority,
  EventOrderType,
  RequestFormat,
  RequestStatus,
} from "@/data/types";

export const STAGE_STATUS_LABELS: Record<
  "pending" | "in_progress" | "review" | "accepted" | "revision",
  string
> = {
  pending: "Ожидает",
  in_progress: "В работе",
  review: "На проверке",
  accepted: "Принят",
  revision: "Доработка",
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  draft: "Черновик",
  published: "Опубликована",
  in_progress: "В работе",
  completed: "Завершена",
  cancelled: "Отменена",
  archived: "В архиве",
};

export const DOCUMENT_STATUS_LABELS: Record<"draft" | "sent" | "signed" | "archived", string> = {
  draft: "Черновик",
  sent: "Ожидает подписи",
  signed: "Подписан",
  archived: "Архив",
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

export const REQUEST_FORMAT_DESCRIPTIONS: Record<RequestFormat, string> = {
  safe_deal: "Оплата через резерв платформы",
  urgent: "Быстрый подбор исполнителя",
  open_request: "Отклики от всех исполнителей. Первые 10 откликнувшихся",
  closed_request: "Приглашения выбранным исполнителям, не более 5 исполнителей",
};

export const REQUEST_RESULT_LABELS = {
  contractor_selected: "Выбран исполнитель",
  deal_completed: "Сделка завершена",
  awaiting_responses: "Ожидание откликов",
} as const;

export const RESPONSE_STATUS_LABELS = {
  pending: "На рассмотрении",
  accepted: "Выбран",
  rejected: "Отклонён",
} as const;

export const RESPONSE_FOLLOW_UP_ACTIONS = [
  { id: "discuss", label: "Обсудить детали с исполнителем" },
  { id: "edo", label: "Настроить связь по ЭДО" },
  { id: "documents", label: "Прислать дополнительные документы" },
  { id: "extended_check", label: "Заказать расширенную проверку", route: "subscribe" },
] as const;

export const EXTENDED_CHECK_PLANS = [
  { id: "plan-1", label: "1 проверка", price: 49, note: "одной" },
  { id: "plan-10", label: "10 проверок", price: 299 },
  { id: "plan-50", label: "50 проверок", price: 1999 },
  { id: "plan-100", label: "100 проверок", price: 2999 },
  { id: "plan-1000", label: "1000 проверок", price: 4999 },
  { id: "plan-unlimited", label: "Безлимитная подписка", price: 2000, period: "месяц" },
] as const;

export const EXTENDED_CHECK_PAYMENT_METHODS = [
  { id: "invoice", label: "Выставить счёт по реквизитам организации" },
  { id: "qr", label: "Оплата по QR" },
  { id: "sbp", label: "Оплата СБП" },
] as const;

export const ROLE_LABELS = {
  customer: "Заказчик",
  contractor: "Исполнитель",
  venue: "Площадка",
  organizer: "Организатор",
};

export const VENUE_SERVICE_AUDIENCES = [
  { id: "organizer", label: "Организаторы" },
  { id: "contractor", label: "Застройщики" },
  { id: "exhibitor", label: "Экспоненты" },
  { id: "individual", label: "Физлица" },
] as const;

export const ORGANIZER_EVENT_SERVICE_AUDIENCES = [
  { id: "exhibitor", label: "Экспоненты" },
  { id: "contractor", label: "Застройщики" },
] as const;

export const VENUE_PAYMENT_ROLE_LABELS = {
  organizer: "Организаторы",
  exhibitor: "Экспоненты",
  contractor: "Застройщики",
} as const;

export const PAYMENT_STATUS_LABELS = {
  pending: "Ожидает оплаты",
  paid: "Оплачен",
  reserved: "Зарезервирован",
  refunded: "Возврат",
} as const;

export const VENUE_INQUIRY_STATUS_LABELS = {
  pending: "Ждём площадку",
  proposal_received: "Ждём организатора",
  changes_proposed: "Ждём организатора",
  selected: "Площадка закреплена",
  declined: "Запрос отклонён",
} as const;

export const ORGANIZER_PAYMENT_ROLE_LABELS = {
  venue: "Площадки",
  exhibitor: "Экспоненты",
  contractor: "Подрядчики",
} as const;

export const EVENT_ORDER_TYPE_LABELS: Record<EventOrderType, string> = {
  space_booking: "Бронирование площади",
  passes: "Пропуска",
  accreditation: "Аккредитация",
  stand_build: "Строительство стенда",
  venue_service: "Услуга площадки",
  other: "Прочее",
};

export const EVENT_ORDER_PRIORITY_LABELS: Record<EventOrderPriority, string> = {
  high: "Высокий приоритет",
  medium: "Средний приоритет",
  normal: "Обычный приоритет",
};

export const EVENT_ORDER_CUSTOMER_ROLE_LABELS: Record<EventOrderCustomerRole, string> = {
  organizer: "Организатор",
  exhibitor: "Экспонент",
  contractor: "Застройщик",
  venue: "Площадка",
  general_contractor: "Генподрядчик",
};

export const BOOKING_PERIOD_LABELS = {
  setup: "Монтаж",
  event: "Мероприятие",
  teardown: "Демонтаж",
} as const;

export const BOOKING_STATUS_LABELS = {
  pending: "Ожидает площадку",
  confirmed: "Площадка согласилась",
  rejected: "Отклонено",
  cancelled: "Отменено",
} as const;
