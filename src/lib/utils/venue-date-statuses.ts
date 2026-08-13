import type { Booking, Event, VenueBookingDateStatus, VenueInquiry } from "@/data/types";

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function expandIsoDateRange(start: string, end: string): string[] {
  if (!start) return [];

  const dates: string[] = [];
  const cursor = new Date(start);
  const last = new Date(end || start);

  while (cursor <= last) {
    dates.push(toIsoDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

function addStatus(
  map: Record<string, VenueBookingDateStatus[]>,
  dates: string[],
  status: VenueBookingDateStatus
) {
  dates.forEach((date) => {
    const current = map[date] ?? [];
    if (!current.includes(status)) {
      map[date] = [...current, status];
    }
  });
}

export function buildVenueDateStatuses(
  venueId: string,
  bookings: Booking[],
  inquiries: VenueInquiry[]
): Record<string, VenueBookingDateStatus[]> {
  const map: Record<string, VenueBookingDateStatus[]> = {};

  bookings
    .filter((booking) => booking.venueId === venueId && booking.status !== "rejected")
    .forEach((booking) => {
      const start = booking.periodStart ?? booking.date;
      const end = booking.periodEnd ?? start;
      const status: VenueBookingDateStatus =
        booking.status === "confirmed" ? "rented" : "booked";
      addStatus(map, expandIsoDateRange(start, end), status);
    });

  inquiries
    .filter(
      (inquiry) =>
        inquiry.venueId === venueId &&
        (inquiry.status === "pending" || inquiry.status === "proposal_received")
    )
    .forEach((inquiry) => {
      addStatus(map, expandIsoDateRange(inquiry.dateFrom, inquiry.dateTo), "negotiating");
    });

  return map;
}

export const VENUE_BOOKING_DATE_STATUS_META: Record<
  VenueBookingDateStatus,
  { label: string; dotClassName: string }
> = {
  rented: { label: "Арендовано", dotClassName: "bg-emerald-500" },
  booked: { label: "Забронировано", dotClassName: "bg-yellow-400" },
  negotiating: { label: "Идут переговоры", dotClassName: "bg-blue-500" },
};

function rangesOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  const safeEndA = endA || startA;
  const safeEndB = endB || startB;
  return startA <= safeEndB && startB <= safeEndA;
}

export function getEventVenueStatuses(
  event: Event,
  bookings: Booking[],
  inquiries: VenueInquiry[],
  hasVenueMeta = false
): VenueBookingDateStatus[] {
  const statuses = new Set<VenueBookingDateStatus>();

  bookings
    .filter((booking) => booking.eventId === event.id && booking.venueId === event.venueId)
    .forEach((booking) => {
      if (booking.status === "confirmed") statuses.add("rented");
      if (booking.status === "pending") statuses.add("booked");
    });

  inquiries
    .filter(
      (inquiry) =>
        inquiry.venueId === event.venueId &&
        (inquiry.status === "pending" || inquiry.status === "proposal_received") &&
        rangesOverlap(inquiry.dateFrom, inquiry.dateTo, event.startDate, event.endDate)
    )
    .forEach(() => statuses.add("negotiating"));

  if (statuses.size === 0 && hasVenueMeta) {
    statuses.add("rented");
  }

  return Array.from(statuses);
}

export function getMonthKey(date: string) {
  const parsed = new Date(date);
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
}

export function getMonthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(
    new Date(year, month - 1, 1)
  );
}

export function getYearMonthKeys(year: number) {
  return Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, "0");
    return `${year}-${month}`;
  });
}
