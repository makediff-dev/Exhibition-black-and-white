import type { Event } from "../../data/types/index.ts";
import { ROLE_LABELS } from "../../constants/statuses.ts";
import { isDeadlineReached, isOnOrAfterDeadline } from "./clock.ts";
import type { ActionableStatus } from "./types.ts";

export type EventLifecycleCode = "draft" | "upcoming" | "active" | "completed" | "cancelled" | "archived";

const LABELS: Record<EventLifecycleCode, string> = {
  draft: "Черновик",
  upcoming: "Предстоит",
  active: "Идёт сейчас",
  completed: "Завершено",
  cancelled: "Отменено",
  archived: "В архиве",
};

export function getEventLifecycleCode(event: Event): EventLifecycleCode {
  if (isDeadlineReached(event.endDate)) return "completed";
  if (isOnOrAfterDeadline(event.startDate)) return "active";
  return "upcoming";
}

export function canBookEvent(event: Event): boolean {
  return event.bookingAvailable && getEventLifecycleCode(event) !== "completed";
}

export function getEventStatus(event: Event): ActionableStatus {
  const code = getEventLifecycleCode(event);
  const canBook = canBookEvent(event);

  return {
    code,
    storedCode: event.bookingAvailable ? "bookable" : "closed",
    label: LABELS[code],
    explanation:
      code === "completed"
        ? "Мероприятие завершено. Новое бронирование недоступно. Доступны архивные материалы."
        : code === "active"
          ? "Мероприятие уже идёт."
          : "Мероприятие ещё не началось.",
    nextActor: canBook ? "customer" : null,
    nextActorLabel: canBook ? ROLE_LABELS.customer : null,
    deadline: event.endDate,
    allowedActions: canBook ? ["confirm_booking"] : [],
    recoveryActions: code === "completed" ? ["archive"] : [],
    blockedReason: canBook ? undefined : "Бронирование площади для этого мероприятия недоступно.",
  };
}
