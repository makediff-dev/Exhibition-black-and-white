"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Star } from "lucide-react";
import { ServiceCard } from "@/components/catalog/service-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { VENUE_CATALOG, getPublicVenueByCatalogId } from "@/constants/venues";
import { SEED_CONTRACTORS, SEED_EVENTS } from "@/data/mocks/seed";
import type { Contractor, Event, Service } from "@/data/types";
import { useCartStore, useFavoritesStore, usePrototypeStore } from "@/lib/store";
import { getContractorProfileHref } from "@/lib/utils/contractor-profile-links";
import { formatShortDate } from "@/lib/utils/formatters";
import { useToast } from "@/components/ui/toast-provider";

const EVENT_CATEGORY_LABELS: Record<Event["category"], string> = {
  exhibition: "Выставка",
  forum: "Форум",
  conference: "Конференция",
};

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
    catalogHref: "/events",
    emptyDescription:
      "Добавляйте площадки в избранное из каталога — нажмите на сердечко на карточке площадки",
    actionLabel: "Перейти к площадкам",
  },
] as const;

function FavoriteEventCard({ event }: { event: Event }) {
  return (
    <Link href={`/events/${event.id}`}>
      <Card hoverable className="h-full">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge variant="outline">{EVENT_CATEGORY_LABELS[event.category]}</Badge>
        </div>
        <CardTitle className="text-base leading-snug">{event.title}</CardTitle>
        <CardDescription className="flex items-center gap-1 mt-2">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {event.city} · {event.venue}
        </CardDescription>
        <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {formatShortDate(event.startDate)} — {formatShortDate(event.endDate)}
        </p>
      </Card>
    </Link>
  );
}

function FavoriteContractorCard({ contractor }: { contractor: Contractor }) {
  return (
    <Link href={getContractorProfileHref(contractor.id, { role: "customer" })}>
      <Card hoverable className="h-full">
        <CardTitle className="text-base leading-snug">{contractor.name}</CardTitle>
        <CardDescription>
          {contractor.city} · {contractor.geography}
        </CardDescription>
        <p className="text-sm text-gray-700 mt-2 line-clamp-2">{contractor.description}</p>
        <p className="text-xs text-gray-600 mt-3 flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-gray-900" />
          {contractor.rating} · {contractor.reviewCount} отзывов
        </p>
      </Card>
    </Link>
  );
}

function FavoriteVenueCard({ venueId }: { venueId: string }) {
  const venue = VENUE_CATALOG.find((item) => item.id === venueId);
  if (!venue) return null;

  const publicVenue = getPublicVenueByCatalogId(venueId);
  const href = publicVenue ? `/venues/${publicVenue.id}` : `/venues`;

  return (
    <Link href={href}>
      <Card hoverable className="h-full">
        <CardTitle className="text-base leading-snug">{venue.shortName}</CardTitle>
        <CardDescription className="flex items-center gap-1 mt-2">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {venue.city}
        </CardDescription>
        <p className="text-sm text-gray-700 mt-2 line-clamp-3">{venue.description}</p>
        <p className="text-xs text-gray-600 mt-3">{venue.address}</p>
      </Card>
    </Link>
  );
}

export function CustomerFavoritesSection() {
  const router = useRouter();
  const { showToast } = useToast();
  const services = usePrototypeStore((state) => state.services);
  const addItem = useCartStore((state) => state.addItem);
  const favoriteServiceIds = useFavoritesStore((state) => state.serviceIds);
  const favoriteEventIds = useFavoritesStore((state) => state.eventIds ?? []);
  const favoriteContractorIds = useFavoritesStore((state) => state.contractorIds ?? []);
  const favoriteVenueIds = useFavoritesStore((state) => state.venueIds ?? []);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const isFavorite = useFavoritesStore((state) => state.isFavorite);

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

  const handleToggleFavorite = (service: Service) => {
    const added = toggleFavorite(service.id);
    showToast(
      added ? `«${service.title}» добавлено в избранное` : `«${service.title}» удалено из избранного`,
      added ? "success" : "info",
    );
  };

  const handleAddToCart = (service: Service) => {
    addItem({ serviceId: service.id, quantity: 1, comment: "", files: [] });
    showToast(`«${service.title}» добавлено в корзину`, "success");
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
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {section.key === "services" &&
                  favoriteServices.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      from="favorites"
                      isFavorite={isFavorite(service.id)}
                      onToggleFavorite={() => handleToggleFavorite(service)}
                      onAdd={() => handleAddToCart(service)}
                    />
                  ))}

                {section.key === "events" &&
                  favoriteEvents.map((event) => <FavoriteEventCard key={event.id} event={event} />)}

                {section.key === "contractors" &&
                  favoriteContractors.map((contractor) => (
                    <FavoriteContractorCard key={contractor.id} contractor={contractor} />
                  ))}

                {section.key === "venues" &&
                  favoriteVenues.map((venueId) => <FavoriteVenueCard key={venueId} venueId={venueId} />)}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}