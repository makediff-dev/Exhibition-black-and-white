import assert from "node:assert/strict";
import { test } from "node:test";
import {
  SEED_BOOKINGS,
  SEED_DOCUMENTS,
  SEED_EVENT_ORDERS,
  SEED_PAYMENTS,
} from "../../data/mocks/seed.ts";
import type { Payment } from "../../data/types/index.ts";
import { overlaySeedRecords, RETIRED_FIXTURE_IDS } from "../store/seed-overlay.ts";
import { getPrototypeNowIso, setPrototypeNowIso } from "../time/now.ts";
import { getConfirmedEventSchedule, getEventOrderHref } from "../utils/entity-links.ts";

test("passes and space rental do not share deal-1; stand build keeps the deal", () => {
  const passes = SEED_EVENT_ORDERS.find((item) => item.id === "eord-2");
  const rental = SEED_EVENT_ORDERS.find((item) => item.id === "eord-4");
  const stand = SEED_EVENT_ORDERS.find((item) => item.id === "eord-12");

  assert.ok(passes && rental && stand);
  assert.equal(passes.dealId, undefined);
  assert.equal(rental.dealId, undefined);
  assert.equal(stand.dealId, "deal-1");
  assert.equal(stand.type, "stand_build");

  assert.equal(getEventOrderHref(passes), "/orders/eord-2");
  assert.equal(getEventOrderHref(rental), "/orders/eord-4");
  assert.equal(getEventOrderHref(stand), "/deals/deal-1");
  assert.notEqual(getEventOrderHref(passes), getEventOrderHref(stand));
  assert.notEqual(getEventOrderHref(rental), getEventOrderHref(stand));
});

test("booking ids are unique and exhibitor cell booking stays book-5", () => {
  const ids = SEED_BOOKINGS.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);

  const exhibitorCell = SEED_BOOKINGS.find((item) => item.id === "book-5");
  const forumSetup = SEED_BOOKINGS.find((item) => item.id === "book-11");
  assert.equal(exhibitorCell?.eventId, "evt-1");
  assert.equal(exhibitorCell?.cellId, "cell-2");
  assert.equal(forumSetup?.eventId, "evt-3");
});

test("documents and payments point at a single canonical object", () => {
  for (const doc of SEED_DOCUMENTS) {
    if (doc.parties.includes("Площадка") || doc.parties.includes("Организатор")) {
      assert.notEqual(doc.dealId, "deal-1", `${doc.id} must not hang on stand deal`);
    }
  }

  const reserves = SEED_PAYMENTS.filter(
    (payment) => payment.type === "Резерв" && payment.amount === 520000
  );
  assert.equal(reserves.length, 1);
  assert.equal(reserves[0].id, "pay-1");
  assert.ok(!SEED_PAYMENTS.some((payment) => payment.id === "opay-7"));

  const paired = SEED_PAYMENTS.filter((payment) => payment.ledgerPairId === "pair-pav-1");
  assert.equal(paired.length, 2);
  assert.deepEqual(
    new Set(paired.map((payment) => payment.direction)),
    new Set(["incoming", "outgoing"])
  );
});

test("confirmed bookings are the schedule source of truth for evt-1", () => {
  const schedule = getConfirmedEventSchedule("evt-1", SEED_BOOKINGS);
  assert.equal(schedule.locked, true);
  assert.equal(schedule.venueId, "venue-1");
  assert.equal(schedule.startDate, "2026-03-15");
  assert.equal(schedule.endDate, "2026-03-18");
  assert.equal(schedule.dismantlingStart, "2026-03-19");
});

test("prototype clock is fixed and overridable", () => {
  assert.equal(getPrototypeNowIso(), "2026-09-23");
  setPrototypeNowIso("2026-03-01");
  assert.equal(getPrototypeNowIso(), "2026-03-01");
  setPrototypeNowIso(null);
  assert.equal(getPrototypeNowIso(), "2026-09-23");
});

test("persist overlay refreshes fixture relations and drops retired ids", () => {
  const storedPayments: Payment[] = [
    {
      id: "pay-1",
      dealId: "deal-1",
      type: "Резерв",
      amount: 1,
      status: "paid" as const,
      date: "2026-01-13",
      description: "stale",
    },
    {
      id: "opay-7",
      dealId: "deal-1",
      type: "Резерв",
      amount: 520000,
      status: "reserved" as const,
      date: "2026-01-13",
      description: "retired mirror",
    },
  ];

  const merged = overlaySeedRecords(storedPayments, SEED_PAYMENTS, ["status"]);
  const pay1 = merged.find((item) => item.id === "pay-1");
  assert.ok(pay1);
  assert.equal(pay1.number, "ПР-СД-001");
  assert.equal(pay1.amount, 520000);
  assert.equal(pay1.status, "paid");
  assert.ok(!merged.some((item) => item.id === "opay-7"));
  assert.ok(RETIRED_FIXTURE_IDS.has("opay-7"));
});
