"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Filter } from "lucide-react";
import { VenueCard } from "@/components/catalog/venue-card";
import { CabinetAwareLayout } from "@/components/layout/cabinet-aware-layout";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast-provider";
import { CATALOG_SECTION_ACCENT } from "@/constants/catalog-section-styles";
import { CITIES } from "@/constants/categories";
import { PUBLIC_VENUES } from "@/constants/venues";
import { useFavoritesStore } from "@/lib/store";

const SORT_OPTIONS = [
  { value: "name", label: "По названию" },
  { value: "city", label: "По городу" },
];

export default function VenuesPage() {
  return (
    <Suspense fallback={<VenuesPageFallback />}>
      <VenuesPageContent />
    </Suspense>
  );
}

function VenuesPageFallback() {
  return (
    <CabinetAwareLayout title="Площадки" className="catalog-list-layout">
      <LoadingState message="Загрузка площадок..." />
    </CabinetAwareLayout>
  );
}

const VENUES_ACCENT = CATALOG_SECTION_ACCENT.venues;

function VenuesPageContent() {
  const { showToast } = useToast();
  const toggleVenueFavorite = useFavoritesStore((state) => state.toggleVenueFavorite);
  const isVenueFavorite = useFavoritesStore((state) => state.isVenueFavorite);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [sort, setSort] = useState("name");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    let list = PUBLIC_VENUES.filter((venue) => {
      if (city && venue.city !== city) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        const haystack = `${venue.name} ${venue.city} ${venue.halls} ${venue.description}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === "city") return a.city.localeCompare(b.city, "ru") || a.name.localeCompare(b.name, "ru");
      return a.name.localeCompare(b.name, "ru");
    });

    return list;
  }, [search, city, sort]);

  const resetFilters = () => {
    setSearch("");
    setCity("");
    setSort("name");
  };

  const filterPanel = (
    <div className="space-y-4">
      <Input
        label="Поиск"
        placeholder="Название площадки..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <Select
        label="Город"
        value={city}
        onChange={(event) => setCity(event.target.value)}
        options={[{ value: "", label: "Все города" }, ...CITIES.map((item) => ({ value: item, label: item }))]}
      />
      <Select
        label="Сортировка"
        value={sort}
        onChange={(event) => setSort(event.target.value)}
        options={SORT_OPTIONS}
      />
    </div>
  );

  return (
    <CabinetAwareLayout
      title="Площадки"
      description="Каталог площадок для выставок и мероприятий — павильоны, залы и инфраструктура."
      className="catalog-list-layout"
    >
      <Button variant="soft-outline" className="md:hidden w-full mb-4" onClick={() => setDrawerOpen(true)}>
          <Filter className="h-4 w-4" />
          Фильтры
        </Button>

        <div className="catalog-page-grid">
          <aside className="hidden md:block catalog-filters-panel shrink-0">
            <div className="catalog-filters-box p-4 sticky top-20">
              <div className="flex justify-between mb-4">
                <h2 className="text-sm font-semibold">Фильтры</h2>
                <button type="button" onClick={resetFilters} className="text-xs underline">
                  Сбросить
                </button>
              </div>
              {filterPanel}
            </div>
          </aside>

          <section>
            {loading ? (
              <LoadingState message="Загрузка площадок..." />
            ) : filtered.length === 0 ? (
              <EmptyState
                title="Площадки не найдены"
                description="Измените фильтры или поисковый запрос."
                actionLabel="Сбросить фильтры"
                onAction={resetFilters}
              />
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">Найдено: {filtered.length}</p>
                <div className="catalog-cards-grid">
                  {filtered.map((venue, index) => {
                    const favoriteId = venue.catalogId ?? venue.id;
                    const canFavorite = Boolean(venue.catalogId);

                    return (
                      <VenueCard
                        key={venue.id}
                        venue={venue}
                        cardIndex={index}
                        isFavorite={canFavorite ? isVenueFavorite(favoriteId) : false}
                        onToggleFavorite={
                          canFavorite
                            ? () => {
                                const added = toggleVenueFavorite(favoriteId);
                                showToast(
                                  added
                                    ? `«${venue.name}» добавлена в избранное`
                                    : `«${venue.name}» удалена из избранного`,
                                  added ? "success" : "info",
                                );
                              }
                            : undefined
                        }
                      />
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Фильтры">
        {filterPanel}
        <Button variant={VENUES_ACCENT} className="w-full mt-4" onClick={() => setDrawerOpen(false)}>
          Применить
        </Button>
      </Drawer>
    </CabinetAwareLayout>
  );
}