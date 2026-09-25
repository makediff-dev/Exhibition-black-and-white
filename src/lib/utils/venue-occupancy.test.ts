import assert from "node:assert/strict";
import { test } from "node:test";
import { SEED_BOOKINGS, SEED_HALLS } from "../../data/mocks/seed.ts";
import { formatVenuePriceRange } from "./venue-price.ts";
import { getPrototypeMonthRange, getVenueOccupancyBreakdown } from "./venue-occupancy.ts";

test("September occupancy for venue-1 uses MedExpo 3200 sqm and is not zero", () => {
  const period = getPrototypeMonthRange("2026-09-24T12:00:00+03:00");
  const occupancy = getVenueOccupancyBreakdown(
    "venue-1",
    SEED_HALLS,
    SEED_BOOKINGS,
    period.start,
    period.end
  );

  assert.equal(period.start, "2026-09-01");
  assert.equal(period.end, "2026-09-30");
  assert.equal(occupancy.totalArea, 8000);
  assert.equal(occupancy.availableAreaDays, 8000 * 30);
  assert.equal(occupancy.bookedAreaDays, 3200 * 3);
  assert.ok(occupancy.percent > 0);
  assert.equal(occupancy.occupiedArea + occupancy.freeArea, occupancy.totalArea);
  assert.ok(occupancy.preliminaryPercent > 0);
});

test("cancelled and rejected bookings do not add inventory occupancy", () => {
  const occupancy = getVenueOccupancyBreakdown(
    "venue-1",
    SEED_HALLS,
    SEED_BOOKINGS.filter((item) => item.id === "book-14" || item.id === "book-15"),
    "2026-09-08",
    "2026-09-11"
  );
  assert.equal(occupancy.bookedAreaDays, 0);
  assert.equal(occupancy.percent, 0);
});

test("unknown hall price is shown as request, not an empty string", () => {
  assert.equal(formatVenuePriceRange(0, 0), "Цена по запросу");
});
