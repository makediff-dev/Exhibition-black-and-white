import { HOME_BLOCK_CARD_THEME } from "@/constants/home-catalog-order";
import { HOME_RECOMMENDED_VENUES } from "@/constants/home-content";
import { HOME_IMAGES, pickHomeImages } from "@/constants/home-images";
import { HomeScrollSection } from "./home-scroll-section";
import { HomeTileCard } from "./home-tile-card";

export function HomeRecommendedVenuesSection() {
  return (
    <HomeScrollSection
      title="Популярные площадки"
      linkHref="/venues"
      linkLabel="Все площадки"
      filterPreset="venues"
    >
      {HOME_RECOMMENDED_VENUES.map((venue, index) => (
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
          buttonVariant={HOME_BLOCK_CARD_THEME.venues.buttonVariant ?? "violet"}
        />
      ))}
    </HomeScrollSection>
  );
}