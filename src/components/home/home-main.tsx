"use client";

import { useMemo, useState } from "react";
import { getHomeCatalogOrder } from "@/constants/home-catalog-order";
import { useAuthStore } from "@/lib/store";
import { HomeSeekSection, type HomeSeekTab } from "./home-seek-section";
import { HomeCategoriesSection } from "./home-categories-section";
import { HomeEventsSection } from "./home-events-section";
import { HomeOrdersProvider } from "./home-orders-provider";
import { HomeUrgentOrdersSection } from "./home-urgent-orders-section";
import { HomeCurrentOrdersSection } from "./home-current-orders-section";
import { HomeRecommendedContractorsSection } from "./home-recommended-contractors-section";
import { HomeRecommendedVenuesSection } from "./home-recommended-venues-section";
import styles from "./home-page.module.css";

const CATALOG_ORDER_BY_TAB: Record<HomeSeekTab, ReturnType<typeof getHomeCatalogOrder>> = {
  service: ["categories", "contractors", "urgent", "current", "events", "venues"],
  contractor: ["contractors", "categories", "urgent", "current", "events", "venues"],
  event: ["events", "categories", "contractors", "urgent", "current", "venues"],
  venue: ["venues", "categories", "contractors", "urgent", "current", "events"],
  order: ["urgent", "current", "categories", "contractors", "events", "venues"],
};

export function HomeMain() {
  const role = useAuthStore((state) => (state.isAuthenticated ? state.user?.role : null));
  const [selectedTab, setSelectedTab] = useState<HomeSeekTab | null>(null);
  const [query, setQuery] = useState("");

  const catalogOrder = selectedTab ? CATALOG_ORDER_BY_TAB[selectedTab] : getHomeCatalogOrder(role);

  const blocks = useMemo(
    () => ({
      categories: <HomeCategoriesSection key="categories" />,
      contractors: <HomeRecommendedContractorsSection key="contractors" />,
      urgent: <HomeUrgentOrdersSection key="urgent" />,
      current: <HomeCurrentOrdersSection key="current" />,
      events: <HomeEventsSection key="events" />,
      venues: <HomeRecommendedVenuesSection key="venues" />,
    }),
    [],
  );

  return (
    <>
      <HomeSeekSection
        selectedTab={selectedTab}
        query={query}
        onQueryChange={setQuery}
        onSelectTab={(tab) => setSelectedTab((current) => (current === tab ? null : tab))}
        onClearTab={() => setSelectedTab(null)}
      />
      <div id="home-catalog" className={styles.homeCatalog}>
        <HomeOrdersProvider>{catalogOrder.map((id) => blocks[id])}</HomeOrdersProvider>
      </div>
    </>
  );
}
