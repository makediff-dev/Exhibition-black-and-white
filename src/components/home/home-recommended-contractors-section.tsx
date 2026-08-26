"use client";

import { useMemo } from "react";
import { SEED_CONTRACTORS } from "@/data/mocks/seed";
import { pickHomeImage, HOME_IMAGES } from "@/constants/home-images";
import { HomeScrollSection } from "./home-scroll-section";
import { HomeTileCard } from "./home-tile-card";

export function HomeRecommendedContractorsSection() {
  const contractors = useMemo(() => SEED_CONTRACTORS.slice(0, 5), []);

  return (
    <HomeScrollSection
      title="Рекомендованые исполнители услуг"
      linkHref="/requests"
      linkLabel="Смотреть все заказы"
    >
      {contractors.map((contractor, index) => (
        <HomeTileCard
          key={contractor.id}
          title={contractor.name}
          imageUrl={pickHomeImage(HOME_IMAGES.stand, index)}
          meta={[
            { label: "Город", value: contractor.city },
            { label: "Рейтинг", value: `★ ${contractor.rating} · ${contractor.reviewCount} отзывов` },
          ]}
          buttonLabel="Подробнее"
          buttonHref={`/contractors/${contractor.id}`}
          buttonVariant="purple"
        />
      ))}
    </HomeScrollSection>
  );
}
