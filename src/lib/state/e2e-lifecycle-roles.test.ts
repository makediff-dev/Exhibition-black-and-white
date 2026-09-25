import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  DEMO_USERS,
  SEED_BOOKINGS,
  SEED_DEALS,
  SEED_EVENTS,
  SEED_EVENT_ORDERS,
  SEED_PAYMENTS,
  SEED_REQUESTS,
  SEED_RESPONSES,
} from "../../data/mocks/seed.ts";
import { isRequestVisibleToContractor } from "../auth/authorization.ts";
import { getEventOrderLifecycleCode, getOrderNextStep } from "../utils/order-presentation.ts";
import { setPrototypeNowIso } from "../time/now.ts";
import { getBookingStatus } from "./booking-machine.ts";
import { getDealStatus } from "./deal-machine.ts";
import { canBookEvent, getEventStatus } from "./event-machine.ts";
import { countDashboardRequests, requestListTab } from "./lifecycle-metrics.ts";
import { getPaymentStatus } from "./payment-machine.ts";
import { getRequestStatus } from "./request-machine.ts";

afterEach(() => {
  setPrototypeNowIso(null);
});

test("four roles see the same derived codes for the Package 1 fixtures", () => {
  const evt1 = SEED_EVENTS.find((item) => item.id === "evt-1");
  const req2 = SEED_REQUESTS.find((item) => item.id === "req-2");
  const book2 = SEED_BOOKINGS.find((item) => item.id === "book-2");
  const deal1 = SEED_DEALS.find((item) => item.id === "deal-1");
  const pay4 = SEED_PAYMENTS.find((item) => item.id === "pay-4");
  assert.ok(evt1 && req2 && book2 && deal1 && pay4);

  for (const role of ["customer", "contractor", "venue", "organizer"] as const) {
    assert.equal(getEventStatus(evt1).code, "completed");
    assert.equal(canBookEvent(evt1), false);
    assert.equal(getRequestStatus(req2, DEMO_USERS[role], SEED_RESPONSES, SEED_DEALS).code, "expired");
    assert.equal(getBookingStatus(book2, DEMO_USERS[role]).code, "expired");
    assert.equal(getDealStatus(deal1, DEMO_USERS[role]).code, "overdue");
    assert.equal(getPaymentStatus(pay4, DEMO_USERS[role]).code, "overdue");
  }

  assert.equal(requestListTab(req2, SEED_RESPONSES, SEED_DEALS), "expired");
  assert.equal(isRequestVisibleToContractor(req2, DEMO_USERS.contractor, SEED_RESPONSES, SEED_DEALS), false);
  assert.equal(
    countDashboardRequests(SEED_REQUESTS, SEED_RESPONSES, SEED_DEALS, DEMO_USERS.contractor) >= 0,
    true
  );

  const pastOrder = SEED_EVENT_ORDERS.find((order) => order.eventId === "evt-1");
  if (pastOrder) {
    const code = getEventOrderLifecycleCode(pastOrder, evt1);
    assert.ok(code === "completed" || code === "overdue" || code === pastOrder.status);
    assert.ok(getOrderNextStep(pastOrder, "venue", evt1).length > 0);
  }
});
