"use client";

import { useRef, type CSSProperties } from "react";
import { HOME_BLOCK_CARD_THEME } from "@/constants/home-catalog-order";
import { SEED_EVENTS } from "@/data/mocks/seed";
import { listUpcomingEvents } from "@/lib/state/event-machine";
import { pickHomeImage, pickHomeImages, HOME_IMAGES } from "@/constants/home-images";
import { useFitCardCount } from "@/hooks/use-fit-card-count";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useShowMore } from "@/hooks/use-show-more";
import { formatShortDate } from "@/lib/utils/formatters";
import { HomeTileCard } from "./home-tile-card";
import { HomeShowMoreActions } from "./home-show-more-button";
import { HomeCardsFilters } from "./home-cards-filters";
import styles from "./home-page.module.css";

export function HomeEventsSection() {
  const gridRef = useRef<HTMLDivElement>(null);
  const fitCount = useFitCardCount(gridRef, { max: 5, fallback: 5 });
  const isMobile = useIsMobile();
  const pageSize = isMobile ? 3 : fitCount;
  const { visibleItems, canShowMore, isAllVisible, showMore } = useShowMore(
    listUpcomingEvents(SEED_EVENTS),
    {
    initialCount: pageSize,
    step: pageSize,
  });

  return (
    <section className={styles.sectionCards}>
      <div className={styles.container}>
        <div className={styles.containerInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Ближайшие мероприятия</h2>
          </div>

          <HomeCardsFilters preset="events" />

          <div
            ref={gridRef}
            className={styles.cardsGrid}
            style={{ "--cards-per-row": fitCount } as CSSProperties}
          >
            {visibleItems.map(({ item: event, key, index }) => (
              <HomeTileCard
                key={key}
                title={event.title}
                imageUrl={pickHomeImage(HOME_IMAGES.events, index)}
                imageUrls={pickHomeImages(HOME_IMAGES.events, index)}
                imageAlt="Фотография выставочного мероприятия"
                sponsored={index === 0}
                meta={[
                  { label: "Место", value: event.city },
                  {
                    label: "Срок",
                    value: `${formatShortDate(event.startDate)} — ${formatShortDate(event.endDate)}`,
                  },
                ]}
                buttonLabel="Откликнуться"
                buttonHref={`/events/${event.id}`}
                buttonVariant={HOME_BLOCK_CARD_THEME.events.buttonVariant ?? "blue"}
              />
            ))}
          </div>
          <HomeShowMoreActions
            onShowMore={showMore}
            canShowMore={canShowMore && !isAllVisible}
            allLinkHref="/events"
            allLinkLabel="Все мероприятия"
          />
        </div>
      </div>
    </section>
  );
}