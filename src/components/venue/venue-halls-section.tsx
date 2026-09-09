"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { FloorPlanCanvas } from "@/components/venue/floor-plan-canvas";
import {
  SEED_HALL_GRID_CONFIGS,
  SEED_HALL_GRID_FEATURES,
  SEED_HALLS,
  SEED_PAVILIONS,
} from "@/data/mocks/seed";
import type { CompanyProfile, HallGridConfig, VenueHall, VenuePavilion } from "@/data/types";
import { VenueCabinetHeader } from "@/components/venue/venue-cabinet-header";
import { useAuthStore } from "@/lib/store";

interface Props {
  venueId?: string;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

function HallsPageHeader({
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
        <h1 className="text-xl font-bold">Площадки и залы</h1>
        {subtitle ? <h2 className="text-lg font-semibold mt-2">{subtitle}</h2> : null}
        {description ? <p className="text-sm text-gray-600 mt-1">{description}</p> : null}
      </div>
    </div>
  );
}

const DEFAULT_GRID = { widthMeters: 32, heightMeters: 12, gridStepMeters: 1 };

export function VenueHallsSection({ venueId = "venue-1", showToast }: Props) {
  const user = useAuthStore((state) => state.user);
  const [pavilions, setPavilions] = useState<VenuePavilion[]>(() =>
    SEED_PAVILIONS.filter((item) => item.venueId === venueId)
  );
  const [halls, setHalls] = useState<VenueHall[]>(() =>
    SEED_HALLS.filter((item) => item.venueId === venueId)
  );

  const [selectedPavilionId, setSelectedPavilionId] = useState<string | null>(null);
  const [selectedHallId, setSelectedHallId] = useState<string | null>(null);
  const [pavilionModalOpen, setPavilionModalOpen] = useState(false);
  const [hallModalOpen, setHallModalOpen] = useState(false);
  const [newPavilionName, setNewPavilionName] = useState("");
  const [newHallName, setNewHallName] = useState("");
  const [newHallArea, setNewHallArea] = useState("1000");
  const [newHallCapacity, setNewHallCapacity] = useState("50");

  const selectedPavilion = pavilions.find((item) => item.id === selectedPavilionId);
  const selectedHall = halls.find((item) => item.id === selectedHallId);

  const pavilionHalls = useMemo(
    () => halls.filter((hall) => hall.pavilionId === selectedPavilionId),
    [halls, selectedPavilionId]
  );

  const getHallCount = (pavilionId: string) =>
    halls.filter((hall) => hall.pavilionId === pavilionId).length;

  const getPavilionArea = (pavilionId: string) =>
    halls
      .filter((hall) => hall.pavilionId === pavilionId)
      .reduce((sum, hall) => sum + hall.area, 0);

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

  if (selectedHall && selectedPavilion) {
    return (
      <div className="space-y-6 w-full">
        <HallsPageHeader
          onBack={() => setSelectedHallId(null)}
          subtitle={selectedHall.name}
          description="Конфигурация зала на миллиметровке — колонны, входы, выходы и границы аренды"
          user={user}
        />

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
      </div>
    );
  }

  if (selectedPavilion) {
    const totalArea = getPavilionArea(selectedPavilion.id);

    return (
      <div className="space-y-6 w-full">
        <HallsPageHeader
          onBack={() => {
            setSelectedPavilionId(null);
            setSelectedHallId(null);
          }}
          subtitle={selectedPavilion.name}
          description="Залы внутри павильона — нажмите на зал, чтобы открыть миллиметровку и настроить конфигурацию"
          user={user}
        />

        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm" onClick={() => setHallModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Добавить зал
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <Card>
            <CardTitle>{pavilionHalls.length}</CardTitle>
            <CardDescription>Залов</CardDescription>
          </Card>
          <Card>
            <CardTitle>{totalArea.toLocaleString("ru-RU")}</CardTitle>
            <CardDescription>кв.м суммарно</CardDescription>
          </Card>
          <Card>
            <CardTitle>{pavilionHalls.filter((hall) => hall.available).length}</CardTitle>
            <CardDescription>Доступны к аренде</CardDescription>
          </Card>
        </div>

        {pavilionHalls.length === 0 ? (
          <p className="text-sm text-gray-500">
            В павильоне пока нет залов. Добавьте первый зал и настройте его на миллиметровке.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {pavilionHalls.map((hall) => {
              const config = SEED_HALL_GRID_CONFIGS.find((item) => item.hallId === hall.id);

              return (
                <button
                  key={hall.id}
                  type="button"
                  onClick={() => setSelectedHallId(hall.id)}
                  className="text-left"
                >
                  <Card hoverable className="cabinet-card">
                    <CardTitle>{hall.name}</CardTitle>
                    <CardDescription>
                      {hall.area.toLocaleString("ru-RU")} кв.м · до {hall.capacity} мест
                      {config ? ` · ${config.widthMeters}×${config.heightMeters} м` : ""}
                    </CardDescription>
                    <div className="cabinet-card h-16 border border-dashed border-gray-300 mt-3 flex items-center justify-center text-xs text-gray-400">
                      {config ? "Миллиметровка настроена" : "Настроить миллиметровку"}
                    </div>
                  </Card>
                </button>
              );
            })}
          </div>
        )}

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
          <div className="space-y-3">
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

  return (
    <div className="space-y-6 w-full">
      <HallsPageHeader
        description="Павильоны площадки и залы внутри них. Добавьте павильон, затем залы и нарисуйте конфигурацию на миллиметровке с шагом 1 м."
        user={user}
      />

      <Button size="sm" onClick={() => setPavilionModalOpen(true)}>
        <Plus className="h-4 w-4" />
        Создать павильон
      </Button>

      <div className="flex flex-col gap-4">
        {pavilions.map((pavilion) => {
          const hallCount = getHallCount(pavilion.id);
          const totalArea = getPavilionArea(pavilion.id);

          return (
            <button
              key={pavilion.id}
              type="button"
              onClick={() => setSelectedPavilionId(pavilion.id)}
              className="text-left"
            >
              <Card hoverable className="cabinet-card">
                <CardTitle>{pavilion.name}</CardTitle>
                <CardDescription>
                  {hallCount} {hallCount === 1 ? "зал" : hallCount < 5 ? "зала" : "залов"}
                  {totalArea > 0 ? ` · ${totalArea.toLocaleString("ru-RU")} кв.м` : ""}
                </CardDescription>
                {pavilion.description ? (
                  <p className="text-xs text-gray-500 mt-2">{pavilion.description}</p>
                ) : null}
                <div className="cabinet-card h-20 border border-dashed border-gray-300 mt-3 flex items-center justify-center text-xs text-gray-400">
                  Фото-заглушка
                </div>
              </Card>
            </button>
          );
        })}
      </div>

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
    </div>
  );
}