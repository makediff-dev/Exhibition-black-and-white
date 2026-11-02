"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GroupedSearchResults, SearchEmptyState } from "@/components/search/grouped-search-results";
import { getGroupedSearchResults, type SearchGroupKind } from "@/lib/utils/global-search";
import styles from "./home-page.module.css";

export type HomeSeekTab = "service" | "contractor" | "event" | "venue" | "order";

export const HOME_SEEK_TABS = [
  {
    id: "service" as const,
    title: "Услугу",
    text: "Каталог услуг для выставок: строительство стендов, дизайн, логистика и сопутствующие работы.",
    href: "/services",
    placeholder: "Поиск услуг...",
    tone: "service" as const,
  },
  {
    id: "contractor" as const,
    title: "Исполнителя",
    text: "Проверенные исполнители с портфолио, рейтингом и отзывами по категориям выставочных услуг.",
    href: "/contractors",
    placeholder: "Поиск исполнителей...",
    tone: "contractor" as const,
  },
  {
    id: "event" as const,
    title: "Мероприятие",
    text: "Календарь выставок, форумов и конференций по отраслям, городам и датам проведения.",
    href: "/events",
    placeholder: "Поиск мероприятий...",
    tone: "event" as const,
  },
  {
    id: "venue" as const,
    title: "Площадку",
    text: "Площадки для проведения мероприятий: павильоны, залы, инфраструктура и условия аренды.",
    href: "/venues",
    placeholder: "Поиск площадок...",
    tone: "venue" as const,
  },
  {
    id: "order" as const,
    title: "Разместить заказ",
    text: "Опубликуйте заказ и получите отклики от исполнителей.",
    href: "/requests",
    placeholder: "Поиск заказов...",
    tone: "order" as const,
    showPlus: true,
  },
];

const SEEK_TONE_CLASS = {
  service: styles.seekCardService,
  contractor: styles.seekCardContractor,
  event: styles.seekCardEvent,
  venue: styles.seekCardVenue,
  order: styles.seekCardOrder,
} as const;

const TAB_SEARCH_KIND: Record<HomeSeekTab, SearchGroupKind> = {
  service: "service",
  contractor: "contractor",
  event: "event",
  venue: "venue",
  order: "order",
};

const TAB_SECTION_TITLE: Record<HomeSeekTab, string> = {
  service: "Услуги",
  contractor: "Исполнители",
  event: "Мероприятия",
  venue: "Площадки",
  order: "Заказы",
};

const DEFAULT_PLACEHOLDER = "Поиск мероприятий, услуг, исполнителей...";

interface HomeSeekSectionProps {
  selectedTab: HomeSeekTab | null;
  query: string;
  onQueryChange: (value: string) => void;
  onSelectTab: (tab: HomeSeekTab) => void;
  onClearTab: () => void;
}

export function HomeSeekSection({
  selectedTab,
  query,
  onQueryChange,
  onSelectTab,
  onClearTab,
}: HomeSeekSectionProps) {
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const activeTab = HOME_SEEK_TABS.find((tab) => tab.id === selectedTab);
  const placeholder = activeTab?.placeholder ?? DEFAULT_PLACEHOLDER;
  const trimmed = query.trim();
  const searchKinds = selectedTab ? [TAB_SEARCH_KIND[selectedTab]] : undefined;
  const groups = useMemo(
    () => getGroupedSearchResults(trimmed, { kinds: searchKinds, perGroup: 5 }),
    [trimmed, selectedTab],
  );
  const hasQuery = trimmed.length >= 2;
  const isEmpty = hasQuery && groups.length === 0;
  const showDropdown = open && hasQuery && !isEmpty;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!trimmed) return;

    if (activeTab) {
      router.push(`${activeTab.href}?q=${encodeURIComponent(trimmed)}`);
      return;
    }

    setOpen(true);
  };

  return (
    <section className={styles.seekSection}>
      <div className={styles.container}>
        <div className={styles.containerInner}>
          <h2 className={styles.seekTitle}>Что вы ищете?</h2>
          <div className={styles.seekGrid} role="tablist" aria-label="Что вы ищете">
            {HOME_SEEK_TABS.map((tab) => {
              const selected = selectedTab === tab.id;
              const muted = selectedTab !== null && !selected;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={`${styles.seekCard} ${SEEK_TONE_CLASS[tab.tone]} ${muted ? styles.seekCardMuted : ""}`}
                  onClick={() => onSelectTab(tab.id)}
                >
                  <p className={styles.seekCardTitle}>
                    {tab.showPlus ? <span className={styles.seekCardPlus} aria-hidden="true" /> : null}
                    {tab.title}
                  </p>
                  <p className={styles.seekCardText}>{tab.text}</p>
                </button>
              );
            })}
          </div>
          <div ref={searchRef} className={styles.seekSearchWrap}>
            <form className={styles.seekSearch} onSubmit={handleSubmit}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/home/hero-search-icon.svg" alt="" className={styles.seekSearchIcon} aria-hidden="true" />
              <input
                name="q"
                type="search"
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                className={styles.seekSearchInput}
                placeholder={placeholder}
                aria-label={placeholder}
                aria-expanded={showDropdown}
                aria-autocomplete="list"
                value={query}
                onChange={(event) => {
                  onQueryChange(event.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
              />
              <button type="submit" className={styles.seekSearchButton}>
                Найти
              </button>
            </form>
            {showDropdown ? (
              <GroupedSearchResults query={trimmed} kinds={searchKinds} onNavigate={() => setOpen(false)} />
            ) : null}
          </div>
          {isEmpty ? (
            <SearchEmptyState
              query={trimmed}
              sectionTitle={selectedTab ? TAB_SECTION_TITLE[selectedTab] : undefined}
              onSearchAll={
                selectedTab
                  ? () => {
                      onClearTab();
                      setOpen(true);
                    }
                  : undefined
              }
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
