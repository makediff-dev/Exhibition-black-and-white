import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { DEMO_USERS, SEED_BOOKINGS, SEED_VENUE_INQUIRIES } from "../../data/mocks/seed.ts";
import { isHallOccupied } from "../utils/hall-availability.ts";
import { setPrototypeNowIso } from "../time/now.ts";
import { canTransitionInquiry, getInquiryLifecycleCode, getInquiryStatus } from "./inquiry-machine.ts";

afterEach(() => {
  setPrototypeNowIso(null);
});

const pending = SEED_VENUE_INQUIRIES.find((item) => item.id === "vinq-2");
const offered = SEED_VENUE_INQUIRIES.find((item) => item.id === "vinq-1");
assert.ok(pending);
assert.ok(offered);

test("inquiry cannot be sent conceptually without event context: pending waits for venue", () => {
  setPrototypeNowIso("2026-03-20T12:00:00+03:00");
  const venueView = getInquiryStatus(pending, DEMO_USERS.venue);
  const organizerView = getInquiryStatus(pending, DEMO_USERS.organizer);
  assert.equal(venueView.nextActor, "venue");
  assert.equal(organizerView.nextActor, "venue");
  assert.equal(venueView.label, organizerView.label);
  assert.equal(canTransitionInquiry(pending, DEMO_USERS.venue, "proposal_received", { hallId: "hall-2" }).allowed, true);
  assert.equal(canTransitionInquiry(pending, DEMO_USERS.venue, "declined").allowed, false);
  assert.equal(
    canTransitionInquiry(pending, DEMO_USERS.venue, "declined", { reason: "Зал занят, доступен зал 2 с 8 апреля" }).allowed,
    true
  );
});

test("only organizer accepts a proposal; both roles share next actor", () => {
  setPrototypeNowIso("2026-03-20T12:00:00+03:00");
  const venueView = getInquiryStatus(offered, DEMO_USERS.venue);
  const organizerView = getInquiryStatus(offered, DEMO_USERS.organizer);
  assert.equal(venueView.nextActor, "organizer");
  assert.equal(organizerView.nextActor, "organizer");
  assert.equal(canTransitionInquiry(offered, DEMO_USERS.venue, "selected").allowed, false);
  assert.equal(canTransitionInquiry(offered, DEMO_USERS.organizer, "selected").allowed, true);
});

test("past inquiry dates expire and block venue reply", () => {
  setPrototypeNowIso("2026-09-24T12:00:00+03:00");
  assert.equal(getInquiryLifecycleCode(pending), "expired");
  assert.equal(canTransitionInquiry(pending, DEMO_USERS.venue, "proposal_received", { hallId: "hall-2" }).allowed, false);
});

test("confirmed hall occupancy blocks a second confirmation on the same dates", () => {
  assert.equal(
    isHallOccupied(SEED_BOOKINGS, "hall-1", "2026-03-15", "2026-03-18"),
    true
  );
  assert.equal(
    isHallOccupied(SEED_BOOKINGS, "hall-1", "2026-08-01", "2026-08-03"),
    false
  );
});
