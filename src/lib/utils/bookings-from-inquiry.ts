import type { Booking, VenueInquiry } from "../../data/types/index.ts";

function shiftIso(date: string, days: number) {
  const next = new Date(`${date}T12:00:00.000Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

export function resolveInquirySchedule(inquiry: VenueInquiry) {
  const useAlt = inquiry.status === "changes_proposed";
  return {
    hallId: useAlt ? inquiry.alternativeHallId ?? inquiry.hallId : inquiry.hallId,
    dateFrom: useAlt ? inquiry.alternativeDateFrom ?? inquiry.dateFrom : inquiry.dateFrom,
    dateTo: useAlt ? inquiry.alternativeDateTo ?? inquiry.dateTo : inquiry.dateTo,
  };
}

export function createBookingsFromInquiry(inquiry: VenueInquiry, organizerId: string): Booking[] {
  const { hallId, dateFrom, dateTo } = resolveInquirySchedule(inquiry);
  const setupStart = inquiry.setupStart ?? shiftIso(dateFrom, -2);
  const setupEnd = inquiry.setupEnd ?? shiftIso(dateFrom, -1);
  const teardownStart = inquiry.teardownStart ?? shiftIso(dateTo, 1);
  const teardownEnd = inquiry.teardownEnd ?? shiftIso(dateTo, 2);

  const base = {
    eventId: inquiry.eventDraftId,
    venueId: inquiry.venueId,
    hallId,
    organizerId,
    organizerName: inquiry.organizerName,
    inquiryId: inquiry.id,
    holdUntil: inquiry.holdUntil,
    cancellationTerms: inquiry.cancellationTerms,
    status: "confirmed" as const,
  };

  return [
    {
      ...base,
      id: `book-${inquiry.id}-setup`,
      date: setupStart,
      periodType: "setup",
      periodStart: setupStart,
      periodEnd: setupEnd,
    },
    {
      ...base,
      id: `book-${inquiry.id}-event`,
      date: dateFrom,
      periodType: "event",
      periodStart: dateFrom,
      periodEnd: dateTo,
    },
    {
      ...base,
      id: `book-${inquiry.id}-teardown`,
      date: teardownStart,
      periodType: "teardown",
      periodStart: teardownStart,
      periodEnd: teardownEnd,
    },
  ];
}
