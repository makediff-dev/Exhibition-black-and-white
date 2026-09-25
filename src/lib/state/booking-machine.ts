import type { Booking, CompanyProfile } from "../../data/types/index.ts";
import { ROLE_LABELS } from "../../constants/statuses.ts";
import { isDeadlineReached, isOnOrAfterDeadline } from "./clock.ts";
import type { ActionableStatus, TransitionResult } from "./types.ts";

export type BookingLifecycleCode =
  | "pending"
  | "confirmed"
  | "active"
  | "completed"
  | "rejected"
  | "cancelled"
  | "expired";

const LABELS: Record<BookingLifecycleCode, string> = {
  pending: "Ожидает площадку",
  confirmed: "Площадка согласилась",
  active: "Идёт период",
  completed: "Завершено",
  rejected: "Отклонено",
  cancelled: "Отменено",
  expired: "Период прошёл",
};

export function getBookingPeriodEnd(booking: Booking): string {
  return booking.periodEnd ?? booking.periodStart ?? booking.date;
}

export function getBookingLifecycleCode(booking: Booking): BookingLifecycleCode {
  if (booking.status === "cancelled") return "cancelled";
  if (booking.status === "rejected") return "rejected";

  const periodEnd = getBookingPeriodEnd(booking);
  const periodStart = booking.periodStart ?? booking.date;
  const ended = isDeadlineReached(periodEnd);
  const started = isOnOrAfterDeadline(periodStart);

  if (booking.status === "pending") {
    return ended ? "expired" : "pending";
  }

  if (ended) return "completed";
  if (started) return "active";
  return "confirmed";
}

export function getBookingStatus(
  booking: Booking,
  user: CompanyProfile | null | undefined
): ActionableStatus {
  const code = getBookingLifecycleCode(booking);
  const deadline = getBookingPeriodEnd(booking);
  const isVenue = user?.role === "venue";
  const isApplicant = user?.role === "organizer" || user?.role === "customer";

  const allowedActions: ActionableStatus["allowedActions"] = [];
  const recoveryActions: ActionableStatus["recoveryActions"] = [];
  let nextActor: ActionableStatus["nextActor"] = null;
  let explanation = "";
  let blockedReason: string | undefined;

  switch (code) {
    case "pending":
      explanation = "Площадка ещё не подтвердила период.";
      nextActor = "venue";
      if (isVenue) allowedActions.push("confirm_booking", "reject_booking");
      if (isApplicant) allowedActions.push("cancel_booking");
      break;
    case "expired":
      explanation = "Запрошенный период уже прошёл. Принять или отклонить задним числом нельзя.";
      nextActor = "organizer";
      blockedReason = `Период ${deadline} уже завершён. Создайте новый запрос с предзаполненными данными.`;
      recoveryActions.push("cancel_booking");
      break;
    case "confirmed":
      explanation = booking.changeRequest?.status === "pending"
        ? `Открыт запрос на смену дат. Ждём ${booking.changeRequest.actor === "organizer" ? "площадку" : "организатора"}.`
        : "Площадка согласилась. Это согласие, а не оплаченный резерв.";
      nextActor =
        booking.changeRequest?.status === "pending"
          ? booking.changeRequest.actor === "organizer"
            ? "venue"
            : "organizer"
          : "organizer";
      if (booking.changeRequest?.status === "pending") {
        if (
          (booking.changeRequest.actor === "organizer" && isVenue) ||
          (booking.changeRequest.actor === "venue" && isApplicant)
        ) {
          allowedActions.push("accept_change", "reject_change");
        }
      } else if (isVenue || isApplicant) {
        allowedActions.push("request_change");
      }
      break;
    case "active":
      explanation = "Период бронирования уже идёт.";
      nextActor = null;
      blockedReason = "Подтверждать или отклонять активный период как новую бронь нельзя.";
      break;
    case "completed":
      explanation = "Период бронирования завершён.";
      nextActor = null;
      blockedReason = "Прошедшее бронирование нельзя подтвердить или отклонить как новое.";
      break;
    case "rejected":
      explanation = booking.rejectReason
        ? `Отклонено: ${booking.rejectReason}`
        : "Площадка отклонила бронирование.";
      nextActor = "organizer";
      recoveryActions.push("cancel_booking");
      break;
    case "cancelled":
      explanation = "Бронирование отменено и не блокирует инвентарь.";
      nextActor = "organizer";
      recoveryActions.push("cancel_booking");
      break;
  }

  return {
    code,
    storedCode: booking.status,
    label: LABELS[code],
    explanation,
    nextActor,
    nextActorLabel: nextActor ? ROLE_LABELS[nextActor] : null,
    deadline,
    allowedActions,
    recoveryActions,
    blockedReason,
  };
}

export function canTransitionBooking(
  booking: Booking,
  user: CompanyProfile | null | undefined,
  nextStatus: Booking["status"],
  extras?: { rejectReason?: string }
): TransitionResult {
  const status = getBookingStatus(booking, user);

  if (nextStatus === "confirmed") {
    if (!status.allowedActions.includes("confirm_booking")) {
      return {
        allowed: false,
        reason: status.blockedReason ?? "Подтвердить это бронирование нельзя.",
      };
    }
    return { allowed: true, reason: "" };
  }

  if (nextStatus === "rejected") {
    if (!status.allowedActions.includes("reject_booking")) {
      return {
        allowed: false,
        reason: status.blockedReason ?? "Отклонить это бронирование нельзя.",
      };
    }
    if (!extras?.rejectReason?.trim()) {
      return { allowed: false, reason: "Укажите причину отклонения." };
    }
    return { allowed: true, reason: "" };
  }

  return { allowed: false, reason: "Недопустимый переход бронирования." };
}
