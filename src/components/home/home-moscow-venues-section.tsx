import { HOME_MOSCOW_VENUES } from "@/constants/home-content";
import { HOME_IMAGES, pickHomeImages } from "@/constants/home-images";
import { HomeScrollSection } from "./home-scroll-section";
import { HomeTileCard } from "./home-tile-card";

export function HomeMoscowVenuesSection() {
  return (
    <HomeScrollSection title="Площадки по Москве" linkHref="/venues" linkLabel="Все площадки">
      {HOME_MOSCOW_VENUES.map((venue, index) => (
        <HomeTileCard
          key={venue.id}
          title={venue.name}
          imageUrl={venue.imageUrl}
          imageUrls={pickHomeImages(HOME_IMAGES.venue, index)}
          sponsored={index === 0}
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