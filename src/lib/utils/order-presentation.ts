import { DEAL_STATUS_LABELS, EVENT_ORDER_CUSTOMER_ROLE_LABELS } from "../../constants/statuses.ts";
import type { DealStatus, Event, EventOrder, EventOrderType, UserRole } from "../../data/types/index.ts";

export type CommercialOrderKind = "commercial" | "space_rental" | "access";

export function getCommercialOrderKind(type: EventOrderType): CommercialOrderKind {
  if (type === "space_booking") return "space_rental";
  if (type === "passes" || type === "accreditation") return "access";
  return "commercial";
}

export const COMMERCIAL_ORDER_KIND_LABELS: Record<CommercialOrderKind, string> = {
  commercial: "Коммерческий заказ",
  space_rental: "Аренда площади",
  access: "Пропуск и доступ",
};

export function getEventOrderStatusLabel(status: EventOrder["status"]) {
  if (status === "pending") return "Ожидает";
  if (status === "completed") return "Завершён";
  return DEAL_STATUS_LABELS[status as DealStatus] ?? "В работе";
}

export function getOrderTradeSide(
  order: EventOrder,
  role?: UserRole | null
): "buy" | "sell" {
  if (role === "customer") return "buy";
  if (role === "contractor") {
    return order.customerRole === "contractor" ? "buy" : "sell";
  }
  if (order.direction === "outgoing") return "buy";
  return "sell";
}

export function getOrderTradeSideLabel(side: "buy" | "sell") {
  return side === "buy" ? "Вы покупаете" : "Вы продаёте";
}

export function getOrderCounterparty(order: EventOrder, venueName?: string) {
  if (order.direction === "outgoing") {
    return venueName || "Площадка проведения";
  }
  return order.customerName;
}

export function getOrderNextStep(order: EventOrder, role?: UserRole | null) {
  const status = order.status;
  if (status === "completed") return "Действий не требуется";
  if (status === "pending") {
    return role === "venue" || role === "organizer"
      ? "Подтвердить или отклонить заказ"
      : "Дождаться подтверждения";
  }
  if (status === "awaiting_payment") return "Оплатить счёт";
  if (status === "funds_reserved") return "Дождаться начала работ";
  if (status === "in_progress") return "Выполнить текущий этап";
  if (status === "stage_review") return "Принять результат этапа";
  if (status === "needs_revision") return "Внести исправления";
  if (status === "stage_accepted") return "Запросить выплату";
  if (status === "awaiting_payout") return "Дождаться выплаты";
  if (status === "dispute") return "Дождаться решения спора";
  if (status === "negotiation") return "Согласовать условия";
  return "Открыть карточку и проверить статус";
}

export function getOrderDeadlineLabel(event?: Event) {
  if (!event?.startDate) return null;
  return `Срок: до ${event.startDate.split("-").reverse().join(".")}`;
}

export function getOrderCustomerRoleLabel(order: EventOrder) {
  return EVENT_ORDER_CUSTOMER_ROLE_LABELS[order.customerRole];
}
