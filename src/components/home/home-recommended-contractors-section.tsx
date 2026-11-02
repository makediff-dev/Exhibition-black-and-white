"use client";

import { useMemo } from "react";
import { SEED_CONTRACTORS } from "@/data/mocks/seed";
import { HOME_BLOCK_CARD_THEME } from "@/constants/home-catalog-order";
import { pickHomeImages, HOME_IMAGES } from "@/constants/home-images";
import { formatReviewCount } from "@/lib/utils/formatters";
import { HomeScrollSection } from "./home-scroll-section";
import { HomeTileCard } from "./home-tile-card";

export function HomeRecommendedContractorsSection() {
  const contractors = useMemo(() => SEED_CONTRACTORS.slice(0, 6), []);

  return (
    <HomeScrollSection
      title="Популярные исполнители"
      mobileTitle="Популярные исполнители"
      linkHref="/contractors"
      linkLabel="Все исполнители"
      filterPreset="contractors"
    >
      {contractors.map((contractor, index) => (
        <HomeTileCard
          key={contractor.id}
          title={contractor.name}
          imageUrls={pickHomeImages(HOME_IMAGES.stand, index)}
          imageAlt="Фотография стенда исполнителя"
          sponsored={index < 2}
          meta={[
            { label: "Город", value: contractor.city },
            { label: "Рейтинг", value: `★ ${contractor.rating} · ${formatReviewCount(contractor.reviewCount)}` },
          ]}
          buttonLabel="Подробнее"
          buttonHref={`/contractors/${contractor.id}`}
          buttonVariant={HOME_BLOCK_CARD_THEME.contractors.buttonVariant ?? "purple"}
        />
      ))}
    </HomeScrollSection>
  );
}