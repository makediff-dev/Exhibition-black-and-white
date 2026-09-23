import type { CompanyProfile, Deal, DealStatus } from "../../data/types/index.ts";
import { DEAL_STATUS_LABELS, ROLE_LABELS } from "../../constants/statuses.ts";
import { isDealForUser } from "../utils/user-entity-map.ts";
import type { ActionCode, ActionableStatus, TransitionResult } from "./types.ts";

const CUSTOMER_TRANSITIONS: Partial<Record<DealStatus, Partial<Record<ActionCode, DealStatus>>>> = {
  negotiation: { confirm_terms: "awaiting_payment", open_dispute: "dispute" },
  awaiting_payment: { pay: "funds_reserved", open_dispute: "dispute" },
  funds_reserved: { open_dispute: "dispute" },
  in_progress: { open_dispute: "dispute" },
  stage_review: {
    accept_stage: "stage_accepted",
    request_revision: "needs_revision",
    open_dispute: "dispute",
  },
  needs_revision: { open_dispute: "dispute" },
  stage_accepted: { open_dispute: "dispute" },
  awaiting_payout: { open_dispute: "dispute" },
  dispute: { resolve_dispute: "completed" },
};

const CONTRACTOR_TRANSITIONS: Partial<Record<DealStatus, Partial<Record<ActionCode, DealStatus>>>> = {
  negotiation: { confirm_terms: "awaiting_payment" },
  funds_reserved: { start_work: "in_progress" },
  needs_revision: { start_work: "in_progress" },
  in_progress: { submit_stage: "stage_review" },
  stage_accepted: { request_payout: "awaiting_payout" },
  awaiting_payout: { complete_deal: "completed" },
};

const EXPLANATIONS: Record<DealStatus, string> = {
  negotiation: "Стороны согласуют условия сделки.",
  awaiting_payment: "Нужна оплата или резерв средств.",
  funds_reserved: "Средства зарезервированы. Исполнитель может начать этап.",
  in_progress: "Исполнитель выполняет текущий этап.",
  stage_review: "Результат этапа передан на проверку заказчику.",
  needs_revision: "Заказчик вернул этап на доработку.",
  stage_accepted: "Этап принят. Можно запросить выплату.",
  awaiting_payout: "Ожидается выплата по принятому этапу.",
  completed: "Сделка завершена.",
  dispute: "Открыт спор. Обычная приёмка недоступна.",
};

const NEXT_ACTOR: Record<DealStatus, ActionableStatus["nextActor"]> = {
  negotiation: "customer",
  awaiting_payment: "customer",
  funds_reserved: "contractor",
  in_progress: "contractor",
  stage_review: "customer",
  needs_revision: "contractor",
  stage_accepted: "contractor",
  awaiting_payout: "platform",
  completed: null,
  dispute: "platform",
};

function roleTransitions(deal: Deal, user: CompanyProfile | null | undefined) {
  if (!user || !isDealForUser(deal, user)) return {};
  if (user.role === "customer") {
    const transitions = { ...(CUSTOMER_TRANSITIONS[deal.status] ?? {}) };
    if (deal.status === "awaiting_payment") {
      transitions.pay = deal.format === "safe_deal" ? "funds_reserved" : "in_progress";
    }
    return transitions;
  }
  if (user.role === "contractor") return CONTRACTOR_TRANSITIONS[deal.status] ?? {};
  return {};
}

export function getDealStatus(
  deal: Deal,
  user: CompanyProfile | null | undefined
): ActionableStatus {
  const transitions = roleTransitions(deal, user);
  const allowedActions = Object.keys(transitions) as ActionCode[];
  const nextActor = NEXT_ACTOR[deal.status];

  return {
    code: deal.status,
    storedCode: deal.status,
    label: DEAL_STATUS_LABELS[deal.status],
    explanation: EXPLANATIONS[deal.status],
    nextActor,
    nextActorLabel: nextActor === "platform" ? "Платформа" : nextActor ? ROLE_LABELS[nextActor] : null,
    deadline: deal.stages.find((stage) => stage.status === "in_progress" || stage.status === "review")
      ?.deadline ?? null,
    allowedActions,
    recoveryActions: deal.status === "dispute" ? ["resolve_dispute"] : [],
  };
}

export function canTransitionDeal(
  deal: Deal,
  user: CompanyProfile | null | undefined,
  nextStatus: DealStatus
): TransitionResult {
  const transitions = roleTransitions(deal, user);
  const allowed = Object.values(transitions).includes(nextStatus);
  if (!allowed) {
    return { allowed: false, reason: "Этот переход сделки недоступен в текущем статусе." };
  }
  return { allowed: true, reason: "" };
}

export function dealActionToStatus(
  deal: Deal,
  user: CompanyProfile | null | undefined,
  action: ActionCode
): DealStatus | null {
  const transitions = roleTransitions(deal, user);
  return transitions[action] ?? null;
}
