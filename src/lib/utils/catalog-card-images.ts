import type { CatalogCardSlide } from "@/components/catalog/catalog-card-image-slider";
import { HOME_IMAGES, pickHomeImage } from "@/constants/home-images";
import type { Event, Service } from "@/data/types";
import type { PublicVenue } from "@/constants/venues";

const SLIDES_PER_CARD = 3;

function numericSeed(value: string, fallback: number): number {
  const parsed = Number.parseInt(value.replace(/\D/g, ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildSlidesFromPool(
  pool: readonly string[],
  idPrefix: string,
  title: string,
  baseOffset: number,
  count = SLIDES_PER_CARD,
): CatalogCardSlide[] {
  return Array.from({ length: count }, (_, offset) => ({
    id: `${idPrefix}-${offset}`,
    title,
    imageUrl: pickHomeImage(pool, baseOffset + offset),
  }));
}

export function getContractorCardSlides(
  contractorId: string,
  title: string,
  cardIndex: number,
): CatalogCardSlide[] {
  const baseOffset = (numericSeed(contractorId, cardIndex + 1) - 1) * SLIDES_PER_CARD;
  return buildSlidesFromPool(HOME_IMAGES.stand, contractorId, title, baseOffset);
}

export function getServiceCardSlides(service: Service, cardIndex: number): CatalogCardSlide[] {
  const fromPhotos =
    service.photoCards
      ?.filter((card) => card.imageUrl)
      .map((card) => ({
        id: card.id,
        title: card.title || service.title,
        imageUrl: card.imageUrl,
      })) ?? [];

  if (fromPhotos.length > 0) {
    return fromPhotos;
  }

  const baseOffset = (numericSeed(service.id, cardIndex + 1) - 1) * SLIDES_PER_CARD;
  return buildSlidesFromPool(HOME_IMAGES.construction, service.id, service.title, baseOffset);
}

export function getEventCardSlides(event: Event, cardIndex: number): CatalogCardSlide[] {
  const baseOffset = (numericSeed(event.id, cardIndex + 1) - 1) * SLIDES_PER_CARD;
  return buildSlidesFromPool(HOME_IMAGES.events, event.id, event.title, baseOffset);
}

export function getVenueCardSlides(venue: PublicVenue, cardIndex: number): CatalogCardSlide[] {
  const baseOffset = (numericSeed(venue.id, cardIndex + 1) - 1) * SLIDES_PER_CARD;
  const slides = buildSlidesFromPool(HOME_IMAGES.venue, venue.id, venue.name, baseOffset);
  slides[0] = { ...slides[0], imageUrl: venue.imageUrl };
  return slides;
}
