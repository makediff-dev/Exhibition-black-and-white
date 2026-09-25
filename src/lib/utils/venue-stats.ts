import {
  SEED_BOOKINGS,
  SEED_HALLS,
  SEED_PAVILIONS,
  SEED_VENUE_PROFILE_MEDIA,
  SEED_VENUE_SPACE_BLOCKS,
} from "@/data/mocks/seed";
import {
  getPrototypeMonthRange,
  getVenueOccupancyBreakdown,
  VENUE_OCCUPANCY_EXPLANATION,
} from "./venue-occupancy";
import { formatVenuePriceRange } from "./venue-price";

export { formatVenuePriceRange };

export function getVenueStats(venueId: string) {
  const halls = SEED_HALLS.filter((hall) => hall.venueId === venueId);
  const pavilions = SEED_PAVILIONS.filter((pavilion) => pavilion.venueId === venueId);
  const blocks = SEED_VENUE_SPACE_BLOCKS.filter((block) => block.venueId === venueId);
  const photos = SEED_VENUE_PROFILE_MEDIA.filter(
    (item) => item.venueId === venueId && item.type === "photo",
  );
  const priced = blocks.map((block) => block.pricePerSqm).filter((price) => price > 0);
  const period = getPrototypeMonthRange();
  const occupancy = getVenueOccupancyBreakdown(
    venueId,
    halls,
    SEED_BOOKINGS,
    period.start,
    period.end
  );

  return {
    halls,
    pavilions,
    photos,
    totalArea: occupancy.totalArea,
    freeArea: occupancy.freeArea,
    occupiedArea: occupancy.occupiedArea,
    priceMin: priced.length ? Math.min(...priced) : 0,
    priceMax: priced.length ? Math.max(...priced) : 0,
    freeHalls: halls.filter((hall) => hall.available).length,
    occupancyPeriodStart: occupancy.periodStart,
    occupancyPeriodEnd: occupancy.periodEnd,
    occupancyPercent: occupancy.percent,
    preliminaryOccupancyPercent: occupancy.preliminaryPercent,
    occupancyExplanation: VENUE_OCCUPANCY_EXPLANATION,
  };
}
