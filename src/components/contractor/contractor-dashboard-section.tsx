"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CabinetHomeTile } from "@/components/account/cabinet-home-tile";
import { HOME_IMAGES, pickHomeImages } from "@/constants/home-images";
import { SEED_EVENTS } from "@/data/mocks/seed";
import type { CompanyProfile } from "@/data/types";
import { usePrototypeStore } from "@/lib/store";
import { getContractorIdForUser } from "@/lib/utils/user-entity-map";
import { formatServicePrice, formatShortDate } from "@/lib/utils/formatters";
import { withFromParam } from "@/lib/utils/message-related-links";

interface Props {
  user: CompanyProfile | null;
}

export function ContractorDashboardSection({ user }: Props) {
  const services = usePrototypeStore((state) => state.services);
  const contractorId = getContractorIdForUser(user);

  const catalogServices = useMemo(() => {
    return services
      .filter((service) => service.contractorId !== contractorId)
      .sort((a, b) => b.rating - a.rating);
  }, [services, contractorId]);

  const upcomingEvents = useMemo(() => {
    const contractorCities = new Set(user?.cities ?? []);
    const sorted = [...SEED_EVENTS].sort((a, b) => a.startDate.localeCompare(b.startDate));
    const matched =
      contractorCities.size > 0
        ? sorted.filter((event) => contractorCities.has(event.city))
        : sorted;
    return (matched.length > 0 ? matched : sorted).slice(0, 6);
  }, [user]);

  return (
    <div className="space-y-8 mt-8">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold">Предложения на рынке</h2>
          <Link href="/services" className="cabinet-section-link text-sm">
            Все услуги
          </Link>
        </div>
        <div className="catalog-cards-grid">
          {catalogServices.map((service, index) => (
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
              buttonHref={withFromParam(`/services/${service.id}`, "dashboard")}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold">Мероприятия</h2>
          <Link href="/events" className="cabinet-section-link text-sm">
            Все мероприятия
          </Link>
        </div>
        <div className="catalog-cards-grid">
          {upcomingEvents.map((event, index) => (
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
              buttonHref={withFromParam(`/events/${event.id}`, "dashboard")}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
