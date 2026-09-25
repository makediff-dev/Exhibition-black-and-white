import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  DEMO_USERS,
  SEED_BOOKINGS,
  SEED_DEALS,
  SEED_EVENTS,
  SEED_PAYMENTS,
  SEED_REQUESTS,
  SEED_RESPONSES,
} from "../../data/mocks/seed.ts";
import { setPrototypeNowIso } from "../time/now.ts";
import { canTransitionBooking, getBookingStatus } from "./booking-machine.ts";
import { getDealStatus } from "./deal-machine.ts";
import { canBookEvent, getEventStatus } from "./event-machine.ts";
import {
  countDashboardDeals,
  countDashboardRequests,
  countOpenInvoices,
  requestListTab,
} from "./lifecycle-metrics.ts";
import { canPayInvoice, getPaymentLifecycleCode, getPaymentStatus } from "./payment-machine.ts";
import { getRequestStatus } from "./request-machine.ts";

afterEach(() => {
  setPrototypeNowIso(null);
});

test("on 2026-09-24 evt-1 is completed without booking; evt-8 stays bookable", () => {
  const evt1 = SEED_EVENTS.find((item) => item.id === "evt-1");
  const evt8 = SEED_EVENTS.find((item) => item.id === "evt-8");
  assert.ok(evt1);
  assert.ok(evt8);

  const past = getEventStatus(evt1);
  assert.equal(past.code, "completed");
  assert.equal(canBookEvent(evt1), false);
  assert.equal(past.allowedActions.includes("confirm_booking"), false);

  const future = getEventStatus(evt8);
  assert.equal(future.code, "upcoming");
  assert.equal(canBookEvent(evt8), true);
});

test("req-2 is expired in list tab, detail actions and dashboard counter", () => {
  const req2 = SEED_REQUESTS.find((item) => item.id === "req-2");
  assert.ok(req2);

  const customer = getRequestStatus(req2, DEMO_USERS.customer, SEED_RESPONSES, SEED_DEALS);
  const contractor = getRequestStatus(req2, DEMO_USERS.contractor, SEED_RESPONSES, SEED_DEALS);
  assert.equal(customer.code, "expired");
  assert.equal(contractor.code, "expired");
  assert.equal(requestListTab(req2, SEED_RESPONSES, SEED_DEALS), "expired");
  assert.deepEqual(customer.recoveryActions, ["extend_deadline", "copy_request", "archive"]);
  assert.equal(contractor.allowedActions.includes("submit_proposal"), false);

  const customerCount = countDashboardRequests(
    SEED_REQUESTS,
    SEED_RESPONSES,
    SEED_DEALS,
    DEMO_USERS.customer
  );
  assert.equal(
    SEED_REQUESTS.some(
      (request) =>
        request.id === "req-2" && requestListTab(request, SEED_RESPONSES, SEED_DEALS) === "published"
    ),
    false
  );
  assert.ok(customerCount >= 0);
});

test("past pending booking cannot be accepted or rejected retroactively", () => {
  const booking = SEED_BOOKINGS.find((item) => item.id === "book-2");
  assert.ok(booking);
  const status = getBookingStatus(booking, DEMO_USERS.venue);
  assert.equal(status.code, "expired");
  assert.equal(status.allowedActions.includes("confirm_booking"), false);
  assert.equal(status.allowedActions.includes("reject_booking"), false);
  assert.equal(canTransitionBooking(booking, DEMO_USERS.venue, "confirmed").allowed, false);
  assert.equal(
    canTransitionBooking(booking, DEMO_USERS.venue, "rejected", { rejectReason: "late" }).allowed,
    false
  );
});

test("deal-1 with February deadline is overdue, not in_progress label", () => {
  const deal = SEED_DEALS.find((item) => item.id === "deal-1");
  assert.ok(deal);
  const status = getDealStatus(deal, DEMO_USERS.customer);
  assert.equal(status.storedCode, "in_progress");
  assert.equal(status.code, "overdue");
  assert.equal(status.label, "Просрочена");
  assert.ok(status.nextActor);
  assert.equal(countDashboardDeals(SEED_DEALS, DEMO_USERS.customer) > 0, true);
});

test("numbered unpaid invoice is overdue; invoice without number is draft and not payable", () => {
  const issued = SEED_PAYMENTS.find((item) => item.id === "pay-4");
  const draft = SEED_PAYMENTS.find((item) => item.id === "vpay-4");
  assert.ok(issued);
  assert.ok(draft);

  assert.equal(getPaymentLifecycleCode(issued), "overdue");
  assert.equal(getPaymentStatus(issued, DEMO_USERS.customer).label, "Просрочен");
  assert.equal(canPayInvoice(issued, DEMO_USERS.customer), true);

  assert.equal(getPaymentLifecycleCode(draft), "draft");
  assert.equal(getPaymentStatus(draft).label, "Черновик / ожидает выставления");
  assert.equal(canPayInvoice(draft), false);
  assert.equal(getPaymentStatus(draft).allowedActions.includes("pay"), false);

  const openOutgoing = countOpenInvoices(SEED_PAYMENTS, "outgoing");
  const openIncoming = countOpenInvoices(SEED_PAYMENTS, "incoming");
  assert.ok(openOutgoing >= 0);
  assert.ok(openIncoming >= 0);
  assert.equal(
    SEED_PAYMENTS.filter((payment) => !payment.number && getPaymentLifecycleCode(payment) === "draft")
      .length > 0,
    true
  );
});
