import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  DEMO_USERS,
  SEED_BOOKINGS,
  SEED_DEALS,
  SEED_REQUESTS,
  SEED_RESPONSES,
} from "../../data/mocks/seed.ts";
import { setPrototypeNowIso } from "../time/now.ts";
import { canTransitionBooking } from "./booking-machine.ts";
import { canTransitionDeal, getDealStatus } from "./deal-machine.ts";
import { getProposalLifecycleCode } from "./proposal-machine.ts";
import { canPerformRequestAction, getRequestLifecycleCode, getRequestStatus } from "./request-machine.ts";

afterEach(() => {
  setPrototypeNowIso(null);
});

const req2 = SEED_REQUESTS.find((item) => item.id === "req-2");
assert.ok(req2);

test("before response deadline a matching contractor can submit a proposal", () => {
  setPrototypeNowIso("2026-03-14");
  const status = getRequestStatus(req2, DEMO_USERS.contractor, SEED_RESPONSES, SEED_DEALS);
  assert.equal(getRequestLifecycleCode(req2, SEED_RESPONSES, SEED_DEALS), "collecting_proposals");
  assert.equal(status.allowedActions.includes("submit_proposal"), true);
  assert.equal(
    canPerformRequestAction(req2, DEMO_USERS.contractor, "submit_proposal", SEED_RESPONSES, SEED_DEALS)
      .allowed,
    true
  );
});

test("exactly on the response deadline a proposal can still be submitted", () => {
  setPrototypeNowIso("2026-03-15T12:00:00.000Z");
  assert.equal(
    canPerformRequestAction(req2, DEMO_USERS.contractor, "submit_proposal", SEED_RESPONSES, SEED_DEALS)
      .allowed,
    true
  );
});

test("after the response deadline submit is blocked and only recovery remains", () => {
  setPrototypeNowIso("2026-09-23");
  const status = getRequestStatus(req2, DEMO_USERS.contractor, SEED_RESPONSES, SEED_DEALS);
  assert.equal(status.code, "expired");
  assert.equal(status.allowedActions.includes("submit_proposal"), false);
  assert.match(status.blockedReason ?? "", /истёк/);

  const owner = getRequestStatus(req2, DEMO_USERS.customer, SEED_RESPONSES, SEED_DEALS);
  assert.deepEqual(owner.recoveryActions, ["extend_deadline", "copy_request", "archive"]);
  assert.equal(
    canPerformRequestAction(req2, DEMO_USERS.customer, "extend_deadline", SEED_RESPONSES, SEED_DEALS)
      .allowed,
    true
  );
});

test("past pending booking cannot be confirmed", () => {
  const booking = SEED_BOOKINGS.find((item) => item.id === "book-2");
  assert.ok(booking);
  setPrototypeNowIso("2026-09-23");
  const denied = canTransitionBooking(booking, DEMO_USERS.venue, "confirmed");
  assert.equal(denied.allowed, false);
  assert.match(denied.reason, /завершён|нельзя/i);

  const rejectWithoutReason = canTransitionBooking(booking, DEMO_USERS.venue, "rejected");
  assert.equal(rejectWithoutReason.allowed, false);

  const rejectWithReason = canTransitionBooking(booking, DEMO_USERS.venue, "rejected", {
    rejectReason: "Период бронирования уже прошёл",
  });
  assert.equal(rejectWithReason.allowed, true);
});

test("forbidden deal transition is rejected; legal payout path stays open", () => {
  const deal = SEED_DEALS.find((item) => item.id === "deal-1");
  assert.ok(deal);
  assert.equal(deal.status, "in_progress");
  assert.equal(canTransitionDeal(deal, DEMO_USERS.customer, "completed").allowed, false);
  assert.equal(canTransitionDeal(deal, DEMO_USERS.contractor, "stage_review").allowed, true);

  const customerView = getDealStatus(deal, DEMO_USERS.customer);
  assert.equal(customerView.label, "В работе");
  assert.equal(customerView.allowedActions.includes("open_dispute"), true);
});

test("pending proposal expires after validUntil", () => {
  const proposal = {
    ...SEED_RESPONSES[0],
    status: "pending" as const,
    validUntil: "2026-03-01",
  };
  setPrototypeNowIso("2026-03-01");
  assert.equal(getProposalLifecycleCode(proposal), "submitted");
  setPrototypeNowIso("2026-03-02");
  assert.equal(getProposalLifecycleCode(proposal), "expired");
});
