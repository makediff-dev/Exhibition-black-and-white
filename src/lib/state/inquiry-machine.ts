import type { CompanyProfile, VenueInquiry } from "../../data/types/index.ts";
import { ROLE_LABELS } from "../../constants/statuses.ts";
import type { ActionableStatus, TransitionResult } from "./types.ts";

export type InquiryLifecycleCode = VenueInquiry["status"];

const LABELS: Record<InquiryLifecycleCode, string> = {
  pending: "Ждём площадку",
  proposal_received: "Ждём организатора",
  changes_proposed: "Ждём организатора",
  selected: "Площадка закреплена",
  declined: "Запрос отклонён",
};

export function getInquiryStatus(
  inquiry: VenueInquiry,
  user: CompanyProfile | null | undefined
): ActionableStatus {
  const isVenue = user?.role === "venue";
  const isOrganizer = user?.role === "organizer";
  const allowedActions: ActionableStatus["allowedActions"] = [];
  let nextActor: ActionableStatus["nextActor"] = null;
  let explanation = "";
  let blockedReason: string | undefined;

  switch (inquiry.status) {
    case "pending":
      explanation = isVenue
        ? "Организатор ждёт ответ: примите зал, предложите изменения или отклоните с причиной."
        : "Запрос у площадки. Следующий шаг — ответ площадки.";
      nextActor = "venue";
      if (isVenue) {
        allowedActions.push("propose_inquiry", "reject_inquiry", "propose_changes");
      }
      break;
    case "proposal_received":
      explanation = isOrganizer
        ? "Площадка прислала условия. Проверьте предмет брони и примите или отклоните."
        : "Организатор ещё не принял предложение.";
      nextActor = "organizer";
      if (isOrganizer) allowedActions.push("accept_inquiry", "decline_inquiry");
      break;
    case "changes_proposed":
      explanation = isOrganizer
        ? "Площадка предложила другой зал или даты. Примите альтернативу или отклоните."
        : "Ждём решение организатора по альтернативе.";
      nextActor = "organizer";
      if (isOrganizer) allowedActions.push("accept_inquiry", "decline_inquiry");
      break;
    case "selected":
      explanation = "Стороны согласовали площадку. Источник дат — подтверждённые бронирования.";
      nextActor = "organizer";
      break;
    case "declined":
      explanation = inquiry.declineReason
        ? `Отклонено: ${inquiry.declineReason}`
        : "Запрос отклонён.";
      nextActor = "organizer";
      blockedReason = "Отклонённый запрос нельзя подтвердить без нового обращения.";
      break;
  }

  return {
    code: inquiry.status,
    storedCode: inquiry.status,
    label: LABELS[inquiry.status],
    explanation,
    nextActor,
    nextActorLabel: nextActor ? ROLE_LABELS[nextActor] : null,
    deadline: inquiry.holdUntil ?? null,
    allowedActions,
    recoveryActions: [],
    blockedReason,
  };
}

export function canTransitionInquiry(
  inquiry: VenueInquiry,
  user: CompanyProfile | null | undefined,
  next: VenueInquiry["status"],
  extras?: { reason?: string; hallId?: string }
): TransitionResult {
  const status = getInquiryStatus(inquiry, user);

  if (next === "proposal_received") {
    if (!status.allowedActions.includes("propose_inquiry")) {
      return { allowed: false, reason: "Предложение может отправить только площадка по открытому запросу." };
    }
    if (!extras?.hallId) {
      return { allowed: false, reason: "Выберите зал для предложения." };
    }
    return { allowed: true, reason: "" };
  }

  if (next === "changes_proposed") {
    if (!status.allowedActions.includes("propose_changes")) {
      return { allowed: false, reason: "Изменения может предложить только площадка по открытому запросу." };
    }
    return { allowed: true, reason: "" };
  }

  if (next === "declined") {
    const canReject =
      status.allowedActions.includes("reject_inquiry") ||
      status.allowedActions.includes("decline_inquiry");
    if (!canReject) {
      return { allowed: false, reason: "Отклонить этот запрос сейчас нельзя." };
    }
    if (!extras?.reason?.trim()) {
      return { allowed: false, reason: "Укажите причину отклонения." };
    }
    return { allowed: true, reason: "" };
  }

  if (next === "selected") {
    if (!status.allowedActions.includes("accept_inquiry")) {
      return { allowed: false, reason: "Принять предложение может только организатор." };
    }
    return { allowed: true, reason: "" };
  }

  return { allowed: false, reason: "Недопустимый переход запроса площадке." };
}
