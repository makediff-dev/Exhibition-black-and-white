"use client";

import { HomeSectionLink } from "./home-section-link";
import styles from "./home-page.module.css";

interface HomeShowMoreActionsProps {
  onShowMore: () => void;
  canShowMore?: boolean;
  showMoreLabel?: string;
  allLinkHref?: string;
  allLinkLabel?: string;
}

export function HomeShowMoreActions({
  onShowMore,
  showMoreLabel = "Показать больше",
  allLinkHref,
  allLinkLabel = "Показать все",
}: HomeShowMoreActionsProps) {
  return (
    <div className={styles.showMoreWrap}>
      <button type="button" className={styles.showMoreButton} onClick={onShowMore}>
        {showMoreLabel}
      </button>
      {allLinkHref ? <HomeSectionLink href={allLinkHref}>{allLinkLabel}</HomeSectionLink> : null}
    </div>
  );
}