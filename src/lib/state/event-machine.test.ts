import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { SEED_EVENTS } from "../../data/mocks/seed.ts";
import { setPrototypeNowIso } from "../time/now.ts";
import {
  canBookEvent,
  getEventLifecycleCode,
  isEventUpcomingOrActive,
  listUpcomingEvents,
} from "./event-machine.ts";

afterEach(() => {
  setPrototypeNowIso(null);
});

const furniture = SEED_EVENTS.find((event) => event.id === "evt-1");
const autumn = SEED_EVENTS.find((event) => event.id === "evt-8");
assert.ok(furniture);
assert.ok(autumn);

test("audit date marks March events completed and October upcoming", () => {
  setPrototypeNowIso("2026-09-29T12:00:00+03:00");
  assert.equal(getEventLifecycleCode(furniture), "completed");
  assert.equal(canBookEvent(furniture), false);
  assert.equal(getEventLifecycleCode(autumn), "upcoming");
  assert.equal(listUpcomingEvents(SEED_EVENTS).every(isEventUpcomingOrActive), true);
  assert.equal(
    listUpcomingEvents(SEED_EVENTS).some((event) => event.id === "evt-1"),
    false
  );
});

test("changing prototype now updates lifecycle without editing fixtures", () => {
  setPrototypeNowIso("2026-03-16T12:00:00+03:00");
  assert.equal(getEventLifecycleCode(furniture), "active");
  setPrototypeNowIso("2026-03-10T12:00:00+03:00");
  assert.equal(getEventLifecycleCode(furniture), "upcoming");
});
