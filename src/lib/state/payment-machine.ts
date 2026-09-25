import type { CompanyProfile, Payment } from "../../data/types/index.ts";
import { ROLE_LABELS } from "../../constants/statuses.ts";
import { inferFinanceKind, isViewerFinancePayer } from "../domain/finance.ts";
import { isDeadlineReached } from "./clock.ts";
import type { ActionableStatus } from "./types.ts";

export type PaymentLifecycleCode = "draft" | "issued" | "overdue" | "paid" | "reserved" | "refunded" | "cancelled";

const LABELS: Record<PaymentLifecycleCode, string> = {
  draft: "Черновик / ожидает выставления",
  issued: "Выставлен",
  overdue: "Просрочен",
  paid: "Оплачен",
  reserved: "Зарезервирован",
  refunded: "Возврат",
  cancelled: "Отменён",
};

export function getPaymentDueAt(payment: Payment): string {
  return payment.dueAt ?? payment.date;
}

export function getPaymentLifecycleCode(payment: Payment): PaymentLifecycleCode {
  const kind = inferFinanceKind(payment);
  if (kind === "escrow") return payment.status === "refunded" ? "refunded" : "reserved";
  if (kind === "refund" || payment.status === "refunded") return "refunded";
  if (kind === "payout" || kind === "payment") {
    return payment.status === "paid" ? "paid" : "issued";
  }
  if (payment.status === "paid") return "paid";
  if (!payment.number) return "draft";
  if (isDeadlineReached(getPaymentDueAt(payment))) return "overdue";
  return "issued";
}

export function canPayInvoice(payment: Payment, user?: CompanyProfile | null): boolean {
  if (inferFinanceKind(payment) !== "invoice") return false;
  const code = getPaymentLifecycleCode(payment);
  if (code !== "issued" && code !== "overdue") return false;
  if (!user) return false;
  return isViewerFinancePayer(payment, user);
}

export function getPaymentStatus(
  payment: Payment,
  user?: CompanyProfile | null
): ActionableStatus {
  const code = getPaymentLifecycleCode(payment);
  const allowedActions: ActionableStatus["allowedActions"] = [];
  let blockedReason: string | undefined;

  if (code === "draft") {
    blockedReason = "Счёт ещё не выставлен: нет номера. Оплатить нельзя.";
  } else if ((code === "issued" || code === "overdue") && canPayInvoice(payment, user)) {
    allowedActions.push("pay");
  } else if (code === "paid" || code === "reserved") {
    blockedReason = "Повторная оплата не требуется.";
  }

  return {
    code,
    storedCode: payment.status,
    label: LABELS[code],
    explanation:
      code === "overdue"
        ? `Срок оплаты ${getPaymentDueAt(payment)} прошёл. Счёт остаётся выставленным.`
        : code === "draft"
          ? "Номер будет присвоен после выставления. Это не счёт к оплате."
          : code === "reserved"
            ? "Сумма удерживается как резерв, это не отдельный неоплаченный счёт."
            : code === "paid" && payment.escrowId
              ? "Счёт оплачен, деньги в резерве до приёмки."
              : LABELS[code],
    nextActor: allowedActions.includes("pay") ? "customer" : null,
    nextActorLabel: allowedActions.includes("pay") ? ROLE_LABELS.customer : null,
    deadline: getPaymentDueAt(payment),
    allowedActions,
    recoveryActions: code === "overdue" ? ["pay"] : [],
    blockedReason,
  };
}

export function isOpenInvoice(payment: Payment): boolean {
  const code = getPaymentLifecycleCode(payment);
  return code === "issued" || code === "overdue";
}
