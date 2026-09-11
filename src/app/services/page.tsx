"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Filter, ShoppingCart } from "lucide-react";
import { ServiceCard } from "@/components/catalog/service-card";
import { CabinetAwareLayout } from "@/components/layout/cabinet-aware-layout";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast-provider";
import { CATALOG_SECTION_ACCENT } from "@/constants/catalog-section-styles";
import { CITIES, SERVICE_CATEGORIES } from "@/constants/categories";
import type { Service } from "@/data/types";
import { useCartStore, useFavoritesStore, usePrototypeStore } from "@/lib/store";

const SERVICES_ACCENT = CATALOG_SECTION_ACCENT.services;

const SORT_OPTIONS = [
  { value: "price-asc", label: "Цена: по возрастанию" },
  { value: "price-desc", label: "Цена: по убыванию" },
  { value: "rating-desc", label: "По рейтингу" },
  { value: "title", label: "По названию" },
];

export default function ServicesPage() {
  return (
    <Suspense fallback={<ServicesPageFallback />}>
      <ServicesPageContent />
    </Suspense>
  );
}

function ServicesPageFallback() {
  return (
    <CabinetAwareLayout title="Услуги" description="Каталог услуг для выставок и мероприятий" className="catalog-list-layout">
      <LoadingState message="Загрузка услуг..." />
    </CabinetAwareLayout>
  );
}

function ServicesPageContent() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const addItem = useCartStore((s) => s.addItem);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) => s.isFavorite);
  const services = usePrototypeStore((s) => s.services);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [contractorId, setContractorId] = useState(searchParams.get("contractor") ?? "");
  const [sort, setSort] = useState("rating-desc");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    let list = services.filter((s) => {
      if (city && s.city !== city) return false;
      if (category && s.category !== category) return false;
      if (contractorId && s.contractorId !== contractorId) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const haystack = `${s.title} ${s.description} ${s.category} ${s.contractorName}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "title":
          return a.title.localeCompare(b.title, "ru");
        default:
          return b.rating - a.rating;
      }
    });

    return list;
  }, [services, search, city, category, contractorId, sort]);

  const handleAdd = (service: Service) => {
    addItem({ serviceId: service.id, quantity: 1, comment: "", files: [] });
    showToast(`«${service.title}» добавлено в корзину`, "success");
  };

  const handleToggleFavorite = (service: Service) => {
    const added = toggleFavorite(service.id);
    showToast(
      added ? `«${service.title}» добавлено в избранное` : `«${service.title}» удалено из избранного`,
      added ? "success" : "info"
    );
  };

  const resetFilters = () => {
    setSearch("");
    setCity("");
    setCategory("");
    setContractorId("");
    setSort("rating-desc");
  };

  const filterPanel = (
    <div className="space-y-4">
      <Input
        label="Поиск"
        placeholder="Название, исполнитель..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Select
        label="Город"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        options={[{ value: "", label: "Все города" }, ...CITIES.map((c) => ({ value: c, label: c }))]}
      />
      <Select
        label="Категория"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        options={[
          { value: "", label: "Все категории" },
          ...SERVICE_CATEGORIES.map((c) => ({ value: c, label: c })),
        ]}
      />
      <Select
        label="Сортировка"
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        options={SORT_OPTIONS}
      />
    </div>
  );

  return (
    <CabinetAwareLayout
      title="Услуги"
      description="Каталог услуг для выставок и мероприятий"
      className="catalog-list-layout"
      actions={
        <Link href="/cart">
          <Button variant="soft-outline">
            <ShoppingCart className="h-4 w-4" />
            Корзина
          </Button>
        </Link>
      }
    >
      <Button variant="soft-outline" className="lg:hidden w-full mb-4" onClick={() => setDrawerOpen(true)}>
        <Filter className="h-4 w-4" />
        Фильтры
      </Button>

      <div className="catalog-page-grid">
          <aside className="hidden lg:block catalog-filters-panel shrink-0">
            <div className="catalog-filters-box p-4 sticky top-20">
              <div className="flex justify-between mb-4">
                <h2 className="text-sm font-semibold">Фильтры</h2>
                <button type="button" onClick={resetFilters} className="text-xs underline">Сбросить</button>
              </div>
              {filterPanel}
            </div>
          </aside>

          <section>
            {loading ? (
              <LoadingState message="Загрузка услуг..." />
            ) : filtered.length === 0 ? (
              <EmptyState
                title="Услуги не найдены"
                description="Измените фильтры или категорию"
                actionLabel="Сбросить фильтры"
                onAction={resetFilters}
              />
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">Найдено: {filtered.length}</p>
                <div className="catalog-cards-grid">
                  {filtered.map((service, index) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      cardIndex={index}
                      onAdd={() => handleAdd(service)}
                      isFavorite={isFavorite(service.id)}
                      onToggleFavorite={() => handleToggleFavorite(service)}
                    />
                  ))}
                </div>
              </>
            )}
          </section>
        </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Фильтры">
        {filterPanel}
        <Button variant={SERVICES_ACCENT} className="w-full mt-4" onClick={() => setDrawerOpen(false)}>Применить</Button>
      </Drawer>
    </CabinetAwareLayout>
  );
}