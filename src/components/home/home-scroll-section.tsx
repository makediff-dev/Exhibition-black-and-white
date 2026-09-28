"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
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
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useShowMore } from "@/hooks/use-show-more";
import { HomeSectionLink } from "./home-section-link";
import { HomeShowMoreActions } from "./home-show-more-button";
import { HomeCardsFilters } from "./home-cards-filters";
import styles from "./home-page.module.css";

interface HomeScrollSectionProps {
  title?: string;
  mobileTitle?: string;
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
  mobileTitle,
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
  const cardMinWidth = minCardWidth ?? (denseGrid ? 190 : 200);
  const fitCount = useFitCardCount(isSlider ? trackRef : gridRef, {
    minCardWidth: cardMinWidth,
    fallback: denseGrid ? 6 : 5,
  });

  const resolvedMobileTitle =
    mobileTitle ??
    (title && title.length > 28 ? title.split(/\s+/).slice(0, 2).join(" ") : undefined);

  const isMobile = useIsMobile();
  const pageSize = isMobile ? 3 : fitCount;
  const { visibleItems, canShowMore, isAllVisible, showMore } = useShowMore(baseChildren, {
    initialCount: pageSize,
    step: pageSize,
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

  const scrollByCard = useCallback((direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    const gapValue = Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 24;
    const step = card ? card.offsetWidth + gapValue : 284;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  }, []);

  return (
    <section className={styles.sectionCards}>
      <div className={styles.container}>
        <div className={styles.containerInner}>
          {title ? (
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                {resolvedMobileTitle ? (
                  <>
                    <span className={styles.sectionTitleDesktop}>{title}</span>
                    <span className={styles.sectionTitleMobile}>{resolvedMobileTitle}</span>
                  </>
                ) : (
                  title
                )}
              </h2>
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
                className={`${styles.scrollArrow} ${styles.scrollArrowPrev}`}
                aria-label="Прокрутить влево"
                onClick={() => scrollByCard(-1)}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                className={`${styles.scrollArrow} ${styles.scrollArrowNext}`}
                aria-label="Прокрутить вправо"
                onClick={() => scrollByCard(1)}
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