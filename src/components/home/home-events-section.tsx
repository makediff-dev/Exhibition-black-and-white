"use client";

import { useRef, type CSSProperties } from "react";
import { SEED_EVENTS } from "@/data/mocks/seed";
import { listUpcomingEvents } from "@/lib/state/event-machine";
import { pickHomeImage, HOME_IMAGES } from "@/constants/home-images";
import { useFitCardCount } from "@/hooks/use-fit-card-count";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useShowMore } from "@/hooks/use-show-more";
import { formatShortDate } from "@/lib/utils/formatters";
import { HomeTileCard } from "./home-tile-card";
import { HomeSectionLink } from "./home-section-link";
import { HomeShowMoreActions } from "./home-show-more-button";
import { HomeCardsFilters } from "./home-cards-filters";
import styles from "./home-page.module.css";

export function HomeEventsSection() {
  const gridRef = useRef<HTMLDivElement>(null);
  const fitCount = useFitCardCount(gridRef);
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
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionTitleDesktop}>Ближайшие выставки и мероприятия</span>
              <span className={styles.sectionTitleMobile}>Ближайшие выставки</span>
            </h2>
            <HomeSectionLink href="/events">Все мероприятия</HomeSectionLink>
          </div>

          <HomeCardsFilters />

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
                imageAlt="Фотография выставочного мероприятия"
                meta={[
                  { label: "Место", value: event.city },
                  {
                    label: "Срок",
                    value: `${formatShortDate(event.startDate)} — ${formatShortDate(event.endDate)}`,
                  },
                ]}
                buttonLabel="Откликнуться"
                buttonHref={`/events/${event.id}`}
                buttonVariant="purple"
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