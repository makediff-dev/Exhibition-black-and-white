import type { Event, OrganizerEventDraft, VenueInquiry } from "../../data/types/index.ts";
import { getEventLifecycleCode } from "../state/event-machine.ts";

export interface InquiryEventOption {
  id: string;
  title: string;
  city: string;
  startDate: string;
  endDate: string;
  kind: "draft" | "upcoming" | "completed";
}

export function toInquiryEventOption(event: Event): InquiryEventOption {
  const code = getEventLifecycleCode(event);
  return {
    id: event.id,
    title: event.title,
    city: event.city,
    startDate: event.startDate,
    endDate: event.endDate,
    kind: code === "completed" || code === "cancelled" || code === "archived" ? "completed" : "upcoming",
  };
}

export function draftToInquiryOption(draft: OrganizerEventDraft): InquiryEventOption {
  return {
    id: draft.id,
    title: draft.title || "Черновик мероприятия",
    city: draft.city,
    startDate: draft.startDate,
    endDate: draft.endDate,
    kind: "draft",
  };
}

export function listOrganizerInquiryEvents(
  events: Event[],
  draft: OrganizerEventDraft | null,
  organizerId: string
): InquiryEventOption[] {
  const owned = events.filter((event) => event.organizerId === organizerId).map(toInquiryEventOption);
  const selectable = owned.filter((item) => item.kind !== "completed");
  if (draft && !selectable.some((item) => item.id === draft.id)) {
    return [draftToInquiryOption(draft), ...selectable];
  }
  return selectable;
}

export function countOrganizerEvents(events: Event[], organizerId: string): number {
  return events.filter((event) => event.organizerId === organizerId).length;
}

export function canSendVenueInquiry(option: InquiryEventOption | null): boolean {
  if (!option) return false;
  if (option.kind === "completed") return false;
  return Boolean(option.startDate && option.endDate);
}

export function buildGroupedVenueInquiries(input: {
  venueIds: string[];
  event: InquiryEventOption;
  organizerName: string;
  dateFrom: string;
  dateTo: string;
  minArea?: string;
  requirements?: string;
  sentAt: string;
  resolveVenueName: (venueId: string) => string;
}): VenueInquiry[] {
  const eventRequestId = `er-${input.event.id}-${input.sentAt}`;
  return input.venueIds.map((venueId) => ({
    id: `vi-${venueId}-${input.sentAt}`,
    eventDraftId: input.event.id,
    eventId: input.event.kind === "draft" ? undefined : input.event.id,
    eventRequestId,
    eventTitle: input.event.title,
    organizerName: input.organizerName,
    venueId,
    venueName: input.resolveVenueName(venueId),
    dateFrom: input.dateFrom,
    dateTo: input.dateTo,
    minArea: input.minArea,
    requirements: input.requirements,
    status: "pending",
    sentAt: input.sentAt,
    history: [{ date: input.sentAt, actor: "organizer", action: "Запрос отправлен" }],
  }));
}
