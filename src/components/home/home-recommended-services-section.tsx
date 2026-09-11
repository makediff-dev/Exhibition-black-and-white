"use client";

import { useMemo } from "react";
import { SEED_SERVICES } from "@/data/mocks/seed";
import { pickHomeImage, HOME_IMAGES } from "@/constants/home-images";
import { formatServicePrice } from "@/lib/utils/formatters";
import { HomeScrollSection } from "./home-scroll-section";
import { HomeTileCard } from "./home-tile-card";

export function HomeRecommendedServicesSection() {
  const services = useMemo(() => SEED_SERVICES.slice(0, 6), []);

  return (
    <HomeScrollSection title="Рекомендованные услуги" linkHref="/services" linkLabel="Все услуги">
      {services.map((service, index) => (
        <HomeTileCard
          key={service.id}
          title={service.title}
          imageUrl={pickHomeImage(HOME_IMAGES.stand, index)}
          meta={[
            { label: "Исполнитель", value: service.contractorName },
            { label: "Цена", value: formatServicePrice(service) },
          ]}
          buttonLabel="Подробнее"
          buttonHref={`/services/${service.id}`}
          buttonVariant="primary"
        />
      ))}
    </HomeScrollSection>
  );
}