import { DEMO_USERS } from "@/data/mocks/seed";

export const VENUE_CATALOG = [
  {
    id: "venue-1",
    shortName: "ЭкспоЦентр",
    legalName: DEMO_USERS.venue.name,
    city: "Москва",
    address: DEMO_USERS.venue.address,
    description:
      "Крупнейший выставочный комплекс: павильоны, инфраструктура, логистика и медиамaterials от площадки.",
  },
  {
    id: "venue-2",
    shortName: "ЭкспоФорум",
    legalName: "АО «ЭкспоФорум»",
    city: "Санкт-Петербург",
    address: "г. Санкт-Петербург, пр. Обуховской Обороны, 90",
    description:
      "Конгрессно-выставочный центр для региональных и международных мероприятий.",
  },
] as const;

export type VenueCatalogItem = (typeof VENUE_CATALOG)[number];

export function getVenueById(venueId: string) {
  return VENUE_CATALOG.find((venue) => venue.id === venueId);
}
