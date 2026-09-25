"use client";

import { ChevronRight } from "lucide-react";
import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils/cn";
import { useFitCardCount } from "@/hooks/use-fit-card-count";
import { useShowMore } from "@/hooks/use-show-more";
import { HomeSectionLink } from "./home-section-link";
import { HomeShowMoreActions } from "./home-show-more-button";
import { HomeCardsFilters } from "./home-cards-filters";
import styles from "./home-page.module.css";

interface HomeScrollSectionProps {
  title?: string;
  linkHref?: string;
  linkLabel?: string;
  children: ReactNode;
  showFilters?: boolean;
  showActions?: boolean;
  denseGrid?: boolean;
  minCardWidth?: number;
  variant?: "grid" | "slider";
}

export function HomeScrollSection({
  title,
  linkHref,
  linkLabel = "Все",
  children,
  showFilters = true,
  showActions = true,
  denseGrid = false,
  minCardWidth,
  variant = "grid",
}: HomeScrollSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const baseChildren = useMemo(() => Children.toArray(children), [children]);
  const isSlider = variant === "slider";
  const cardMinWidth = minCardWidth ?? (denseGrid ? 190 : 220);
  const fitCount = useFitCardCount(isSlider ? trackRef : gridRef, {
    minCardWidth: cardMinWidth,
    fallback: denseGrid ? 6 : 5,
  });

  const { visibleItems, canShowMore, isAllVisible, showMore } = useShowMore(baseChildren, {
    initialCount: fitCount,
    step: fitCount,
  });

  const visibleChildren = useMemo(() => {
    const items = isSlider
      ? baseChildren.map((item, index) => ({ item, key: `slider-${index}` }))
      : visibleItems;

    return items.map(({ item, key }) => {
      if (isValidElement(item)) {
        return cloneElement(item, { key });
      }

      return item;
    });
  }, [baseChildren, isSlider, visibleItems]);

  const rowStyle = {
    "--cards-per-row": fitCount,
    "--scroll-visible-cards": fitCount,
  } as CSSProperties;

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
            <div className={styles.scrollRow} style={rowStyle}>
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
            <div
              ref={gridRef}
              className={cn(styles.cardsGrid, denseGrid && styles.cardsGridDense)}
              style={rowStyle}
            >
              {visibleChildren}
            </div>
          )}
          {!isSlider && showActions ? (
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