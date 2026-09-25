import { ORG_DISPLAY_NAMES } from "../../data/mocks/order-parties.ts";
import type { CompanyProfile, FinanceKind, Payment } from "../../data/types/index.ts";

const NAME_TO_ORG_ID: Record<string, string> = Object.fromEntries(
  Object.entries(ORG_DISPLAY_NAMES).map(([id, name]) => [name.toLowerCase(), id])
);
NAME_TO_ORG_ID["платформа"] = "platform";
NAME_TO_ORG_ID["экспоцентр"] = "venue-1";

export function inferFinanceKind(payment: Payment): FinanceKind {
  if (payment.kind) return payment.kind;
  if (payment.status === "refunded" || payment.type === "Возврат") return "refund";
  if (payment.type === "Резерв" || payment.status === "reserved") return "escrow";
  if (payment.type === "Выплата") return "payout";
  if (payment.type.includes("Счёт")) return "invoice";
  if (payment.status === "paid") return "payment";
  return "invoice";
}

export function orgIdFromPartyName(name?: string): string | undefined {
  if (!name) return undefined;
  return NAME_TO_ORG_ID[name.trim().toLowerCase()];
}

export function hydrateFinanceRecord(payment: Payment): Payment {
  const kind = inferFinanceKind(payment);
  const payerOrgId = payment.payerOrgId ?? orgIdFromPartyName(payment.payerName);
  const payeeOrgId = payment.payeeOrgId ?? orgIdFromPartyName(payment.payeeName);
  const basisType =
    payment.basisType ??
    (payment.dealId ? "deal" : payment.orderId ? "order" : payment.eventId ? "event" : undefined);
  const basisId = payment.basisId ?? payment.dealId ?? payment.orderId ?? payment.eventId;
  const invoiceId =
    payment.invoiceId ??
    (kind === "invoice" ? payment.ledgerPairId ?? payment.id : payment.ledgerPairId);
  const issuedAt = payment.issuedAt ?? (payment.number ? payment.date : undefined);

  let escrowId = payment.escrowId;
  if (payment.id === "pay-9") escrowId = payment.escrowId ?? "pay-1";

  return {
    ...payment,
    kind,
    currency: payment.currency ?? "RUB",
    payerOrgId,
    payeeOrgId,
    basisType,
    basisId,
    invoiceId: kind === "escrow" && payment.id === "pay-1" ? "pay-9" : invoiceId,
    escrowId: payment.id === "pay-1" ? payment.id : escrowId,
    issuedAt,
  };
}

export function isFinanceInvoice(payment: Payment): boolean {
  return inferFinanceKind(payment) === "invoice";
}

export function isFinanceEscrow(payment: Payment): boolean {
  return inferFinanceKind(payment) === "escrow";
}

function viewerOrgIds(user?: CompanyProfile | null): string[] {
  if (!user?.id) return [];
  const ids = [user.id];
  if (user.role === "venue") ids.push("venue-1");
  if (user.role === "contractor" && user.id === "user-contractor") ids.push("ctr-1");
  if (user.role === "contractor" && user.id === "user-contractor-media") ids.push("ctr-3");
  return ids;
}

export function isViewerFinancePayer(payment: Payment, user?: CompanyProfile | null): boolean {
  const orgs = viewerOrgIds(user);
  if (payment.payerOrgId && orgs.includes(payment.payerOrgId)) return true;
  if (payment.payeeOrgId && orgs.includes(payment.payeeOrgId)) return false;
  return payment.direction === "outgoing";
}

export function isViewerFinancePayee(payment: Payment, user?: CompanyProfile | null): boolean {
  const orgs = viewerOrgIds(user);
  if (payment.payeeOrgId && orgs.includes(payment.payeeOrgId)) return true;
  if (payment.payerOrgId && orgs.includes(payment.payerOrgId)) return false;
  return payment.direction === "incoming";
}

export function getFinanceTradeSideLabel(payment: Payment, user?: CompanyProfile | null): string {
  if (isViewerFinancePayer(payment, user)) return "К оплате";
  if (isViewerFinancePayee(payment, user)) return "К получению";
  return payment.direction === "outgoing" ? "К оплате" : "К получению";
}

export function getFinanceKindLabel(payment: Payment): string {
  const kind = inferFinanceKind(payment);
  if (kind === "invoice") return "Счёт";
  if (kind === "escrow") return "Резерв";
  if (kind === "payout") return "Выплата";
  if (kind === "refund") return "Возврат";
  return "Платёж";
}

export function getFinanceBasisLabel(payment: Payment): string | null {
  if (payment.basisType === "deal" && payment.basisId) return `Сделка ${payment.basisId}`;
  if (payment.basisType === "order" && payment.basisId) return `Заказ ${payment.basisId}`;
  if (payment.basisType === "event" && payment.basisId) return `Мероприятие ${payment.basisId}`;
  return null;
}

export function getEscrowLinkNote(payment: Payment, all: Payment[]): string | null {
  const kind = inferFinanceKind(payment);
  if (kind === "invoice" && payment.escrowId) {
    const escrow = all.find((item) => item.id === payment.escrowId);
    if (escrow) {
      return "Счёт оплачен. Сумма удерживается в резерве до приёмки, повторная оплата не нужна.";
    }
  }
  if (kind === "escrow" && payment.invoiceId) {
    return "Это резерв по уже оплаченному счёту, а не отдельный счёт к оплате.";
  }
  return null;
}

export function getFinanceBreakdown(payments: Payment[]) {
  const reserve = payments
    .filter((item) => inferFinanceKind(item) === "escrow" && item.status === "reserved")
    .reduce((sum, item) => sum + item.amount, 0);
  const payouts = payments
    .filter((item) => inferFinanceKind(item) === "payout" && item.status === "paid")
    .reduce((sum, item) => sum + item.amount, 0);
  const refunded = payments
    .filter((item) => inferFinanceKind(item) === "refund")
    .reduce((sum, item) => sum + item.amount, 0);
  const openInvoices = payments.filter((item) => {
    const kind = inferFinanceKind(item);
    return kind === "invoice" && item.status !== "paid" && item.status !== "refunded" && Boolean(item.number);
  });

  return {
    reserve,
    payouts,
    refunded,
    available: Math.max(0, reserve - payouts),
    openInvoiceAmount: openInvoices.reduce((sum, item) => sum + item.amount, 0),
  };
}

export function keepCanonicalInvoiceCopy(payments: Payment[], viewer: "organizer" | "venue" | "other"): Payment[] {
  const grouped = new Map<string, Payment[]>();
  const singles: Payment[] = [];

  payments.forEach((payment) => {
    const key = payment.ledgerPairId ?? (inferFinanceKind(payment) === "invoice" ? payment.invoiceId : undefined);
    if (!key) {
      singles.push(payment);
      return;
    }
    const list = grouped.get(key) ?? [];
    list.push(payment);
    grouped.set(key, list);
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
