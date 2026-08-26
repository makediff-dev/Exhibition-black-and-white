"use client";

import { HOME_MOSCOW_VENUES } from "@/constants/home-content";
import { HomeScrollSection } from "./home-scroll-section";
import { HomeTileCard } from "./home-tile-card";

export function HomeVenuesSection() {
  return (
    <HomeScrollSection title="Площадки по Москве" linkHref="/events" linkLabel="Смотреть все площадки">
      {HOME_MOSCOW_VENUES.map((venue) => (
        <HomeTileCard
          key={venue.id}
          title={venue.name}
          meta={[
            { label: "Место", value: venue.city },
            { label: "Павильоны", value: venue.halls },
          ]}
          buttonLabel="Подробнее"
          buttonHref="/events"
        />
      ))}
    </HomeScrollSection>
  );
}
