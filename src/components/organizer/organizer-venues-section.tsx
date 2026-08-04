"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Building2, MapPin, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CITIES } from "@/constants/categories";
import {
  DEMO_USERS,
  SEED_HALLS,
  SEED_PAVILIONS,
  SEED_VENUE_PROFILE_MEDIA,
  SEED_VENUE_SPACE_BLOCKS,
} from "@/data/mocks/seed";
import { formatPrice } from "@/lib/utils/formatters";

const VENUE_CATALOG = [
  {
    id: "venue-1",
    shortName: "ЭкспоЦентр",
    legalName: DEMO_USERS.venue.name,
    city: "Москва",
    address: DEMO_USERS.venue.address,
    description:
      "Крупнейший выставочный комплекс: павильоны, инфраструктура, логистика и медиаматериалы от площадки.",
  },
  {
    id: "venue-2",
    shortName: "ЭкспоФорум",
    legalName: "АО «ЭкспоФорум»",
    city: "Санкт-Петербург",
    address: "г. Санкт-Петербург, пр. Обуховской Обороны, 90",
    description:
      "Конгрессно-выставочный центр для региональных и международных мероприятий.",
  },
] as const;

function getVenueStats(venueId: string) {
  const halls = SEED_HALLS.filter((hall) => hall.venueId === venueId);
  const pavilions = SEED_PAVILIONS.filter((pavilion) => pavilion.venueId === venueId);
  const blocks = SEED_VENUE_SPACE_BLOCKS.filter((block) => block.venueId === venueId);
  const photos = SEED_VENUE_PROFILE_MEDIA.filter(
    (item) => item.venueId === venueId && item.type === "photo"
  );
  const videos = SEED_VENUE_PROFILE_MEDIA.filter(
    (item) => item.venueId === venueId && item.type === "video"
  );

  const totalArea = halls.reduce((sum, hall) => sum + hall.area, 0);
  const prices = blocks.length
    ? blocks.map((block) => block.pricePerSqm)
    : halls.map((hall) => Math.round(1800 + hall.area / 10));

  return {
    halls,
    pavilions,
    photos,
    videos,
    totalArea,
    priceMin: Math.min(...prices),
    priceMax: Math.max(...prices),
    freeHalls: halls.filter((hall) => hall.available).length,
  };
}

export function OrganizerVenuesSection() {
  const [city, setCity] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minArea, setMinArea] = useState("");

  const venues = useMemo(() => {
    return VENUE_CATALOG.map((venue) => ({
      venue,
      stats: getVenueStats(venue.id),
    })).filter(({ venue, stats }) => {
      if (city && venue.city !== city) return false;
      if (minArea && stats.totalArea < Number(minArea)) return false;
      return true;
    });
  }, [city, minArea]);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          label="Город"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          options={[
            { value: "", label: "Все города" },
            ...CITIES.map((item) => ({ value: item, label: item })),
          ]}
        />
        <Input
          label="Дата с"
          type="date"
          value={dateFrom}
          onChange={(event) => setDateFrom(event.target.value)}
        />
        <Input
          label="Дата по"
          type="date"
          value={dateTo}
          onChange={(event) => setDateTo(event.target.value)}
        />
        <Input
          label="Площадь от, кв.м"
          type="number"
          min={0}
          value={minArea}
          onChange={(event) => setMinArea(event.target.value)}
          placeholder="1200"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {venues.map(({ venue, stats }) => {
          const photo = stats.photos[0];

          return (
            <Card key={venue.id} className="h-full overflow-hidden p-0 flex flex-col">
              <div className="h-36 bg-gray-100 border-b border-gray-200 flex items-center justify-center text-xs text-gray-500 px-4 text-center">
                {photo?.title ?? "Фото площадки"}
              </div>

              <div className="p-4 flex flex-col flex-1">
                <CardTitle className="text-base leading-snug">{venue.shortName}</CardTitle>
                <CardDescription className="mt-1">{venue.legalName}</CardDescription>

                <div className="mt-3 space-y-2 text-sm text-gray-700 flex-1">
                  <p className="flex items-start gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    {venue.address}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    {stats.pavilions.length} павильонов · {stats.halls.length} залов
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Maximize2 className="h-3.5 w-3.5 shrink-0" />
                    {stats.totalArea.toLocaleString("ru-RU")} кв.м · свободно залов:{" "}
                    {stats.freeHalls}
                  </p>
                  <p className="text-gray-900 font-medium">
                    {formatPrice(stats.priceMin)} — {formatPrice(stats.priceMax)} / кв.м
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">{venue.description}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="flex-1 min-w-[140px]">
                    Показать на карте
                  </Button>
                  <Link href={`/account/organizer/create-event?venueId=${venue.id}`} className="flex-1 min-w-[140px]">
                    <Button size="sm" className="w-full">
                      Выбрать площадку
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
