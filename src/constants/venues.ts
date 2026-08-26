import { HOME_MOSCOW_VENUES, HOME_RECOMMENDED_VENUES } from "./home-content";
import { HOME_IMAGES } from "./home-images";
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

export interface PublicVenue {
  id: string;
  name: string;
  city: string;
  halls: string;
  imageUrl: string;
  description: string;
  catalogId?: string;
  address?: string;
  legalName?: string;
}

const DEFAULT_VENUE_DESCRIPTION =
  "Площадка для проведения выставок, форумов и деловых мероприятий с инфраструктурой для экспонентов и организаторов.";

function buildPublicVenues(): PublicVenue[] {
  const venues = new Map<string, PublicVenue>();

  for (const item of [...HOME_RECOMMENDED_VENUES, ...HOME_MOSCOW_VENUES]) {
    if (venues.has(item.name)) continue;

    const catalog = VENUE_CATALOG.find((entry) => entry.shortName === item.name);

    venues.set(item.name, {
      id: item.id,
      name: item.name,
      city: item.city,
      halls: item.halls,
      imageUrl: item.imageUrl,
      description: catalog?.description ?? `${DEFAULT_VENUE_DESCRIPTION} Город: ${item.city}.`,
      catalogId: catalog?.id,
      address: catalog?.address,
      legalName: catalog?.legalName,
    });
  }

  for (const catalog of VENUE_CATALOG) {
    if (venues.has(catalog.shortName)) continue;

    venues.set(catalog.shortName, {
      id: catalog.id,
      name: catalog.shortName,
      city: catalog.city,
      halls: catalog.id === "venue-1" ? "8 павильонов" : "3 зала",
      imageUrl: HOME_IMAGES.venue[0],
      description: catalog.description,
      catalogId: catalog.id,
      address: catalog.address,
      legalName: catalog.legalName,
    });
  }

  return Array.from(venues.values());
}

export const PUBLIC_VENUES: PublicVenue[] = buildPublicVenues();

export function getVenueById(venueId: string) {
  return VENUE_CATALOG.find((venue) => venue.id === venueId);
}

export function getPublicVenueById(venueId: string) {
  return PUBLIC_VENUES.find((venue) => venue.id === venueId);
}

export function getPublicVenueByCatalogId(catalogId: string) {
  return PUBLIC_VENUES.find((venue) => venue.catalogId === catalogId || venue.id === catalogId);
}
