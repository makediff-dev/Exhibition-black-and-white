"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Star } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ServiceCard } from "@/components/catalog/service-card";
import { SEED_CONTRACTORS } from "@/data/mocks/seed";
import type { CompanyProfile } from "@/data/types";
import { usePrototypeStore } from "@/lib/store";
import { getContractorProfileHref } from "@/lib/utils/contractor-profile-links";

function RecommendedContractorCard({
  contractor,
}: {
  contractor: (typeof SEED_CONTRACTORS)[number];
}) {
  return (
    <Link href={getContractorProfileHref(contractor.id, { role: "customer" })}>
      <Card className="h-full hover:border-gray-900">
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

interface Props {
  user: CompanyProfile | null;
}

export function CustomerDashboardRecommendations({ user }: Props) {
  const services = usePrototypeStore((state) => state.services);

  const recommendedContractors = useMemo(() => {
    const userCategories = new Set(user?.categories ?? []);
    const matched = SEED_CONTRACTORS.filter((contractor) =>
      contractor.categories.some((category) => userCategories.has(category)),
    ).sort((a, b) => b.rating - a.rating);

    const list = (matched.length > 0 ? matched : [...SEED_CONTRACTORS].sort((a, b) => b.rating - a.rating)).slice(
      0,
      4,
    );
    return list;
  }, [user]);

  const recommendedServices = useMemo(() => {
    const userCategories = new Set(user?.categories ?? []);
    const matched = services
      .filter((service) => userCategories.has(service.category))
      .sort((a, b) => b.rating - a.rating);

    const list = (matched.length > 0 ? matched : [...services].sort((a, b) => b.rating - a.rating)).slice(0, 4);
    return list;
  }, [services, user]);

  return (
    <div className="space-y-8 mt-8">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold">Рекомендованные исполнители</h2>
          <Link href="/contractors" className="text-sm underline">
            Все исполнители
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {recommendedContractors.map((contractor) => (
            <RecommendedContractorCard key={contractor.id} contractor={contractor} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold">Рекомендованные услуги</h2>
          <Link href="/services" className="text-sm underline">
            Все услуги
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {recommendedServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>
    </div>
  );
}
