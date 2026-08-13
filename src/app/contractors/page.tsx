"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Filter, Star } from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { CatalogCardImageSlider } from "@/components/catalog/catalog-card-image-slider";
import { InviteContractorModal } from "@/components/contractors/invite-contractor-modal";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { CITIES, SERVICE_CATEGORIES } from "@/constants/categories";
import { SEED_CONTRACTORS } from "@/data/mocks/seed";
import type { Contractor } from "@/data/types";

const SORT_OPTIONS = [
  { value: "rating-desc", label: "По рейтингу" },
  { value: "reviews-desc", label: "По отзывам" },
  { value: "name", label: "По названию" },
  { value: "city", label: "По городу" },
];

function ContractorCard({
  contractor,
  onInvite,
}: {
  contractor: Contractor;
  onInvite: (contractor: Contractor) => void;
}) {
  return (
    <Card className="relative flex flex-col h-full overflow-hidden p-0 hover:border-gray-900 transition-colors">
      <Link
        href={`/contractors/${contractor.id}`}
        className="absolute inset-0 z-0"
        aria-label={`Открыть профиль ${contractor.name}`}
      />

      <CatalogCardImageSlider />

      <div className="relative z-10 flex flex-col flex-1 p-4 pointer-events-none">
        <CardTitle className="text-base">{contractor.name}</CardTitle>
        <CardDescription>{contractor.city} · {contractor.geography}</CardDescription>
        <p className="text-sm text-gray-700 mt-2 line-clamp-2 flex-1">{contractor.description}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {contractor.categories.slice(0, 3).map((cat) => (
            <span key={cat} className="text-xs border border-gray-300 px-1.5 py-0.5">{cat}</span>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-gray-900" />
          {contractor.rating} · {contractor.reviewCount} отзывов
        </p>
      </div>

      <div className="relative z-10 flex flex-col gap-2 px-4 pb-4 pt-0 pointer-events-auto">
        <div className="flex w-full flex-col gap-2 border-t border-gray-200 pt-4">
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onInvite(contractor);
            }}
          >
            Пригласить в заявку
          </Button>
          <Link href={`/contractors/${contractor.id}/check`} className="min-w-0">
            <Button size="sm" variant="ghost" className="w-full">
              Проверка
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

function FilterPanel({
  search,
  setSearch,
  city,
  setCity,
  category,
  setCategory,
  verifiedOnly,
  setVerifiedOnly,
  productionOnly,
  setProductionOnly,
  verifiedHuOnly,
  setVerifiedHuOnly,
  verifiedRegistryOnly,
  setVerifiedRegistryOnly,
  urgentOnly,
  setUrgentOnly,
  sort,
  setSort,
  onApply,
}: {
  search: string;
  setSearch: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  verifiedOnly: boolean;
  setVerifiedOnly: (v: boolean) => void;
  productionOnly: boolean;
  setProductionOnly: (v: boolean) => void;
  verifiedHuOnly: boolean;
  setVerifiedHuOnly: (v: boolean) => void;
  verifiedRegistryOnly: boolean;
  setVerifiedRegistryOnly: (v: boolean) => void;
  urgentOnly: boolean;
  setUrgentOnly: (v: boolean) => void;
  sort: string;
  setSort: (v: string) => void;
  onApply?: () => void;
}) {
  return (
    <div className="space-y-4">
      <Input
        label="Поиск"
        placeholder="Название, описание, категория..."
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
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
        Только проверенные
      </label>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={productionOnly} onChange={(e) => setProductionOnly(e.target.checked)} />
        Со своим производством
      </label>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={verifiedHuOnly} onChange={(e) => setVerifiedHuOnly(e.target.checked)} />
        Проверен ХУ
      </label>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={verifiedRegistryOnly} onChange={(e) => setVerifiedRegistryOnly(e.target.checked)} />
        Проверен по открытым реестрам
      </label>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={urgentOnly} onChange={(e) => setUrgentOnly(e.target.checked)} />
        Срочный заказ
      </label>
      <Button type="button" className="w-full" onClick={onApply}>
        Применить
      </Button>
    </div>
  );
}

export default function ContractorsPage() {
  return (
    <Suspense fallback={<ContractorsPageFallback />}>
      <ContractorsPageContent />
    </Suspense>
  );
}

function ContractorsPageFallback() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1 mx-auto max-w-site w-full px-4 py-6">
        <LoadingState message="Загрузка исполнителей..." />
      </main>
      <Footer />
    </div>
  );
}

function ContractorsPageContent() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [productionOnly, setProductionOnly] = useState(false);
  const [verifiedHuOnly, setVerifiedHuOnly] = useState(false);
  const [verifiedRegistryOnly, setVerifiedRegistryOnly] = useState(false);
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [sort, setSort] = useState("rating-desc");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [inviteContractor, setInviteContractor] = useState<Contractor | null>(null);

  const filtered = useMemo(() => {
    let list = SEED_CONTRACTORS.filter((c) => {
      if (city && c.city !== city) return false;
      if (category && !c.categories.includes(category)) return false;
      if (verifiedOnly && !c.verified) return false;
      if (productionOnly && !c.hasProduction) return false;
      if (verifiedHuOnly && !c.verified) return false;
      if (verifiedRegistryOnly && !c.verified) return false;
      if (urgentOnly && !c.verified) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const haystack = `${c.name} ${c.description} ${c.categories.join(" ")} ${c.city}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "reviews-desc":
          return b.reviewCount - a.reviewCount;
        case "name":
          return a.name.localeCompare(b.name, "ru");
        case "city":
          return a.city.localeCompare(b.city, "ru");
        default:
          return b.rating - a.rating;
      }
    });

    return list;
  }, [search, city, category, verifiedOnly, productionOnly, verifiedHuOnly, verifiedRegistryOnly, urgentOnly, sort]);

  const resetFilters = () => {
    setSearch("");
    setCity("");
    setCategory("");
    setVerifiedOnly(false);
    setProductionOnly(false);
    setVerifiedHuOnly(false);
    setVerifiedRegistryOnly(false);
    setUrgentOnly(false);
    setSort("rating-desc");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />

      <main className="flex-1 mx-auto max-w-site w-full px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Исполнители</h1>
          <p className="text-sm text-gray-600 mt-1">Каталог подрядчиков выставочной индустрии</p>
        </div>

        <div className="flex gap-2 mb-4 md:hidden">
          <Button variant="outline" className="w-full" onClick={() => setDrawerOpen(true)}>
            <Filter className="h-4 w-4" />
            Фильтры
          </Button>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          <aside className="hidden md:block">
            <div className="border border-gray-300 p-4 sticky top-20">
              <div className="flex justify-between mb-4">
                <h2 className="text-sm font-semibold">Фильтры</h2>
                <button type="button" onClick={resetFilters} className="text-xs underline">Сбросить</button>
              </div>
              <FilterPanel
                search={search}
                setSearch={setSearch}
                city={city}
                setCity={setCity}
                category={category}
                setCategory={setCategory}
                verifiedOnly={verifiedOnly}
                setVerifiedOnly={setVerifiedOnly}
                productionOnly={productionOnly}
                setProductionOnly={setProductionOnly}
                verifiedHuOnly={verifiedHuOnly}
                setVerifiedHuOnly={setVerifiedHuOnly}
                verifiedRegistryOnly={verifiedRegistryOnly}
                setVerifiedRegistryOnly={setVerifiedRegistryOnly}
                urgentOnly={urgentOnly}
                setUrgentOnly={setUrgentOnly}
                sort={sort}
                setSort={setSort}
              />
            </div>
          </aside>

          <section>
            {filtered.length === 0 ? (
              <EmptyState
                title="Исполнители не найдены"
                description="Измените параметры поиска или фильтры"
                actionLabel="Сбросить фильтры"
                onAction={resetFilters}
              />
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">Найдено: {filtered.length}</p>
                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {filtered.map((contractor) => (
                    <ContractorCard
                      key={contractor.id}
                      contractor={contractor}
                      onInvite={setInviteContractor}
                    />
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Фильтры">
        <FilterPanel
          search={search}
          setSearch={setSearch}
          city={city}
          setCity={setCity}
          category={category}
          setCategory={setCategory}
          verifiedOnly={verifiedOnly}
          setVerifiedOnly={setVerifiedOnly}
          productionOnly={productionOnly}
          setProductionOnly={setProductionOnly}
          verifiedHuOnly={verifiedHuOnly}
          setVerifiedHuOnly={setVerifiedHuOnly}
          verifiedRegistryOnly={verifiedRegistryOnly}
          setVerifiedRegistryOnly={setVerifiedRegistryOnly}
          urgentOnly={urgentOnly}
          setUrgentOnly={setUrgentOnly}
          sort={sort}
          setSort={setSort}
          onApply={() => setDrawerOpen(false)}
        />
      </Drawer>

      <InviteContractorModal
        open={Boolean(inviteContractor)}
        contractor={inviteContractor}
        onClose={() => setInviteContractor(null)}
      />

      <Footer />
    </div>
  );
}
