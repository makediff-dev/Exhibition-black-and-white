import type { CompanyProfile, Payment, UserRole } from "../../data/types/index.ts";

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

export function getPaymentOperationLabel(type: string) {
  return PAYMENT_OPERATION_LABELS[type] ?? type;
}

function namesMatch(left?: string, right?: string) {
  if (!left || !right) return false;
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

export function isViewerPayer(payment: Payment, user?: CompanyProfile | null) {
  if (namesMatch(payment.payerName, user?.name)) return true;
  if (namesMatch(payment.payeeName, user?.name)) return false;
  return payment.direction === "outgoing";
}

export function isViewerPayee(payment: Payment, user?: CompanyProfile | null) {
  if (namesMatch(payment.payeeName, user?.name)) return true;
  if (namesMatch(payment.payerName, user?.name)) return false;
  return payment.direction === "incoming";
}

export function getPaymentTradeSideLabel(payment: Payment, user?: CompanyProfile | null) {
  if (isViewerPayer(payment, user)) return "К оплате";
  if (isViewerPayee(payment, user)) return "К получению";
  return payment.direction === "outgoing" ? "К оплате" : "К получению";
}

export function keepOwnLedgerCopy(
  payments: Payment[],
  viewer: "organizer" | "venue" | "other"
): Payment[] {
  const grouped = new Map<string, Payment[]>();
  const singles: Payment[] = [];

  payments.forEach((payment) => {
    if (!payment.ledgerPairId) {
      singles.push(payment);
      return;
    }
    const list = grouped.get(payment.ledgerPairId) ?? [];
    list.push(payment);
    grouped.set(payment.ledgerPairId, list);
  });

  const preferred: Payment[] = [];
  grouped.forEach((group) => {
    if (group.length === 1) {
      preferred.push(group[0]);
      return;
    }
    const match =
      viewer === "venue"
        ? group.find((item) => item.id.startsWith("vpay") || Boolean(item.venueId && !item.id.startsWith("opay")))
        : viewer === "organizer"
          ? group.find((item) => item.id.startsWith("opay") || !item.venueId)
          : group[0];
    preferred.push(match ?? group[0]);
  });

  return [...singles, ...preferred];
}

export function getLedgerPairNote(payment: Payment) {
  if (!payment.ledgerPairId) return null;
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
