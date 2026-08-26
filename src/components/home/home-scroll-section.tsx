"use client";

import { ChevronRight } from "lucide-react";
import { Children, cloneElement, isValidElement, useCallback, useMemo, useRef } from "react";
import { useShowMore } from "@/hooks/use-show-more";
import { HomeSectionLink } from "./home-section-link";
import { HomeShowMoreActions } from "./home-show-more-button";
import { HomeCardsFilters } from "./home-cards-filters";
import styles from "./home-page.module.css";

interface HomeScrollSectionProps {
  title?: string;
  linkHref?: string;
  linkLabel?: string;
  children: React.ReactNode;
  initialVisibleCount?: number;
  incrementCount?: number;
  showAllCount?: number;
  showFilters?: boolean;
  showActions?: boolean;
}

export function HomeScrollSection({
  title,
  linkHref,
  linkLabel = "Смотреть все",
  children,
  initialVisibleCount = 5,
  incrementCount = 5,
  showAllCount,
  showFilters = true,
  showActions = true,
}: HomeScrollSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const baseChildren = useMemo(() => Children.toArray(children), [children]);

  const { visibleItems, canShowMore, isAllVisible, showMore } = useShowMore(baseChildren, {
    initialCount: initialVisibleCount,
    step: incrementCount,
    showAllCount,
  });

  const visibleChildren = useMemo(() => {
    if (!showActions) {
      return baseChildren;
    }

    return visibleItems.map(({ key, index }) => {
      const child = baseChildren[index % Math.min(initialVisibleCount, baseChildren.length)];

      if (isValidElement(child)) {
        return cloneElement(child, { key });
      }

      return child;
    });
  }, [baseChildren, initialVisibleCount, showActions, visibleItems]);

  const scrollToNewCards = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    requestAnimationFrame(() => {
      track.scrollTo({
        left: track.scrollWidth,
        behavior: "smooth",
      });
    });
  }, []);

  const handleShowMore = useCallback(() => {
    showMore();
    scrollToNewCards();
  }, [scrollToNewCards, showMore]);

  const scrollNext = () => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    const gapValue = Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 24;
    const step = card ? card.offsetWidth + gapValue : 284;
    track.scrollBy({ left: step, behavior: "smooth" });
  };

  return (
    <section className={styles.sectionCards}>
      <div className={styles.container}>
        <div className={styles.containerInner}>
          {title ? (
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{title}</h2>
              {linkHref ? <HomeSectionLink href={linkHref}>{linkLabel}</HomeSectionLink> : null}
            </div>
          ) : null}
          {showFilters ? <HomeCardsFilters /> : null}
          <div className={styles.scrollRow}>
            <div ref={trackRef} className={styles.scrollTrack}>
              {visibleChildren}
            </div>
            <button
              type="button"
              className={styles.scrollArrow}
              aria-label="Прокрутить вправо"
              onClick={scrollNext}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          {showActions && (canShowMore || linkHref) ? (
            <HomeShowMoreActions
              onShowMore={handleShowMore}
              canShowMore={canShowMore && !isAllVisible}
              allLinkHref={linkHref}
              allLinkLabel={linkLabel}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
