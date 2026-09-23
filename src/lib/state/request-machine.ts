import type { CompanyProfile, Deal, Request, Response } from "../../data/types/index.ts";
import { ROLE_LABELS } from "../../constants/statuses.ts";
import { isDeadlineReached } from "./clock.ts";
import type { ActionCode, ActionableStatus, TransitionResult } from "./types.ts";

export type RequestLifecycleCode =
  | "draft"
  | "collecting_proposals"
  | "contractor_selected"
  | "converted_to_order"
  | "completed"
  | "expired"
  | "cancelled"
  | "archived";

const LABELS: Record<RequestLifecycleCode, string> = {
  draft: "Черновик",
  collecting_proposals: "Сбор откликов",
  contractor_selected: "Исполнитель выбран",
  converted_to_order: "Переведена в заказ",
  completed: "Завершена",
  expired: "Срок отклика истёк",
  cancelled: "Отменена",
  archived: "В архиве",
};

function hasAcceptedProposal(requestId: string, responses: Response[]) {
  return responses.some((item) => item.requestId === requestId && item.status === "accepted");
}

function relatedDeal(requestId: string, deals: Deal[]) {
  return deals.find((deal) => deal.requestId === requestId);
}

export function getRequestDeadline(request: Request): string | null {
  return request.responseDeadlineAt ?? request.deadline ?? null;
}

export function getRequestLifecycleCode(
  request: Request,
  responses: Response[],
  deals: Deal[]
): RequestLifecycleCode {
  if (request.status === "archived") return "archived";
  if (request.status === "cancelled") return "cancelled";
  if (request.status === "completed") return "completed";
  if (request.status === "draft") return "draft";

  const deal = relatedDeal(request.id, deals);
  if (deal) return "converted_to_order";
  if (hasAcceptedProposal(request.id, responses) || request.status === "in_progress") {
    return "contractor_selected";
  }

  if (
    (request.status === "published" || request.status === "in_progress") &&
    isDeadlineReached(getRequestDeadline(request)) &&
    !hasAcceptedProposal(request.id, responses) &&
    !deal
  ) {
    return "expired";
  }

  return "collecting_proposals";
}

export function getRequestStatus(
  request: Request,
  user: CompanyProfile | null | undefined,
  responses: Response[],
  deals: Deal[]
): ActionableStatus {
  const code = getRequestLifecycleCode(request, responses, deals);
  const deadline = getRequestDeadline(request);
  const isOwner = Boolean(user && user.role === "customer" && user.id === request.customerId);
  const isContractor = user?.role === "contractor";
  const alreadyResponded = responses.some(
    (item) => item.requestId === request.id && item.contractorName === user?.name
  );

  const allowedActions: ActionCode[] = [];
  const recoveryActions: ActionCode[] = [];
  let nextActor: ActionableStatus["nextActor"] = null;
  let explanation = "";
  let blockedReason: string | undefined;

  switch (code) {
    case "draft":
      explanation = "Заявка ещё не опубликована.";
      nextActor = "customer";
      if (isOwner) allowedActions.push("edit", "publish", "delete");
      break;
    case "collecting_proposals":
      explanation = "Идёт сбор откликов.";
      nextActor = "contractor";
      if (isOwner) allowedActions.push("view_responses", "compare", "cancel");
      if (isContractor && !alreadyResponded) allowedActions.push("submit_proposal");
      if (isContractor && alreadyResponded) {
        blockedReason = "Вы уже отправили отклик по этой заявке.";
      }
      break;
    case "contractor_selected":
      explanation = "Заказчик выбрал исполнителя. Нужно создать или открыть заказ.";
      nextActor = "customer";
      if (isOwner) allowedActions.push("open_deal");
      if (isContractor) blockedReason = "Новые отклики закрыты: исполнитель уже выбран.";
      break;
    case "converted_to_order":
      explanation = "По заявке уже есть сделка.";
      nextActor = null;
      allowedActions.push("open_deal");
      break;
    case "completed":
      explanation = "Работа по заявке завершена.";
      nextActor = null;
      if (isOwner) recoveryActions.push("copy_request", "archive");
      break;
    case "expired":
      explanation = "Срок приёма откликов прошёл. Рабочие действия закрыты.";
      nextActor = "customer";
      blockedReason = `Срок отклика истёк ${deadline}. Отправить отклик нельзя.`;
      if (isOwner) recoveryActions.push("extend_deadline", "copy_request", "archive");
      break;
    case "cancelled":
      explanation = "Заявка отменена.";
      nextActor = null;
      if (isOwner) recoveryActions.push("copy_request", "archive");
      break;
    case "archived":
      explanation = "Заявка в архиве.";
      nextActor = null;
      if (isOwner) recoveryActions.push("copy_request");
      break;
  }

  if (code !== "expired" && isContractor && !allowedActions.includes("submit_proposal") && !alreadyResponded) {
    blockedReason = blockedReason ?? "Отклик сейчас недоступен.";
  }

  return {
    code,
    storedCode: request.status,
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

export function canPerformRequestAction(
  request: Request,
  user: CompanyProfile | null | undefined,
  action: ActionCode,
  responses: Response[],
  deals: Deal[]
): TransitionResult {
  const status = getRequestStatus(request, user, responses, deals);
  if (status.allowedActions.includes(action) || status.recoveryActions.includes(action)) {
    return { allowed: true, reason: "" };
  }
  return {
    allowed: false,
    reason: status.blockedReason ?? "Это действие недоступно в текущем статусе.",
  };
}
