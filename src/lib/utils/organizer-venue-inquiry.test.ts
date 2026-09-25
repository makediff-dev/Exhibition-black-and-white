import assert from "node:assert/strict";
import { test } from "node:test";
import { SEED_EVENTS } from "../../data/mocks/seed.ts";
import {
  buildGroupedVenueInquiries,
  canSendVenueInquiry,
  countOrganizerEvents,
  listOrganizerInquiryEvents,
  toInquiryEventOption,
} from "./organizer-venue-inquiry.ts";

test("organizer with a full calendar can pick an upcoming event without creating a duplicate", () => {
  const options = listOrganizerInquiryEvents(SEED_EVENTS, null, "user-organizer");
  assert.ok(countOrganizerEvents(SEED_EVENTS, "user-organizer") >= 12);
  assert.ok(options.some((item) => item.id === "evt-8"));
  assert.ok(options.every((item) => item.kind !== "completed"));
});

test("completed events cannot send a venue inquiry", () => {
  const completed = toInquiryEventOption(SEED_EVENTS.find((item) => item.id === "evt-1")!);
  assert.equal(completed.kind, "completed");
  assert.equal(canSendVenueInquiry(completed), false);
});

test("group request shares one event request id and splits venue proposals", () => {
  const event = toInquiryEventOption(SEED_EVENTS.find((item) => item.id === "evt-8")!);
  const inquiries = buildGroupedVenueInquiries({
    venueIds: ["venue-1", "venue-2"],
    event,
    organizerName: "Организатор",
    dateFrom: event.startDate,
    dateTo: event.endDate,
    sentAt: "2026-09-24",
    resolveVenueName: (id) => id,
  });
  assert.equal(inquiries.length, 2);
  assert.equal(inquiries[0].eventRequestId, inquiries[1].eventRequestId);
  assert.equal(inquiries[0].eventDraftId, "evt-8");
  assert.notEqual(inquiries[0].id, inquiries[1].id);
});
