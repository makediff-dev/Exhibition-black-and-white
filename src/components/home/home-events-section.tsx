"use client";

import { useCallback, useRef } from "react";
import { SEED_EVENTS } from "@/data/mocks/seed";
import { pickHomeImage, HOME_IMAGES } from "@/constants/home-images";
import { useShowMore } from "@/hooks/use-show-more";
import { formatShortDate } from "@/lib/utils/formatters";
import { HomeTileCard } from "./home-tile-card";
import { HomeSectionLink } from "./home-section-link";
import { HomeShowMoreActions } from "./home-show-more-button";
import { HomeCardsFilters } from "./home-cards-filters";
import styles from "./home-page.module.css";

export function HomeEventsSection() {
  const gridRef = useRef<HTMLDivElement>(null);
  const { visibleItems, canShowMore, isAllVisible, showMore } = useShowMore(SEED_EVENTS, {
    initialCount: 10,
    step: 5,
  });

  const scrollToNewCards = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) return;

    requestAnimationFrame(() => {
      grid.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }, []);

  const handleShowMore = useCallback(() => {
    showMore();
    scrollToNewCards();
  }, [scrollToNewCards, showMore]);

  return (
    <section className={styles.sectionCards}>
      <div className={styles.container}>
        <div className={styles.containerInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Ближайшие выставки и мероприятия</h2>
            <HomeSectionLink href="/events">Все мероприятия</HomeSectionLink>
          </div>

          <HomeCardsFilters />

          <div ref={gridRef} className={styles.eventsGrid}>
            {visibleItems.map(({ item: event, key, index }) => (
              <HomeTileCard
                key={key}
                title={event.title}
                imageUrl={pickHomeImage(HOME_IMAGES.events, index)}
                meta={[
                  { label: "Место", value: event.city },
                  {
                    label: "Срок",
                    value: `${formatShortDate(event.startDate)} — ${formatShortDate(event.endDate)}`,
                  },
                ]}
                buttonLabel="Откликнуться"
                buttonHref={`/events/${event.id}`}
                buttonVariant="primary"
              />
            ))}
          </div>
          <HomeShowMoreActions
            onShowMore={handleShowMore}
            canShowMore={canShowMore && !isAllVisible}
            allLinkHref="/events"
            allLinkLabel="Все мероприятия"
          />
        </div>
      </div>
    </section>
  );
}
