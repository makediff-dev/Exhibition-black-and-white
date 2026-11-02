"use client";

import Link from "next/link";
import { HomeArrowIcon } from "@/components/home/home-arrow-icon";
import { getGroupedSearchResults, type SearchGroupKind } from "@/lib/utils/global-search";
import { cn } from "@/lib/utils/cn";
import styles from "./grouped-search-results.module.css";

interface GroupedSearchResultsProps {
  query: string;
  kinds?: SearchGroupKind[];
  onNavigate?: () => void;
  className?: string;
}

interface SearchEmptyStateProps {
  query: string;
  sectionTitle?: string;
  onSearchAll?: () => void;
}

export function SearchEmptyState({ query, sectionTitle, onSearchAll }: SearchEmptyStateProps) {
  const message = sectionTitle
    ? `В разделе «${sectionTitle}» ничего не найдено по запросу «${query}»`
    : `Ничего не найдено по запросу «${query}»`;

  return (
    <div className={styles.emptyBar} role="status">
      <p className={styles.emptyMessage}>{message}</p>
      {onSearchAll ? (
        <button type="button" className={styles.searchAll} onClick={onSearchAll}>
          Искать во всех разделах
          <HomeArrowIcon className={styles.arrow} />
        </button>
      ) : null}
    </div>
  );
}

export function GroupedSearchResults({
  query,
  kinds,
  onNavigate,
  className,
}: GroupedSearchResultsProps) {
  const groups = getGroupedSearchResults(query, { kinds, perGroup: 5 });

  if (groups.length === 0) {
    return (
      <div className={cn(styles.panel, className)} role="status">
        <p className={styles.empty}>Ничего не найдено</p>
      </div>
    );
  }

  return (
    <div className={cn(styles.panel, className)} role="listbox" aria-label="Результаты поиска">
      {groups.map((group) => (
        <section key={group.kind} className={styles.section} aria-label={group.title}>
          <div className={styles.sectionHead}>
            <h3 className={styles.sectionTitle}>{group.title}</h3>
            <Link href={group.catalogHref} className={styles.seeAll} onClick={onNavigate}>
              Смотреть все
              <HomeArrowIcon className={styles.arrow} />
            </Link>
          </div>
          {group.items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={styles.item}
              role="option"
              onClick={onNavigate}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.imageUrl} alt="" className={styles.thumb} />
              <span className={styles.copy}>
                <span className={styles.title}>{item.title}</span>
                <span className={styles.subtitle}>{item.subtitle}</span>
              </span>
            </Link>
          ))}
        </section>
      ))}
    </div>
  );
}
