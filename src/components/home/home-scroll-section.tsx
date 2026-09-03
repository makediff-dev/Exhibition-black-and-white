"use client";

import { ChevronRight } from "lucide-react";
import { Children, cloneElement, isValidElement, useCallback, useMemo, useRef } from "react";
import { cn } from "@/lib/utils/cn";
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
  denseGrid?: boolean;
  variant?: "grid" | "slider";
}

export function HomeScrollSection({
  title,
  linkHref,
  linkLabel = "Все",
  children,
  initialVisibleCount = 5,
  incrementCount = 5,
  showAllCount,
  showFilters = true,
  showActions = true,
  denseGrid = false,
  variant = "grid",
}: HomeScrollSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const baseChildren = useMemo(() => Children.toArray(children), [children]);
  const isSlider = variant === "slider";

  const { visibleItems, canShowMore, isAllVisible, showMore } = useShowMore(baseChildren, {
    initialCount: initialVisibleCount,
    step: incrementCount,
    showAllCount,
  });

  const visibleChildren = useMemo(() => {
    if (isSlider) {
      return baseChildren;
    }

    const items = showActions
      ? visibleItems
      : baseChildren.map((item, index) => ({ item, key: `static-${index}`, index }));

    return items.map(({ item, key }) => {
      if (isValidElement(item)) {
        return cloneElement(item, { key });
      }

      return item;
    });
  }, [baseChildren, isSlider, showActions, visibleItems]);

  const scrollNext = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    const gapValue = Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 24;
    const step = card ? card.offsetWidth + gapValue : 284;
    track.scrollBy({ left: step, behavior: "smooth" });
  }, []);

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
          {isSlider ? (
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
          ) : (
            <div className={cn(styles.cardsGrid, denseGrid && styles.cardsGridDense)}>
              {visibleChildren}
            </div>
          )}
          {!isSlider && showActions && (canShowMore || linkHref) ? (
            <HomeShowMoreActions
              onShowMore={showMore}
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