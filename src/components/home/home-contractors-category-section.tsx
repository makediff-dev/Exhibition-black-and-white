"use client";

import { useMemo } from "react";
import { SEED_CONTRACTORS } from "@/data/mocks/seed";
import { HOME_BLOCK_CARD_THEME } from "@/constants/home-catalog-order";
import { pickHomeImages, HOME_IMAGES } from "@/constants/home-images";
import { HomeScrollSection } from "./home-scroll-section";
import { HomeTileCard } from "./home-tile-card";

interface HomeContractorsCategorySectionProps {
  title: string;
  category: string;
  idSuffix?: string;
}

export function HomeContractorsCategorySection({
  title,
  category,
  idSuffix = "",
}: HomeContractorsCategorySectionProps) {
  const contractors = useMemo(
    () => SEED_CONTRACTORS.filter((contractor) => contractor.categories.includes(category)),
    [category],
  );

  return (
    <HomeScrollSection
      title={title}
      linkHref="/contractors"
      linkLabel="Все исполнители"
    >
      {contractors.map((contractor, index) => (
        <HomeTileCard
          key={`${idSuffix}-${contractor.id}`}
          title={contractor.name}
          imageUrls={pickHomeImages(HOME_IMAGES.stand, index)}
          sponsored={index === 0}
          meta={[
            { label: "Город", value: contractor.city },
            { label: "Специализация", value: contractor.categories[0] ?? "—" },
          ]}
          buttonLabel="Подробнее"
          buttonHref={`/contractors/${contractor.id}`}
          buttonVariant={HOME_BLOCK_CARD_THEME.contractors.buttonVariant ?? "purple"}
        />
      ))}
    </HomeScrollSection>
  );
}