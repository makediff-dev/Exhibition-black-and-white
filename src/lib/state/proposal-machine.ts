import type { CompanyProfile, Request, Response } from "../../data/types/index.ts";
import { ROLE_LABELS } from "../../constants/statuses.ts";
import { isDeadlineReached } from "./clock.ts";
import type { ActionableStatus } from "./types.ts";

export type ProposalLifecycleCode = "submitted" | "accepted" | "rejected" | "expired";

const LABELS: Record<ProposalLifecycleCode, string> = {
  submitted: "На рассмотрении",
  accepted: "Выбран",
  rejected: "Отклонён",
  expired: "Срок КП истёк",
};

export function getProposalLifecycleCode(proposal: Response): ProposalLifecycleCode {
  if (proposal.status === "accepted") return "accepted";
  if (proposal.status === "rejected") return "rejected";
  if (proposal.status === "pending" && isDeadlineReached(proposal.validUntil)) return "expired";
  return "submitted";
}

export function getProposalStatus(
  proposal: Response,
  request: Request | undefined,
  user: CompanyProfile | null | undefined
): ActionableStatus {
  const code = getProposalLifecycleCode(proposal);
  const isOwner = user?.role === "customer" && request?.customerId === user.id;
  const isAuthor = user?.role === "contractor" && proposal.contractorName === user.name;

  const allowedActions: ActionableStatus["allowedActions"] = [];
  let nextActor: ActionableStatus["nextActor"] = null;
  let explanation = "";
  let blockedReason: string | undefined;

  switch (code) {
    case "submitted":
      explanation = "Отклик отправлен и ждёт решения заказчика.";
      nextActor = "customer";
      if (isOwner) allowedActions.push("accept_proposal", "reject_proposal");
      if (isAuthor) allowedActions.push("withdraw_proposal");
      break;
    case "accepted":
      explanation = "Заказчик выбрал это коммерческое предложение.";
      nextActor = "customer";
      allowedActions.push("open_deal");
      break;
    case "rejected":
      explanation = "Отклик отклонён.";
      nextActor = null;
      blockedReason = "Принять отклонённый отклик нельзя.";
      break;
    case "expired":
      explanation = "Срок действия коммерческого предложения истёк.";
      nextActor = "customer";
      blockedReason = `Срок КП истёк ${proposal.validUntil}. Принять его нельзя.`;
      break;
  }

  return {
    code,
    storedCode: proposal.status,
    label: LABELS[code],
    explanation,
    nextActor,
    nextActorLabel: nextActor ? ROLE_LABELS[nextActor] : null,
    deadline: proposal.validUntil,
    allowedActions,
    recoveryActions: [],
    blockedReason,
  };
}
