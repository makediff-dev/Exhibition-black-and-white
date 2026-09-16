import type {
  Booking,
  CompanyProfile,
  Deal,
  Document,
  MessageThread,
  Notification,
  Payment,
  Request,
  UserRole,
} from "@/data/types";
import {
  getContractorIdForUser,
  getVenueIdForUser,
  isDealForUser,
} from "@/lib/utils/user-entity-map";

function isVenueOwnedPayment(payment: Payment) {
  return Boolean(payment.venueId);
}

function isOrganizerOwnedPayment(payment: Payment) {
  return Boolean(payment.organizerId) && !payment.venueId;
}

export function isPaymentForUser(
  payment: Payment,
  user: CompanyProfile | null | undefined,
  deals: Deal[]
): boolean {
  if (!user?.role) return false;

  if (user.role === "venue") {
    return payment.venueId === getVenueIdForUser(user);
  }

  if (user.role === "organizer") {
    return payment.organizerId === user.id;
  }

  if (isVenueOwnedPayment(payment) || isOrganizerOwnedPayment(payment)) {
    return false;
  }

  const deal = payment.dealId ? deals.find((item) => item.id === payment.dealId) : undefined;
  return Boolean(deal && isDealForUser(deal, user));
}

export function isDocumentForUser(
  document: Document,
  user: CompanyProfile | null | undefined,
  deals: Deal[]
): boolean {
  if (!user?.role) return false;

  if (user.role === "venue") {
    return document.venueId === getVenueIdForUser(user);
  }

  if (user.role === "organizer") {
    return document.organizerId === user.id;
  }

  const deal = deals.find((item) => item.id === document.dealId);
  return Boolean(deal && isDealForUser(deal, user));
}

export function isThreadForUser(
  thread: MessageThread,
  role: UserRole | null | undefined
): boolean {
  if (thread.category === "system") return true;
  if (role === "customer" || role === "contractor") return thread.category === "customer";
  if (role === "venue") return thread.category === "venue";
  if (role === "organizer") return thread.category === "organizer";
  return false;
}

export function isNotificationForUser(
  notification: Notification,
  role: UserRole | null | undefined
): boolean {
  if (notification.audience) return notification.audience === role;
  return role === "customer" || role === "contractor" || !role;
}

export function isRequestVisibleToContractor(
  request: Request,
  contractorId: string | null
): boolean {
  if (request.status !== "published") return false;
  if (request.format !== "closed_request") return true;
  if (!contractorId) return false;
  return request.invitedContractorIds.includes(contractorId);
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
    date: new Date().toISOString().slice(0, 10),
    description: `Аренда зала — бронирование ${booking.id}`,
    direction: "incoming",
  };
}

export function isAllowedCabinetPath(role: string, slug: string): boolean {
  const base = slug.split("/")[0] ?? "";
  if (!base) return true;

  const extras: Record<string, string[]> = {
    customer: [
      "cart",
      "checkout",
      "legal",
      "repeat-order",
      "completed-projects",
      "edo",
      "reminders",
      "closing-docs",
    ],
    contractor: [
      "cities",
      "production",
      "portfolio",
      "reviews",
      "gantt",
      "completed-projects",
      "bookings",
    ],
    venue: ["spaces", "floor-plan"],
    organizer: ["create-event", "edit-event", "participants", "services", "bookings"],
  };

  const navSlugs: Record<string, string[]> = {
    customer: [
      "profile",
      "messages",
      "edo",
      "requests",
      "my-events",
      "favorites",
      "cart",
      "responses",
      "active-projects",
      "checks",
      "payments",
      "settings",
    ],
    contractor: [
      "profile",
      "messages",
      "services",
      "available-requests",
      "my-responses",
      "active-projects",
      "payouts",
      "documents",
      "settings",
    ],
    venue: [
      "profile",
      "messages",
      "halls",
      "events",
      "venue-services",
      "bookings",
      "orders",
      "payments",
      "documents",
      "settings",
    ],
    organizer: [
      "profile",
      "messages",
      "events",
      "venues",
      "orders",
      "payments",
      "documents",
      "settings",
    ],
  };

  return (navSlugs[role] ?? []).includes(base) || (extras[role] ?? []).includes(base);
}
