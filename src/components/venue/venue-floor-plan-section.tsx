"use client";

import { useMemo, useState } from "react";
import { BackButton } from "@/components/ui/back-button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import {
  FloorPlanCanvas,
  getHallFeaturesForPlot,
  getPlotDetailConfig,
  getPlotDetailFeatures,
} from "@/components/venue/floor-plan-canvas";
import {
  SEED_EVENTS,
  SEED_FLOOR_PLAN_PLOTS,
  SEED_HALL_GRID_CONFIGS,
  SEED_HALL_GRID_FEATURES,
  SEED_HALLS,
} from "@/data/mocks/seed";
import type { CompanyProfile } from "@/data/types";
import { VenueCabinetHeader } from "@/components/venue/venue-cabinet-header";
import { useAuthStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils/formatters";

interface Props {
  venueId?: string;
}

const PLOT_STATUS_LABELS = {
  available: "Свободно",
  reserved: "Забронировано",
  paid: "Оплачено",
  unavailable: "Недоступно",
} as const;

function FloorPlanPageHeader({
  onBack,
  subtitle,
  description,
  user,
}: {
  onBack?: () => void;
  subtitle?: string;
  description?: string;
  user?: CompanyProfile | null;
}) {
  return (
    <div className="space-y-4 mb-2">
      {onBack ? <BackButton onClick={onBack} className="mb-0" /> : null}
      {user ? <VenueCabinetHeader user={user} /> : null}
      <div>
        <h1 className="text-xl font-bold">Схема размещения</h1>
        {subtitle ? <h2 className="text-lg font-semibold mt-2">{subtitle}</h2> : null}
        {description ? <p className="text-sm text-gray-600 mt-1">{description}</p> : null}
      </div>
    </div>
  );
}

export function VenueFloorPlanSection({ venueId = "venue-1" }: Props) {
  const user = useAuthStore((state) => state.user);
  const halls = useMemo(
    () => SEED_HALLS.filter((hall) => hall.venueId === venueId),
    [venueId]
  );

  const events = useMemo(
    () => SEED_EVENTS.filter((event) => event.venueId === venueId && event.bookingAvailable),
    [venueId]
  );

  const [selectedHallId, setSelectedHallId] = useState<string | null>(null);
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
  const [activeEventId, setActiveEventId] = useState(events[0]?.id ?? "evt-1");

  const activeHall = halls.find((hall) => hall.id === selectedHallId);

  const gridConfig = useMemo(() => {
    if (!selectedHallId) return SEED_HALL_GRID_CONFIGS[0];
    return (
      SEED_HALL_GRID_CONFIGS.find((config) => config.hallId === selectedHallId) ??
      SEED_HALL_GRID_CONFIGS[0]
    );
  }, [selectedHallId]);

  const hallFeatures = useMemo(
    () =>
      selectedHallId
        ? SEED_HALL_GRID_FEATURES.filter((feature) => feature.hallId === selectedHallId)
        : [],
    [selectedHallId]
  );

  const plots = useMemo(
    () =>
      selectedHallId
        ? SEED_FLOOR_PLAN_PLOTS.filter(
            (plot) => plot.hallId === selectedHallId && plot.eventId === activeEventId
          )
        : [],
    [selectedHallId, activeEventId]
  );

  const selectedPlot = plots.find((plot) => plot.id === selectedPlotId);

  const stats = useMemo(() => {
    const available = plots.filter((plot) => plot.status === "available").length;
    const reserved = plots.filter((plot) => plot.status === "reserved").length;
    const paid = plots.filter((plot) => plot.status === "paid").length;

    return { available, reserved, paid, total: plots.length };
  }, [plots]);

  const getHallPlotCount = (hallId: string) =>
    SEED_FLOOR_PLAN_PLOTS.filter((plot) => plot.hallId === hallId).length;

  const getHallGridConfig = (hallId: string) =>
    SEED_HALL_GRID_CONFIGS.find((config) => config.hallId === hallId);

  const plotDetailFeatures = useMemo(() => {
    if (!selectedPlot) return [];
    const hallInside = getHallFeaturesForPlot(hallFeatures, selectedPlot);
    const internal = getPlotDetailFeatures(selectedPlot);
    return [...hallInside, ...internal];
  }, [selectedPlot, hallFeatures]);

  if (!selectedHallId) {
    return (
      <div className="space-y-6 w-full">
        <FloorPlanPageHeader
          description="Выберите зал, чтобы открыть схему размещения. Организатор нарезает площадь на участки — нажмите на участок, чтобы увидеть детальную миллиметровку и заполнение."
          user={user}
        />

        <div className="space-y-3">
          <p className="text-sm font-medium">Залы площадки</p>
          <div className="grid md:grid-cols-3 gap-3">
            {halls.map((hall) => {
              const config = getHallGridConfig(hall.id);
              const plotCount = getHallPlotCount(hall.id);

              return (
                <button
                  key={hall.id}
                  type="button"
                  onClick={() => setSelectedHallId(hall.id)}
                  className="text-left h-full"
                >
                  <Card className="h-full">
                    <CardTitle>{hall.name}</CardTitle>
                    <CardDescription>
                      {hall.area.toLocaleString("ru-RU")} кв.м · до {hall.capacity} мест
                      {config ? ` · ${config.widthMeters}×${config.heightMeters} м` : ""}
                      {plotCount > 0 ? ` · ${plotCount} участков` : " · без нарезки"}
                    </CardDescription>
                  </Card>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (selectedPlot) {
    const totalPrice = selectedPlot.area * selectedPlot.pricePerSqm;
    const detailConfig = getPlotDetailConfig(selectedPlot);

    return (
      <div className="space-y-6 w-full">
        <FloorPlanPageHeader
          onBack={() => setSelectedPlotId(null)}
          subtitle={`Участок ${selectedPlot.label}`}
          description={`Детальная миллиметровка участка · ${selectedPlot.width}×${selectedPlot.height} м`}
          user={user}
        />

        <div className="grid md:grid-cols-4 gap-3">
          <Card>
            <CardTitle>{PLOT_STATUS_LABELS[selectedPlot.status]}</CardTitle>
            <CardDescription>Статус</CardDescription>
          </Card>
          <Card>
            <CardTitle>{selectedPlot.area} кв.м</CardTitle>
            <CardDescription>Площадь</CardDescription>
          </Card>
          <Card>
            <CardTitle>
              {selectedPlot.status === "unavailable"
                ? "—"
                : formatPrice(selectedPlot.pricePerSqm) + "/кв.м"}
            </CardTitle>
            <CardDescription>Цена</CardDescription>
          </Card>
          <Card>
            <CardTitle>
              {selectedPlot.status === "unavailable" ? "—" : formatPrice(totalPrice)}
            </CardTitle>
            <CardDescription>Итого</CardDescription>
          </Card>
        </div>

        {selectedPlot.status === "paid" && selectedPlot.companyName ? (
          <p className="text-sm text-gray-600">
            Участник: <span className="font-medium text-gray-900">{selectedPlot.companyName}</span>
          </p>
        ) : null}

        {selectedPlot.status === "reserved" ? (
          <p className="text-sm text-gray-500">
            Участник забронировал участок, но ещё не оплатил — имя скрыто на общем плане.
          </p>
        ) : null}

        <Card className="space-y-4">
          <div>
            <p className="text-sm font-medium">Миллиметровка участка</p>
            <p className="text-sm text-gray-600 mt-1">
              Сетка с шагом 1 м, зоны стенда и инфраструктура внутри участка
            </p>
          </div>

          <FloorPlanCanvas
            config={detailConfig}
            features={plotDetailFeatures}
            showGrid
            showRulers
            showFeatures
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <FloorPlanPageHeader
        onBack={() => {
          setSelectedHallId(null);
          setSelectedPlotId(null);
        }}
        subtitle={activeHall?.name}
        description="Общий план зала — нажмите на участок, чтобы открыть детальную схему"
        user={user}
      />

      <Select
        label="Мероприятие"
        value={activeEventId}
        onChange={(event) => setActiveEventId(event.target.value)}
        options={events.map((event) => ({ value: event.id, label: event.title }))}
      />

      {plots.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-3">
          <Card>
            <CardTitle>{stats.total}</CardTitle>
            <CardDescription>Участков</CardDescription>
          </Card>
          <Card>
            <CardTitle>{stats.available}</CardTitle>
            <CardDescription>Свободно</CardDescription>
          </Card>
          <Card>
            <CardTitle>
              {stats.reserved} / {stats.paid}
            </CardTitle>
            <CardDescription>Забронировано / оплачено</CardDescription>
          </Card>
        </div>
      ) : null}

      <Card className="space-y-4">
        {plots.length === 0 ? (
          <p className="text-sm text-gray-500">
            Организатор ещё не нарезал участки для этого мероприятия.
          </p>
        ) : (
          <>
            <p className="text-sm text-gray-600">
              Нажмите на участок — откроется детальный план с миллиметровкой
            </p>
            <FloorPlanCanvas
              config={gridConfig}
              plots={plots}
              showGrid={false}
              showRulers={false}
              showFeatures={false}
              onPlotClick={(plot) => setSelectedPlotId(plot.id)}
            />
          </>
        )}
      </Card>
    </div>
  );
}