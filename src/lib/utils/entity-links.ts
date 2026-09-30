import type { Booking, Document, Event, EventOrder, Payment, UserRole } from "../../data/types/index.ts";

export function getEventOrderHref(order: EventOrder): string {
  if (order.type === "stand_build" && order.dealId) {
    return `/deals/${order.dealId}`;
  }
  return `/orders/${order.id}`;
}

/** Cabinet sidebar destinations for order / project / invoice cards. */
export function getCabinetOrdersHref(role?: UserRole | null, eventId?: string): string {
  if (role === "venue") {
    return eventId ? `/account/venue/orders/${eventId}` : "/account/venue/orders";
  }
  if (role === "organizer") return "/account/organizer/orders";
  if (role === "contractor") return "/account/contractor/active-projects";
  return "/account/customer/active-projects";
}

export function getCabinetPaymentsHref(role?: UserRole | null, tab?: string): string {
  const suffix = tab ? `?tab=${tab}` : "";
  if (role === "contractor") return `/account/contractor/payouts${suffix}`;
  if (role === "venue") return `/account/venue/payments${suffix}`;
  if (role === "organizer") return `/account/organizer/payments${suffix}`;
  return `/account/customer/payments${suffix}`;
}

export function getCabinetAwareOrderHref(order: EventOrder, role?: UserRole | null): string {
  if (role === "venue" || role === "organizer") {
    return getCabinetOrdersHref(role, order.eventId);
  }
  return getEventOrderHref(order);
}

export function getRelatedObjectHref(entity: Pick<Document | Payment, "dealId" | "orderId" | "bookingId">): string | undefined {
  if (entity.dealId) return `/deals/${entity.dealId}`;
  if (entity.orderId) return `/orders/${entity.orderId}`;
  return undefined;
}

export function getConfirmedEventSchedule(eventId: string, bookings: Booking[]) {
  const confirmed = bookings.filter(
    (booking) => booking.eventId === eventId && booking.status === "confirmed"
  );
  const byType = (periodType: Booking["periodType"]) =>
    confirmed.find((booking) => booking.periodType === periodType);

  const eventPeriod = byType("event");
  const setup = byType("setup");
  const teardown = byType("teardown");
  const source = eventPeriod ?? confirmed[0];

  return {
    locked: confirmed.length > 0,
    venueId: source?.venueId,
    hallId: source?.hallId,
    startDate: eventPeriod?.periodStart ?? source?.periodStart,
    endDate: eventPeriod?.periodEnd ?? source?.periodEnd,
    assemblyStart: setup?.periodStart,
    assemblyEnd: setup?.periodEnd,
    dismantlingStart: teardown?.periodStart,
    dismantlingEnd: teardown?.periodEnd,
    bookingIds: confirmed.map((booking) => booking.id),
  };
}

export function applyScheduleToEvent(event: Event, bookings: Booking[]): Event {
  const schedule = getConfirmedEventSchedule(event.id, bookings);
  if (!schedule.locked) return event;
  return {
    ...event,
    venueId: schedule.venueId ?? event.venueId,
    startDate: schedule.startDate ?? event.startDate,
    endDate: schedule.endDate ?? event.endDate,
  };
}
