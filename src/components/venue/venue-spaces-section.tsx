"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { BookingDateRangePicker } from "@/components/venue/booking-date-calendar";
import { OccupancyCalendar } from "@/components/venue/occupancy-calendar";
import {
  SEED_VENUE_DAILY_OCCUPANCY,
  SEED_VENUE_SPACE_BLOCKS,
} from "@/data/mocks/seed";
import type { VenueSpaceBlock } from "@/data/types";
import { formatPrice } from "@/lib/utils/formatters";

function expandDateRange(start: string, end: string) {
  if (!start) return [] as string[];

  const dates: string[] = [];
  const cursor = new Date(start);
  const last = new Date(end || start);

  while (cursor <= last) {
    const year = cursor.getFullYear();
    const month = String(cursor.getMonth() + 1).padStart(2, "0");
    const day = String(cursor.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

interface Props {
  venueId?: string;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

export function VenueSpacesSection({ venueId = "venue-1", showToast }: Props) {
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [blocks, setBlocks] = useState<VenueSpaceBlock[]>(() =>
    SEED_VENUE_SPACE_BLOCKS.filter((block) => block.venueId === venueId)
  );
  const [bookingOpen, setBookingOpen] = useState(true);

  const occupancyByDate = useMemo(() => {
    return Object.fromEntries(
      SEED_VENUE_DAILY_OCCUPANCY.filter((item) => item.venueId === venueId).map((item) => [
        item.date,
        item.percent,
      ])
    );
  }, [venueId]);

  const markedDates = useMemo(
    () => Object.keys(occupancyByDate).filter((date) => occupancyByDate[date] > 0),
    [occupancyByDate]
  );

  const selectedDates = useMemo(
    () => expandDateRange(rangeStart, rangeEnd),
    [rangeStart, rangeEnd]
  );

  const averageOccupancy = useMemo(() => {
    if (selectedDates.length === 0) {
      const values = Object.values(occupancyByDate);
      if (!values.length) return 21;
      return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
    }

    const values = selectedDates.map((date) => occupancyByDate[date] ?? 0);
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  }, [selectedDates, occupancyByDate]);

  const totalArea = useMemo(
    () => blocks.reduce((sum, block) => sum + block.area, 0),
    [blocks]
  );

  const openArea = useMemo(
    () => blocks.filter((block) => block.open).reduce((sum, block) => sum + block.area, 0),
    [blocks]
  );

  const occupiedArea = Math.round((openArea * averageOccupancy) / 100);
  const freeArea = Math.max(openArea - occupiedArea, 0);

  const toggleBlock = (blockId: string) => {
    setBlocks((current) =>
      current.map((block) =>
        block.id === blockId ? { ...block, open: !block.open } : block
      )
    );
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <p className="text-sm text-gray-600">
        Управление продаваемой площадью: сколько кв.м доступно к бронированию, по какой цене
        и в какой период. Это ваш «склад» площадей — в отличие от «Схемы размещения», где вы
        работаете с конкретными местами на плане. Даты — постоянный верхний уровень: как при
        бронировании отеля, организатор выбирает площадку и период, после чего видит
        доступность и цены.
      </p>

      <BookingDateRangePicker
        label="Период"
        markedDates={markedDates}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        onRangeChange={(start, end) => {
          setRangeStart(start);
          setRangeEnd(end);
        }}
      />

      <div className="grid sm:grid-cols-3 gap-3">
        <Card>
          <CardDescription>Всего площадей</CardDescription>
          <CardTitle className="mt-1">{totalArea.toLocaleString("ru-RU")} кв.м</CardTitle>
        </Card>
        <Card>
          <CardDescription>Свободно</CardDescription>
          <CardTitle className="mt-1">{freeArea.toLocaleString("ru-RU")} кв.м</CardTitle>
        </Card>
        <Card>
          <CardDescription>Загрузка</CardDescription>
          <CardTitle className="mt-1">{averageOccupancy}%</CardTitle>
        </Card>
      </div>

      <Card className="space-y-3">
        <p className="text-sm font-medium">Блоки площадей</p>
        <div className="divide-y divide-gray-200">
          {blocks.map((block) => (
            <div
              key={block.id}
              className="flex justify-between items-center gap-3 py-2.5 text-sm flex-wrap"
            >
              <div>
                <p className="font-medium">{block.name}</p>
                <p className="text-gray-600">
                  {block.area.toLocaleString("ru-RU")} кв.м · {formatPrice(block.pricePerSqm)}/кв.м
                </p>
              </div>
              <button type="button" onClick={() => toggleBlock(block.id)}>
                <Badge variant={block.open ? "solid" : "outline"}>
                  {block.open ? "Открыто" : "Закрыто"}
                </Badge>
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <OccupancyCalendar
          occupancyByDate={occupancyByDate}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          onDaySelect={(date) => {
            setRangeStart(date);
            setRangeEnd(date);
          }}
        />
      </Card>

      <Card className="space-y-4">
        <div>
          <p className="text-sm font-medium">Период доступности</p>
          <p className="text-sm text-gray-600 mt-1">
            Настройте, когда блоки открыты для бронирования организаторами
          </p>
        </div>
        <BookingDateRangePicker
          label="Период бронирования"
          markedDates={markedDates}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          onRangeChange={(start, end) => {
            setRangeStart(start);
            setRangeEnd(end);
          }}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={bookingOpen}
            onChange={(event) => setBookingOpen(event.target.checked)}
          />
          Открыто для бронирования
        </label>
        <Button
          size="sm"
          onClick={() => showToast("Настройки площадей сохранены", "success")}
        >
          Сохранить
        </Button>
      </Card>
    </div>
  );
}
