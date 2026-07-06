"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Filter, ShoppingCart, Star } from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast-provider";
import { CITIES, SERVICE_CATEGORIES } from "@/constants/categories";
import { SEED_SERVICES } from "@/data/mocks/seed";
import type { Service } from "@/data/types";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils/formatters";

const SORT_OPTIONS = [
  { value: "price-asc", label: "Цена: по возрастанию" },
  { value: "price-desc", label: "Цена: по убыванию" },
  { value: "rating-desc", label: "По рейтингу" },
  { value: "title", label: "По названию" },
];

function ServiceCard({ service, onAdd }: { service: Service; onAdd: () => void }) {
  return (
    <Card className="flex flex-col h-full">
      <CardTitle>{service.title}</CardTitle>
      <CardDescription>{service.contractorName} · {service.city}</CardDescription>
      <p className="text-xs border border-gray-300 inline-block self-start px-1.5 py-0.5 mt-2">{service.category}</p>
      <p className="text-sm text-gray-700 mt-2 line-clamp-2 flex-1">{service.description}</p>
      <p className="text-base font-semibold mt-2">
        {service.priceFormat === "от" ? "от " : ""}
        {formatPrice(service.price)}
        {service.priceFormat !== "фиксированная" && service.priceFormat !== "от" ? ` / ${service.priceFormat}` : ""}
      </p>
      <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
        <Star className="h-3.5 w-3.5 fill-gray-900" />
        {service.rating} · {service.reviewCount} отзывов
      </p>
      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
        <Link href={`/services/${service.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">Подробнее</Button>
        </Link>
        <Button size="sm" className="flex-1" onClick={onAdd}>
          <ShoppingCart className="h-3.5 w-3.5" />
          В корзину
        </Button>
      </div>
    </Card>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<ServicesPageFallback />}>
      <ServicesPageContent />
    </Suspense>
  );
}

function ServicesPageFallback() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-6">
        <LoadingState message="Загрузка услуг..." />
      </main>
      <Footer />
    </div>
  );
}

function ServicesPageContent() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const addItem = useCartStore((s) => s.addItem);

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
    let list = SEED_SERVICES.filter((s) => {
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
  }, [search, city, category, contractorId, sort]);

  const handleAdd = (service: Service) => {
    addItem({ serviceId: service.id, quantity: 1, comment: "", files: [] });
    showToast(`«${service.title}» добавлено в корзину`, "success");
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
    <div className="flex flex-col min-h-screen">
      <PublicHeader />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Услуги</h1>
            <p className="text-sm text-gray-600 mt-1">Каталог услуг для выставок и мероприятий</p>
          </div>
          <Link href="/cart">
            <Button variant="outline">
              <ShoppingCart className="h-4 w-4" />
              Корзина
            </Button>
          </Link>
        </div>

        <section className="mb-6">
          <h2 className="text-sm font-semibold mb-2">Категории</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory("")}
              className={`text-xs border px-2 py-1 ${!category ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300 hover:border-gray-900"}`}
            >
              Все
            </button>
            {SERVICE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`text-xs border px-2 py-1 ${category === cat ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300 hover:border-gray-900"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        <Button variant="outline" className="md:hidden w-full mb-4" onClick={() => setDrawerOpen(true)}>
          <Filter className="h-4 w-4" />
          Фильтры
        </Button>

        <div className="grid lg:grid-cols-[240px_1fr] gap-6">
          <aside className="hidden md:block">
            <div className="border border-gray-300 p-4 sticky top-20">
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
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((service) => (
                    <ServiceCard key={service.id} service={service} onAdd={() => handleAdd(service)} />
                  ))}
                </div>
              </>
            )}
          </section>
        </div>

        <Card className="mt-8 border-dashed">
          <CardTitle className="text-base">Нужна комплексная услуга?</CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Если нужен единый подрядчик или комплекс работ «под ключ», создайте заявку с описанием задачи.
          </p>
          <Link href="/requests/new?format=open_request" className="inline-block mt-3">
            <Button variant="outline" size="sm">Создать заявку</Button>
          </Link>
        </Card>
      </main>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Фильтры">
        {filterPanel}
        <Button className="w-full mt-4" onClick={() => setDrawerOpen(false)}>Применить</Button>
      </Drawer>

      <Footer />
    </div>
  );
}
