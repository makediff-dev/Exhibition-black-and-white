"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Tabs } from "@/components/ui/tabs";
import { BookingDateRangePicker } from "@/components/venue/booking-date-calendar";
import { FloorPlanCanvas } from "@/components/venue/floor-plan-canvas";
import { OccupancyCalendar } from "@/components/venue/occupancy-calendar";
import { VenueFloorPlanSection } from "@/components/venue/venue-floor-plan-section";
import { VenueSpaceBlockCard } from "@/components/venue/venue-space-block-card";
import {
  SEED_BOOKINGS,
  SEED_HALL_GRID_CONFIGS,
  SEED_HALL_GRID_FEATURES,
  SEED_HALLS,
  SEED_PAVILIONS,
  SEED_VENUE_DAILY_OCCUPANCY,
  SEED_VENUE_INQUIRIES,
  SEED_VENUE_SPACE_BLOCKS,
} from "@/data/mocks/seed";
import type {
  Booking,
  HallGridConfig,
  VenueHall,
  VenuePavilion,
  VenueSpaceBlock,
} from "@/data/types";
import { usePrototypeStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils/formatters";
import { buildVenueDateStatuses, expandIsoDateRange } from "@/lib/utils/venue-date-statuses";

type HallTab = "card" | "sale" | "plan";

const HALL_TABS = [
  { id: "card", label: "Карточка зала" },
  { id: "sale", label: "Продажа" },
  { id: "plan", label: "Схема размещения" },
];

const DEFAULT_GRID = { widthMeters: 32, heightMeters: 12, gridStepMeters: 1 };

function mergeBookings(storedBookings: Booking[]): Booking[] {
  const ids = new Set(storedBookings.map((booking) => booking.id));
  const missing = SEED_BOOKINGS.filter((booking) => !ids.has(booking.id));
  return missing.length ? [...storedBookings, ...missing] : storedBookings;
}

interface Props {
  venueId?: string;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  initialHallTab?: HallTab;
}

export function VenueHallsSection({
  venueId = "venue-1",
  showToast,
  initialHallTab = "card",
}: Props) {
  const storeBookings = usePrototypeStore((state) => state.bookings);
  const storeInquiries = usePrototypeStore((state) => state.venueInquiries);

  const [pavilions, setPavilions] = useState<VenuePavilion[]>(() =>
    SEED_PAVILIONS.filter((item) => item.venueId === venueId)
  );
  const [halls, setHalls] = useState<VenueHall[]>(() =>
    SEED_HALLS.filter((item) => item.venueId === venueId)
  );
  const [blocks, setBlocks] = useState<VenueSpaceBlock[]>(() =>
    SEED_VENUE_SPACE_BLOCKS.filter((block) => block.venueId === venueId)
  );

  const [selectedPavilionId, setSelectedPavilionId] = useState<string | null>(null);
  const [selectedHallId, setSelectedHallId] = useState<string | null>(null);
  const [hallTab, setHallTab] = useState<HallTab>(initialHallTab);
  const [pavilionModalOpen, setPavilionModalOpen] = useState(false);
  const [hallModalOpen, setHallModalOpen] = useState(false);
  const [newPavilionName, setNewPavilionName] = useState("");
  const [newHallName, setNewHallName] = useState("");
  const [newHallArea, setNewHallArea] = useState("1000");
  const [newHallCapacity, setNewHallCapacity] = useState("50");
  const [rangeStart, setRangeStart] = useState("2026-04-01");
  const [rangeEnd, setRangeEnd] = useState("2026-04-01");
  const [bookingOpen, setBookingOpen] = useState(true);

  const selectedPavilion = pavilions.find((item) => item.id === selectedPavilionId);
  const selectedHall = halls.find((item) => item.id === selectedHallId);

  const getHallCount = (pavilionId: string) =>
    halls.filter((hall) => hall.pavilionId === pavilionId).length;

  const getPavilionArea = (pavilionId: string) =>
    halls
      .filter((hall) => hall.pavilionId === pavilionId)
      .reduce((sum, hall) => sum + hall.area, 0);

  const blockForHall = (hallId: string) => blocks.find((block) => block.hallId === hallId);

  const outdoorBlocks = blocks.filter((block) => !block.hallId);

  const hallGridConfig = useMemo((): HallGridConfig => {
    if (!selectedHallId) {
      return { hallId: "draft", ...DEFAULT_GRID };
    }
    return (
      SEED_HALL_GRID_CONFIGS.find((config) => config.hallId === selectedHallId) ?? {
        hallId: selectedHallId,
        ...DEFAULT_GRID,
      }
    );
  }, [selectedHallId]);

  const hallFeatures = useMemo(
    () =>
      selectedHallId
        ? SEED_HALL_GRID_FEATURES.filter((feature) => feature.hallId === selectedHallId)
        : [],
    [selectedHallId]
  );

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

  const isHallOpen = (hall: VenueHall) => {
    const block = blockForHall(hall.id);
    return block ? block.open : hall.available;
  };

  const toggleHallSale = (hall: VenueHall) => {
    const block = blockForHall(hall.id);
    if (block) {
      toggleBlock(block.id);
      return;
    }
    setHalls((current) =>
      current.map((item) =>
        item.id === hall.id ? { ...item, available: !item.available } : item
      )
    );
  };

  const hallCardDescription = (hall: VenueHall) => {
    const block = blockForHall(hall.id);
    const config = SEED_HALL_GRID_CONFIGS.find((item) => item.hallId === hall.id);
    const parts = [
      `${hall.area.toLocaleString("ru-RU")} кв.м`,
      `до ${hall.capacity} мест`,
    ];
    if (config) parts.push(`${config.widthMeters}×${config.heightMeters} м`);
    if (block) parts.push(`${formatPrice(block.pricePerSqm)}/кв.м`);
    return parts.join(" · ");
  };

  const openHall = (hall: VenueHall, tab: HallTab) => {
    setSelectedPavilionId(hall.pavilionId);
    setSelectedHallId(hall.id);
    setHallTab(tab);
  };

  const handleCreatePavilion = () => {
    if (!newPavilionName.trim()) return;

    const pavilion: VenuePavilion = {
      id: `pav-${Date.now()}`,
      venueId,
      name: newPavilionName.trim(),
    };

    setPavilions((current) => [...current, pavilion]);
    setNewPavilionName("");
    setPavilionModalOpen(false);
    showToast("Павильон создан", "success");
  };

  const handleCreateHall = () => {
    if (!newHallName.trim() || !selectedPavilionId) return;

    const hall: VenueHall = {
      id: `hall-${Date.now()}`,
      venueId,
      pavilionId: selectedPavilionId,
      name: newHallName.trim(),
      area: Number(newHallArea) || 1000,
      capacity: Number(newHallCapacity) || 50,
      available: true,
    };

    setHalls((current) => [...current, hall]);
    setNewHallName("");
    setNewHallArea("1000");
    setNewHallCapacity("50");
    setHallModalOpen(false);
    showToast("Зал добавлен", "success");
  };

  const availabilityPanel = (
    <>
      <Card className="space-y-4">
        <div>
          <p className="text-sm font-medium">Период доступности</p>
          <p className="text-sm text-gray-600 mt-1">
            Настройте, когда площади открыты для бронирования организаторами
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
        <Button size="sm" onClick={() => showToast("Настройки площадей сохранены", "success")}>
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
    </>
  );

  if (selectedHall && selectedPavilion) {
    const saleBlock = blockForHall(selectedHall.id);

    return (
      <div className="space-y-6 w-full">
        <div className="space-y-4 mb-2">
          <BackButton
            onClick={() => {
              setSelectedHallId(null);
              setHallTab(initialHallTab);
            }}
            className="mb-0"
          />
          <div>
            <h1 className="text-xl font-bold">{selectedHall.name}</h1>
            <p className="text-sm text-gray-600 mt-1">
              {selectedPavilion.name} · карточка зала, продажа площади и схема размещения
            </p>
          </div>
        </div>

        <Tabs
          className="w-full"
          tabs={HALL_TABS}
          activeTab={hallTab}
          onChange={(id) => setHallTab(id as HallTab)}
        />

        {hallTab === "card" ? (
          <>
            <div className="grid md:grid-cols-3 gap-3">
              <Card>
                <CardTitle>{selectedHall.area.toLocaleString("ru-RU")}</CardTitle>
                <CardDescription>кв.м</CardDescription>
              </Card>
              <Card>
                <CardTitle>{selectedHall.capacity}</CardTitle>
                <CardDescription>мест</CardDescription>
              </Card>
              <Card>
                <CardTitle>
                  {hallGridConfig.widthMeters}×{hallGridConfig.heightMeters} м
                </CardTitle>
                <CardDescription>миллиметровка · шаг 1 м</CardDescription>
              </Card>
            </div>

            <p className="text-sm text-gray-600">
              При аренде организатор может получить зал целиком или часть площади (например, половину
              зала) на даты мероприятия, монтажа (обычно 2–5 дней до) и демонтажа (1–3 дня после).
            </p>

            <Card className="space-y-4">
              <div>
                <p className="text-sm font-medium">Миллиметровка зала</p>
                <p className="text-sm text-gray-600 mt-1">
                  Базовый слой для конструирования площади: сетка 1 м, колонны и проходы
                </p>
              </div>

              <FloorPlanCanvas
                config={hallGridConfig}
                features={hallFeatures}
                showGrid
                showRulers
                showFeatures
              />

              <Button size="sm" onClick={() => showToast("Конфигурация зала сохранена", "success")}>
                Сохранить конфигурацию
              </Button>
            </Card>
          </>
        ) : null}

        {hallTab === "sale" ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <VenueSpaceBlockCard
                title={saleBlock?.name ?? selectedHall.name}
                description={
                  saleBlock
                    ? `${saleBlock.area.toLocaleString("ru-RU")} кв.м · ${formatPrice(saleBlock.pricePerSqm)}/кв.м`
                    : hallCardDescription(selectedHall)
                }
                open={isHallOpen(selectedHall)}
                onToggle={() => toggleHallSale(selectedHall)}
              />
            </div>
            {availabilityPanel}
          </div>
        ) : null}

        {hallTab === "plan" ? (
          <VenueFloorPlanSection
            key={selectedHall.id}
            venueId={venueId}
            hallId={selectedHall.id}
            embedded
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-xl font-bold">Залы и площади</h1>
        <p className="text-sm text-gray-600 mt-1">
          Павильоны и залы, продажа площади и схемы размещения — в одном разделе. Откройте зал,
          чтобы настроить миллиметровку, цены и нарезку участков.
        </p>
      </div>

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

      <Button size="sm" onClick={() => setPavilionModalOpen(true)}>
        <Plus className="h-4 w-4" />
        Создать павильон
      </Button>

      <div className="space-y-12">
      {pavilions.map((pavilion) => {
        const pavilionHalls = halls.filter((hall) => hall.pavilionId === pavilion.id);
        const hallCount = getHallCount(pavilion.id);
        const pavilionArea = getPavilionArea(pavilion.id);

        return (
          <section key={pavilion.id} className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">{pavilion.name}</h2>
                <p className="text-sm text-gray-600 mt-0.5">
                  {pavilion.description ? `${pavilion.description} · ` : ""}
                  {hallCount} {hallCount === 1 ? "зал" : hallCount < 5 ? "зала" : "залов"}
                  {pavilionArea > 0 ? ` · ${pavilionArea.toLocaleString("ru-RU")} кв.м` : ""}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedPavilionId(pavilion.id);
                  setHallModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Добавить зал
              </Button>
            </div>

            {pavilionHalls.length === 0 ? (
              <p className="text-sm text-gray-500">
                В павильоне пока нет залов. Добавьте первый зал и настройте его на миллиметровке.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pavilionHalls.map((hall) => (
                  <VenueSpaceBlockCard
                    key={hall.id}
                    title={hall.name}
                    description={hallCardDescription(hall)}
                    open={isHallOpen(hall)}
                    onOpen={() => openHall(hall, "card")}
                    onToggle={() => toggleHallSale(hall)}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}

      {outdoorBlocks.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Другие площади</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {outdoorBlocks.map((block) => (
              <VenueSpaceBlockCard
                key={block.id}
                title={block.name}
                description={`${block.area.toLocaleString("ru-RU")} кв.м · ${formatPrice(block.pricePerSqm)}/кв.м`}
                open={block.open}
                onToggle={() => toggleBlock(block.id)}
              />
            ))}
          </div>
        </section>
      ) : null}
      </div>

      {availabilityPanel}

      <Modal
        open={pavilionModalOpen}
        onClose={() => setPavilionModalOpen(false)}
        title="Создать павильон"
        footer={
          <>
            <Button variant="outline" onClick={() => setPavilionModalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreatePavilion}>Создать</Button>
          </>
        }
      >
        <Input
          label="Название павильона"
          value={newPavilionName}
          onChange={(event) => setNewPavilionName(event.target.value)}
          placeholder="Павильон 3"
        />
      </Modal>

      <Modal
        open={hallModalOpen}
        onClose={() => setHallModalOpen(false)}
        title="Добавить зал"
        footer={
          <>
            <Button variant="outline" onClick={() => setHallModalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreateHall}>Создать</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Название зала"
            value={newHallName}
            onChange={(event) => setNewHallName(event.target.value)}
            placeholder="Зал 3 — конференц-зона"
          />
          <Input
            label="Площадь, кв.м"
            type="number"
            value={newHallArea}
            onChange={(event) => setNewHallArea(event.target.value)}
          />
          <Input
            label="Вместимость, мест"
            type="number"
            value={newHallCapacity}
            onChange={(event) => setNewHallCapacity(event.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}
