"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ServiceCard } from "@/components/catalog/service-card";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { SEED_EVENTS } from "@/data/mocks/seed";
import type { CompanyProfile } from "@/data/types";
import { useCartStore, usePrototypeStore } from "@/lib/store";
import { getContractorIdForUser } from "@/lib/utils/user-entity-map";
import { formatShortDate } from "@/lib/utils/formatters";
import { withFromParam } from "@/lib/utils/message-related-links";
import { useToast } from "@/components/ui/toast-provider";

interface Props {
  user: CompanyProfile | null;
}

export function ContractorDashboardSection({ user }: Props) {
  const services = usePrototypeStore((state) => state.services);
  const addItem = useCartStore((state) => state.addItem);
  const { showToast } = useToast();

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

  const handleAddToCart = (serviceId: string) => {
    addItem({ serviceId, quantity: 1, comment: "", files: [] });
    showToast("Услуга добавлена в корзину", "success");
  };

  return (
    <div className="space-y-8 mt-8">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold">Услуги</h2>
          <Link href="/services" className="text-sm underline">
            Все услуги
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {catalogServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              from="dashboard"
              onAdd={() => handleAddToCart(service.id)}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold">Мероприятия</h2>
          <Link href="/events" className="text-sm underline">
            Все мероприятия
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.map((event) => (
            <Link key={event.id} href={withFromParam(`/events/${event.id}`, "dashboard")}>
              <Card hoverable className="h-full">
                <CardTitle className="text-base leading-snug">{event.title}</CardTitle>
                <CardDescription className="mt-2">
                  {event.venue}, {event.city}
                </CardDescription>
                <p className="text-sm text-gray-700 mt-3">{event.industry}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {formatShortDate(event.startDate)}
                  {event.endDate && event.endDate !== event.startDate
                    ? ` — ${formatShortDate(event.endDate)}`
                    : ""}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}