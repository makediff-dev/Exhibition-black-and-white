import assert from "node:assert/strict";
import { test } from "node:test";
import { SEED_EVENTS, SEED_FLOOR_CELLS, SEED_HALLS } from "../../data/mocks/seed.ts";
import { canBookEvent } from "../state/event-machine.ts";
import { buildEventStandQuote, canSubmitEventStandQuote } from "./booking-quote.ts";

test("A2 on a future event shows a complete priced subject and a live CTA", () => {
  const event = SEED_EVENTS.find((item) => item.id === "evt-8");
  const cell = SEED_FLOOR_CELLS.find((item) => item.label === "A2" && item.hallId === "hall-3");
  const hall = SEED_HALLS.find((item) => item.id === "hall-3");
  assert.ok(event && cell && hall);
  assert.equal(canBookEvent(event), true);

  const quote = buildEventStandQuote(event, cell, hall, []);
  assert.equal(quote.label, "A2");
  assert.ok(quote.planLocation);
  assert.equal(quote.areaSqm, 36);
  assert.equal(quote.totalPrice, 36 * 3200);
  assert.ok(quote.taxNote.includes("НДС"));
  assert.ok(quote.powerKw);
  assert.ok(quote.holdUntil);
  assert.ok(quote.cancellationTerms);
  assert.ok(quote.confirmActor);
  assert.ok(quote.afterSubmit);
  assert.equal(canSubmitEventStandQuote(quote), true);
});

test("completed evt-1 cannot be booked even when A2 is selected", () => {
  const event = SEED_EVENTS.find((item) => item.id === "evt-1");
  const cell = SEED_FLOOR_CELLS.find((item) => item.id === "cell-2");
  const hall = SEED_HALLS.find((item) => item.id === "hall-1");
  assert.ok(event && cell && hall);
  assert.equal(canBookEvent(event), false);

  const quote = buildEventStandQuote(event, cell, hall, []);
  assert.equal(canSubmitEventStandQuote(quote), false);
  assert.ok(quote.blockedReason);
});

test("occupied or unpriced stands block the booking CTA", () => {
  const event = SEED_EVENTS.find((item) => item.id === "evt-8");
  const cell = SEED_FLOOR_CELLS.find((item) => item.label === "A2" && item.hallId === "hall-3");
  const hall = SEED_HALLS.find((item) => item.id === "hall-3");
  assert.ok(event && cell && hall);

  const occupied = buildEventStandQuote(event, { ...cell, status: "booked" }, hall, []);
  assert.equal(canSubmitEventStandQuote(occupied), false);

  const noPrice = buildEventStandQuote(event, { ...cell, pricePerSqm: undefined }, hall, []);
  assert.equal(canSubmitEventStandQuote(noPrice), false);
});
