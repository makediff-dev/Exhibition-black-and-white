import { HOME_MOSCOW_VENUES } from "@/constants/home-content";
import { HomeScrollSection } from "./home-scroll-section";
import { HomeTileCard } from "./home-tile-card";

export function HomeMoscowVenuesSection() {
  return (
    <HomeScrollSection title="Площадки по Москве" linkHref="/venues" linkLabel="Все площадки">
      {HOME_MOSCOW_VENUES.map((venue) => (
        <HomeTileCard
          key={venue.id}
          title={venue.name}
          imageUrl={venue.imageUrl}
          meta={[
            { label: "Место", value: venue.city },
            { label: "Павильоны", value: venue.halls },
          ]}
          buttonLabel="Подробнее"
          buttonHref={`/venues/${venue.id}`}
          buttonVariant="pink"
        />
      ))}
    </HomeScrollSection>
  );
}