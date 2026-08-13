"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { BookingDateRangePicker } from "@/components/venue/booking-date-calendar";
import { OccupancyCalendar } from "@/components/venue/occupancy-calendar";
import {
  SEED_BOOKINGS,
  SEED_VENUE_DAILY_OCCUPANCY,
  SEED_VENUE_INQUIRIES,
  SEED_VENUE_SPACE_BLOCKS,
} from "@/data/mocks/seed";
import type { Booking, VenueSpaceBlock } from "@/data/types";
import { usePrototypeStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils/formatters";
import { buildVenueDateStatuses, expandIsoDateRange } from "@/lib/utils/venue-date-statuses";

function mergeBookings(storedBookings: Booking[]): Booking[] {
  const ids = new Set(storedBookings.map((booking) => booking.id));
  const missing = SEED_BOOKINGS.filter((booking) => !ids.has(booking.id));
  return missing.length ? [...storedBookings, ...missing] : storedBookings;
}

interface Props {
  venueId?: string;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

export function VenueSpacesSection({ venueId = "venue-1", showToast }: Props) {
  const storeBookings = usePrototypeStore((state) => state.bookings);
  const storeInquiries = usePrototypeStore((state) => state.venueInquiries);

  const [rangeStart, setRangeStart] = useState("2026-04-01");
  const [rangeEnd, setRangeEnd] = useState("2026-04-01");
  const [blocks, setBlocks] = useState<VenueSpaceBlock[]>(() =>
    SEED_VENUE_SPACE_BLOCKS.filter((block) => block.venueId === venueId)
  );
  const [bookingOpen, setBookingOpen] = useState(true);

  const bookings = useMemo(() => mergeBookings(storeBookings), [storeBookings]);

  const inquiries = useMemo(() => {
    const ids = new Set(storeInquiries.map((item) => item.id));
    const missing = SEED_VENUE_INQUIRIES.filter((item) => !ids.has(item.id));
    return missing.length ? [...storeInquiries, ...missing] : storeInquiries;
  }, [storeInquiries]);

  const dateStatuses = useMemo(
    () => buildVenueDateStatuses(venueId, bookings, inquiries),
    [venueId, bookings, inquiries]
  );

  const occupancyByDate = useMemo(() => {
    return Object.fromEntries(
      SEED_VENUE_DAILY_OCCUPANCY.filter((item) => item.venueId === venueId).map((item) => [
        item.date,
        item.percent,
      ])
    );
  }, [venueId]);

  const selectedDates = useMemo(
    () => expandIsoDateRange(rangeStart, rangeEnd),
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
    <div className="space-y-6 w-full">
      <p className="text-sm text-gray-600">
        Управление продаваемой площадью: сколько кв.м доступно к бронированию, по какой цене
        и в какой период. Это ваш «склад» площадей — в отличие от «Схемы размещения», где вы
        работаете с конкретными местами на плане. Даты — постоянный верхний уровень: как при
        бронировании отеля, организатор выбирает площадку и период, после чего видит
        доступность и цены.
      </p>

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

      <Card className="space-y-4">
        <div>
          <p className="text-sm font-medium">Период доступности</p>
          <p className="text-sm text-gray-600 mt-1">
            Настройте, когда блоки открыты для бронирования организаторами
          </p>
        </div>
        <BookingDateRangePicker
          label="Период бронирования"
          inline
          showLegend
          dateStatuses={dateStatuses}
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
    </div>
  );
}
