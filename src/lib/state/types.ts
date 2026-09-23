import type { UserRole } from "../../data/types/index.ts";

export type ActorRole = Exclude<UserRole, null> | "platform";

export type ActionCode =
  | "publish"
  | "edit"
  | "delete"
  | "submit_proposal"
  | "view_responses"
  | "compare"
  | "open_deal"
  | "extend_deadline"
  | "copy_request"
  | "archive"
  | "cancel"
  | "accept_proposal"
  | "reject_proposal"
  | "withdraw_proposal"
  | "confirm_booking"
  | "reject_booking"
  | "cancel_booking"
  | "request_change"
  | "accept_change"
  | "reject_change"
  | "propose_inquiry"
  | "propose_changes"
  | "reject_inquiry"
  | "decline_inquiry"
  | "accept_inquiry"
  | "confirm_terms"
  | "pay"
  | "start_work"
  | "submit_stage"
  | "accept_stage"
  | "request_revision"
  | "request_payout"
  | "complete_deal"
  | "open_dispute"
  | "resolve_dispute"
  | "sign_document"
  | "send_document";

export interface ActionableStatus {
  code: string;
  storedCode: string;
  label: string;
  explanation: string;
  nextActor: ActorRole | null;
  nextActorLabel: string | null;
  deadline: string | null;
  allowedActions: ActionCode[];
  recoveryActions: ActionCode[];
  blockedReason?: string;
}

export interface TransitionResult {
  allowed: boolean;
  reason: string;
}
