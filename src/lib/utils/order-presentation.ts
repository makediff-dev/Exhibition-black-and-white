import { DEAL_STATUS_LABELS, EVENT_ORDER_CUSTOMER_ROLE_LABELS } from "../../constants/statuses.ts";
import type {
  CompanyProfile,
  DealStatus,
  Event,
  EventOrder,
  EventOrderType,
  UserRole,
} from "../../data/types/index.ts";
import { getCounterpartyForUser, getOrderDirectionForUser } from "../auth/parties.ts";
import { getEventLifecycleCode } from "../state/event-machine.ts";
import { isDeadlineReached } from "../state/clock.ts";

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

export function getEventOrderLifecycleCode(order: EventOrder, event?: Event): string {
  if (order.status === "completed") return "completed";
  if (order.status === "dispute") return "dispute";
  if (event && getEventLifecycleCode(event) === "completed") {
    if (order.status === "awaiting_payment" || order.status === "pending" || order.status === "negotiation") {
      return "overdue";
    }
    return "completed";
  }
  if (
    (order.status === "awaiting_payment" || order.status === "pending") &&
    event?.startDate &&
    isDeadlineReached(event.startDate)
  ) {
    return "overdue";
  }
  return order.status;
}

export function getEventOrderStatusLabel(status: EventOrder["status"] | string) {
  if (status === "pending") return "Ожидает";
  if (status === "completed") return "Завершён";
  if (status === "overdue") return "Просрочен";
  return DEAL_STATUS_LABELS[status as DealStatus] ?? "В работе";
}

export function getOrderTradeSide(
  order: EventOrder,
  viewer?: CompanyProfile | UserRole | null
): "buy" | "sell" {
  const user = typeof viewer === "object" && viewer ? viewer : null;
  const fromParties = user ? getOrderDirectionForUser(order, user) : null;
  if (fromParties) return fromParties;

  const role = typeof viewer === "string" ? viewer : user?.role;
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

export function getOrderCounterparty(
  order: EventOrder,
  viewerOrVenueName?: CompanyProfile | string,
  venueName?: string
) {
  const user = typeof viewerOrVenueName === "object" ? viewerOrVenueName : null;
  const fallbackVenue = typeof viewerOrVenueName === "string" ? viewerOrVenueName : venueName;
  const counterparty = user ? getCounterpartyForUser(order, user) : null;
  if (counterparty) {
    if (user?.name && counterparty.name === user.name) {
      return getOrderDirectionForUser(order, user) === "buy"
        ? fallbackVenue || "Продавец"
        : order.customerName;
    }
    return counterparty.name;
  }
  if (order.direction === "outgoing") {
    return fallbackVenue || "Площадка проведения";
  }
  return order.customerName;
}

export function getOrderNextStep(order: EventOrder, role?: UserRole | null, event?: Event) {
  const status = getEventOrderLifecycleCode(order, event);
  if (status === "completed") return "Действий не требуется";
  if (status === "overdue") return "Срок прошёл: проверьте оплату или архивируйте заказ";
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
