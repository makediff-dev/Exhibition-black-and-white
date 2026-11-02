"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CabinetHomeTile } from "@/components/account/cabinet-home-tile";
import { HOME_IMAGES, pickHomeImages } from "@/constants/home-images";
import { SEED_CONTRACTORS } from "@/data/mocks/seed";
import type { CompanyProfile } from "@/data/types";
import { usePrototypeStore } from "@/lib/store";
import { getContractorProfileHref } from "@/lib/utils/contractor-profile-links";
import { formatReviewCount, formatServicePrice } from "@/lib/utils/formatters";
import { withFromParam } from "@/lib/utils/message-related-links";

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
      5,
    );
    return list;
  }, [user]);

  const recommendedServices = useMemo(() => {
    const userCategories = new Set(user?.categories ?? []);
    const matched = services
      .filter((service) => userCategories.has(service.category))
      .sort((a, b) => b.rating - a.rating);

    const list = (matched.length > 0 ? matched : [...services].sort((a, b) => b.rating - a.rating)).slice(0, 5);
    return list;
  }, [services, user]);

  return (
    <div className="space-y-8 mt-8">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold">Рекомендованные исполнители</h2>
          <Link href="/contractors" className="cabinet-section-link text-sm">
            Все исполнители
          </Link>
        </div>
        <div className="catalog-cards-grid">
          {recommendedContractors.map((contractor, index) => (
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
              buttonHref={getContractorProfileHref(contractor.id, { role: "customer", from: "dashboard" })}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold">Рекомендованные услуги</h2>
          <Link href="/services" className="cabinet-section-link text-sm">
            Все услуги
          </Link>
        </div>
        <div className="catalog-cards-grid">
          {recommendedServices.map((service, index) => (
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
    </div>
  );
}
