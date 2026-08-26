import {
  SEED_HALLS,
  SEED_PAVILIONS,
  SEED_VENUE_PROFILE_MEDIA,
  SEED_VENUE_SPACE_BLOCKS,
} from "@/data/mocks/seed";

export function getVenueStats(venueId: string) {
  const halls = SEED_HALLS.filter((hall) => hall.venueId === venueId);
  const pavilions = SEED_PAVILIONS.filter((pavilion) => pavilion.venueId === venueId);
  const blocks = SEED_VENUE_SPACE_BLOCKS.filter((block) => block.venueId === venueId);
  const photos = SEED_VENUE_PROFILE_MEDIA.filter(
    (item) => item.venueId === venueId && item.type === "photo",
  );
  const prices = blocks.length
    ? blocks.map((block) => block.pricePerSqm)
    : halls.map((hall) => Math.round(1800 + hall.area / 10));

  return {
    halls,
    pavilions,
    photos,
    totalArea: halls.reduce((sum, hall) => sum + hall.area, 0),
    priceMin: prices.length ? Math.min(...prices) : 0,
    priceMax: prices.length ? Math.max(...prices) : 0,
    freeHalls: halls.filter((hall) => hall.available).length,
  };
}
