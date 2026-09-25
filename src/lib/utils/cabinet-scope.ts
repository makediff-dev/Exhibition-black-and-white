import type {
  Booking,
  CompanyProfile,
  Deal,
  Document,
  MessageCategory,
  MessageThread,
  Notification,
  Payment,
  Request,
  Response,
  UserRole,
} from "@/data/types";
import { getPrototypeNowDateIso } from "@/lib/time/now";
import {
  canReadDocument,
  canReadPayment,
  isAllowedCabinetPath as isAllowedCabinetPathFromAuth,
  isRequestVisibleToContractor as isRequestVisibleToContractorFromAuth,
} from "@/lib/auth/authorization";

export function isPaymentForUser(
  payment: Payment,
  user: CompanyProfile | null | undefined,
  deals: Deal[]
): boolean {
  return canReadPayment(payment, user, deals);
}

export function isDocumentForUser(
  document: Document,
  user: CompanyProfile | null | undefined,
  deals: Deal[]
): boolean {
  return canReadDocument(document, user, deals);
}

export function isThreadForUser(
  thread: MessageThread,
  role: UserRole | null | undefined
): boolean {
  if (!role) return false;
  if (thread.participantRoles?.length) return thread.participantRoles.includes(role);
  if (thread.category === "system") return true;
  if (role === "customer" || role === "contractor") return thread.category === "customer";
  if (role === "venue") return thread.category === "venue";
  if (role === "organizer") return thread.category === "organizer";
  return false;
}

export function getThreadInboxCategory(
  thread: MessageThread,
  role: UserRole | null | undefined
): MessageCategory {
  if (thread.category === "system" || thread.contextType === "support" || thread.relatedType === "support") {
    return "system";
  }
  if (role && thread.participantRoles?.includes(role)) {
    const counterpart = thread.participantRoles.find((item) => item !== role);
    if (counterpart === "customer") return "customer";
    if (counterpart === "contractor") return "contractor";
    if (counterpart === "venue") return "venue";
    if (counterpart === "organizer") return "organizer";
  }
  return thread.category;
}

export function isNotificationForUser(
  notification: Notification,
  role: UserRole | null | undefined
): boolean {
  if (!role) return false;
  if (notification.audience) return notification.audience === role;
  return role === "customer";
}

export function isRequestVisibleToContractor(
  request: Request,
  user: CompanyProfile | null | undefined,
  responses: Response[] = [],
  deals: Deal[] = []
): boolean {
  return isRequestVisibleToContractorFromAuth(request, user, responses, deals);
}

export function getContractorPayoutBalance(
  payments: Payment[],
  deals: Deal[],
  user: CompanyProfile | null | undefined
): number {
  const mine = payments.filter((payment) => isPaymentForUser(payment, user, deals));
  const pendingPayouts = mine.filter(
    (payment) => payment.type === "Выплата" && payment.status === "pending"
  );
  if (pendingPayouts.length > 0) {
    return pendingPayouts.reduce((sum, payment) => sum + payment.amount, 0);
  }

  const reserved = mine
    .filter((payment) => payment.status === "reserved")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const paidOut = mine
    .filter((payment) => payment.type === "Выплата" && payment.status === "paid")
    .reduce((sum, payment) => sum + payment.amount, 0);

  return Math.max(0, reserved - paidOut);
}

export function buildBookingInvoice(booking: Booking, amount: number): Payment {
  return {
    id: `vpay-booking-${booking.id}`,
    venueId: booking.venueId,
    eventId: booking.eventId,
    organizerId: booking.organizerId,
    organizerName: booking.organizerName,
    participantRole: "organizer",
    counterpartyName: booking.organizerName,
    type: "Счёт к оплате",
    amount,
    status: "pending",
    date: getPrototypeNowDateIso(),
    description: `Аренда зала — бронирование ${booking.id}`,
    direction: "incoming",
  };
}

export const isAllowedCabinetPath = isAllowedCabinetPathFromAuth;
