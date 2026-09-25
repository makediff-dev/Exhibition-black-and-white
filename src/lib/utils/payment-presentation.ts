import type { CompanyProfile, Payment, UserRole } from "../../data/types/index.ts";
import {
  getFinanceKindLabel,
  getFinanceTradeSideLabel,
  isViewerFinancePayee,
  isViewerFinancePayer,
  keepCanonicalInvoiceCopy,
} from "../domain/finance.ts";

export const PAYMENT_STATUS_LABELS: Record<Payment["status"], string> = {
  pending: "Ожидает оплаты",
  paid: "Оплачено",
  reserved: "Зарезервировано",
  refunded: "Возвращено",
};

export const PAYMENT_OPERATION_LABELS: Record<string, string> = {
  Резерв: "Резерв средств",
  Выплата: "Выплата",
  "Счёт к оплате": "Счёт",
};

export function getPaymentOperationLabel(type: string, payment?: Payment) {
  if (payment) return getFinanceKindLabel(payment);
  return PAYMENT_OPERATION_LABELS[type] ?? type;
}

function namesMatch(left?: string, right?: string) {
  if (!left || !right) return false;
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

export function isViewerPayer(payment: Payment, user?: CompanyProfile | null) {
  if (isViewerFinancePayer(payment, user)) return true;
  if (namesMatch(payment.payerName, user?.name)) return true;
  if (namesMatch(payment.payeeName, user?.name)) return false;
  return payment.direction === "outgoing";
}

export function isViewerPayee(payment: Payment, user?: CompanyProfile | null) {
  if (isViewerFinancePayee(payment, user)) return true;
  if (namesMatch(payment.payeeName, user?.name)) return true;
  if (namesMatch(payment.payerName, user?.name)) return false;
  return payment.direction === "incoming";
}

export function getPaymentTradeSideLabel(payment: Payment, user?: CompanyProfile | null) {
  return getFinanceTradeSideLabel(payment, user);
}

export function keepOwnLedgerCopy(
  payments: Payment[],
  viewer: "organizer" | "venue" | "other"
): Payment[] {
  return keepCanonicalInvoiceCopy(payments, viewer);
}

export function getLedgerPairNote(payment: Payment) {
  if (!payment.ledgerPairId && !payment.invoiceId) return null;
  return "Зеркальная запись контрагента скрыта. Это один счёт, а не два начисления.";
}

export function paymentMatchesRoleLedger(
  payment: Payment,
  role?: UserRole | null
): boolean {
  if (role === "organizer") return !payment.id.startsWith("vpay");
  if (role === "venue") return !payment.id.startsWith("opay");
  return true;
}
