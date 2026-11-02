"use client";

import { useRouter } from "next/navigation";
import { CabinetHomeTile } from "@/components/account/cabinet-home-tile";
import { EmptyState } from "@/components/ui/states";
import { HOME_IMAGES, pickHomeImages } from "@/constants/home-images";
import { VENUE_CATALOG, getPublicVenueByCatalogId } from "@/constants/venues";
import { SEED_CONTRACTORS, SEED_EVENTS } from "@/data/mocks/seed";
import type { Contractor, Event, Service } from "@/data/types";
import { useCabinetSession } from "@/lib/hooks/use-cabinet-session";
import { useFavoritesStore, usePrototypeStore } from "@/lib/store";
import { getContractorProfileHref } from "@/lib/utils/contractor-profile-links";
import { formatReviewCount, formatServicePrice, formatShortDate } from "@/lib/utils/formatters";
import { withFromParam } from "@/lib/utils/message-related-links";

const FAVORITE_SECTIONS = [
  {
    key: "services",
    label: "Услуги",
    catalogHref: "/services",
    emptyDescription:
      "Добавляйте услуги в избранное из каталога — нажмите на сердечко на карточке услуги",
    actionLabel: "Перейти к услугам",
  },
  {
    key: "events",
    label: "Мероприятия",
    catalogHref: "/events",
    emptyDescription:
      "Добавляйте мероприятия в избранное из каталога — нажмите на сердечко на карточке мероприятия",
    actionLabel: "Перейти к мероприятиям",
  },
  {
    key: "contractors",
    label: "Исполнители",
    catalogHref: "/contractors",
    emptyDescription:
      "Добавляйте исполнителей в избранное из каталога — нажмите на сердечко на карточке исполнителя",
    actionLabel: "Перейти к исполнителям",
  },
  {
    key: "venues",
    label: "Площадки",
    catalogHref: "/venues",
    emptyDescription:
      "Добавляйте площадки в избранное из каталога — нажмите на сердечко на карточке площадки",
    actionLabel: "Перейти к площадкам",
  },
] as const;

export function CustomerFavoritesSection() {
  const router = useRouter();
  const { accountRole } = useCabinetSession();
  const services = usePrototypeStore((state) => state.services);
  const favoriteServiceIds = useFavoritesStore((state) => state.serviceIds);
  const favoriteEventIds = useFavoritesStore((state) => state.eventIds ?? []);
  const favoriteContractorIds = useFavoritesStore((state) => state.contractorIds ?? []);
  const favoriteVenueIds = useFavoritesStore((state) => state.venueIds ?? []);

  const favoriteServices = (favoriteServiceIds.length > 0 ? favoriteServiceIds : ["svc-2"])
    .map((id) => services.find((service) => service.id === id))
    .filter((service): service is Service => Boolean(service));

  const favoriteEvents = (favoriteEventIds.length > 0 ? favoriteEventIds : ["evt-1"])
    .map((id) => SEED_EVENTS.find((event) => event.id === id))
    .filter((event): event is Event => Boolean(event));

  const favoriteContractors = favoriteContractorIds
    .map((id) => SEED_CONTRACTORS.find((contractor) => contractor.id === id))
    .filter((contractor): contractor is Contractor => Boolean(contractor));

  const favoriteVenues = favoriteVenueIds.filter((id) => VENUE_CATALOG.some((venue) => venue.id === id));

  const sectionItems = {
    services: favoriteServices,
    events: favoriteEvents,
    contractors: favoriteContractors,
    venues: favoriteVenues,
  };

  return (
    <div className="space-y-10">
      {FAVORITE_SECTIONS.map((section) => {
        const items = sectionItems[section.key];

        return (
          <section key={section.key}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{section.label}</h2>

            {items.length === 0 ? (
              <EmptyState
                title="Избранное пусто"
                description={section.emptyDescription}
                actionLabel={section.actionLabel}
                onAction={() => router.push(section.catalogHref)}
              />
            ) : (
              <div className="catalog-cards-grid">
                {section.key === "services" &&
                  favoriteServices.map((service, index) => (
                    <CabinetHomeTile
                      key={service.id}
                      title={service.title}
                      imageUrls={pickHomeImages(HOME_IMAGES.stand, index)}
                      imageAlt={service.title}
                      meta={[
                        { label: "Исполнитель", value: service.contractorName },
                        { label: "Цена", value: formatServicePrice(service) },
                      ]}
                      buttonLabel="Подробнее"
                      buttonHref={withFromParam(`/services/${service.id}`, "favorites")}
                    />
                  ))}

                {section.key === "events" &&
                  favoriteEvents.map((event, index) => (
                    <CabinetHomeTile
                      key={event.id}
                      title={event.title}
                      imageUrls={pickHomeImages(HOME_IMAGES.events, index)}
                      imageAlt="Фотография выставочного мероприятия"
                      meta={[
                        { label: "Место", value: event.city },
                        {
                          label: "Срок",
                          value: `${formatShortDate(event.startDate)} — ${formatShortDate(event.endDate)}`,
                        },
                      ]}
                      buttonLabel="Откликнуться"
                      buttonHref={withFromParam(`/events/${event.id}`, "favorites")}
                    />
                  ))}

                {section.key === "contractors" &&
                  favoriteContractors.map((contractor, index) => (
                    <CabinetHomeTile
                      key={contractor.id}
                      title={contractor.name}
                      imageUrls={pickHomeImages(HOME_IMAGES.stand, index)}
                      imageAlt="Фотография стенда исполнителя"
                      meta={[
                        { label: "Город", value: contractor.city },
                        {
                          label: "Рейтинг",
                          value: `★ ${contractor.rating} · ${formatReviewCount(contractor.reviewCount)}`,
                        },
                      ]}
                      buttonLabel="Подробнее"
                      buttonHref={getContractorProfileHref(contractor.id, {
                        role: accountRole ?? "customer",
                        from: "favorites",
                      })}
                    />
                  ))}

                {section.key === "venues" &&
                  favoriteVenues.map((venueId, index) => {
                    const venue = VENUE_CATALOG.find((item) => item.id === venueId);
                    if (!venue) return null;
                    const publicVenue = getPublicVenueByCatalogId(venueId);
                    return (
                      <CabinetHomeTile
                        key={venueId}
                        title={venue.shortName}
                        imageUrls={pickHomeImages(HOME_IMAGES.venue, index)}
                        imageAlt={venue.shortName}
                        meta={[
                          { label: "Место", value: venue.city },
                          { label: "Адрес", value: venue.address },
                        ]}
                        buttonLabel="Подробнее"
                        buttonHref={withFromParam(
                          publicVenue ? `/venues/${publicVenue.id}` : "/venues",
                          "favorites",
                        )}
                      />
                    );
                  })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
