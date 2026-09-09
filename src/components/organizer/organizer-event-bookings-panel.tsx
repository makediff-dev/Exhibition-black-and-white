"use client";

import { useMemo, useState } from "react";
import { CalendarDays, MapPin } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { FloorPlanCanvas } from "@/components/venue/floor-plan-canvas";
import {
  SEED_EVENTS,
  SEED_FLOOR_PLAN_PLOTS,
  SEED_HALL_GRID_CONFIGS,
  SEED_HALL_GRID_FEATURES,
  SEED_HALLS,
} from "@/data/mocks/seed";
import type { Booking } from "@/data/types";
import { usePrototypeStore } from "@/lib/store";
import { formatDate, formatShortDate } from "@/lib/utils/formatters";

const PERIOD_LABELS: Record<NonNullable<Booking["periodType"]>, string> = {
  setup: "Монтаж",
  event: "Проведение",
  teardown: "Демонтаж",
};

const STATUS_LABELS: Record<Booking["status"], string> = {
  pending: "Ожидает подтверждения",
  confirmed: "Подтверждено",
  rejected: "Отклонено",
};

interface Props {
  eventId: string;
}

export function OrganizerEventBookingsPanel({ eventId }: Props) {
  const bookings = usePrototypeStore((state) => state.bookings);

  const event = SEED_EVENTS.find((item) => item.id === eventId);
  const eventBookings = useMemo(
    () =>
      bookings
        .filter((booking) => booking.eventId === eventId)
        .sort((a, b) => a.periodStart?.localeCompare(b.periodStart ?? "") ?? 0),
    [bookings, eventId]
  );

  const halls = useMemo(
    () => SEED_HALLS.filter((hall) => hall.venueId === event?.venueId),
    [event?.venueId]
  );

  const bookedHallIds = useMemo(
    () => new Set(eventBookings.map((booking) => booking.hallId).filter(Boolean)),
    [eventBookings]
  );

  const [selectedHallId, setSelectedHallId] = useState<string | null>(null);

  const activeHall = halls.find((hall) => hall.id === selectedHallId);

  const gridConfig = useMemo(() => {
    if (!selectedHallId) return undefined;
    return SEED_HALL_GRID_CONFIGS.find((config) => config.hallId === selectedHallId);
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
            (plot) => plot.hallId === selectedHallId && plot.eventId === eventId
          )
        : [],
    [selectedHallId, eventId]
  );

  const plotStats = useMemo(() => {
    return {
      available: plots.filter((plot) => plot.status === "available").length,
      reserved: plots.filter((plot) => plot.status === "reserved").length,
      paid: plots.filter((plot) => plot.status === "paid").length,
    };
  }, [plots]);

  const pendingCount = eventBookings.filter((booking) => booking.status === "pending").length;

  if (!event) {
    return null;
  }

  return (
    <div className="space-y-6 w-full">
      <Card className="space-y-2">
        <CardTitle className="text-sm">Бронирования площадки</CardTitle>
        <CardDescription>
          Организатор бронирует залы и периоды у площадки в контексте этого мероприятия. Размещение
          экспонентов на участках — на схеме зала ниже.
        </CardDescription>
        {pendingCount > 0 && (
          <Badge variant="solid">{pendingCount} ожидают подтверждения</Badge>
        )}
      </Card>

      {eventBookings.length === 0 ? (
        <Card>
          <CardDescription>Бронирований для этого мероприятия пока нет</CardDescription>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {eventBookings.map((booking) => {
            const hall = SEED_HALLS.find((item) => item.id === booking.hallId);

            return (
              <Card key={booking.id} className="cabinet-card h-full">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge
                    variant={booking.status === "pending" ? "solid" : "outline"}
                  >
                    {STATUS_LABELS[booking.status]}
                  </Badge>
                  {booking.periodType && (
                    <Badge variant="outline">{PERIOD_LABELS[booking.periodType]}</Badge>
                  )}
                </div>

                <CardTitle className="text-base mb-2">
                  {hall?.name ?? "Зал"}
                </CardTitle>

                <CardDescription className="space-y-2">
                  <p className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                    {booking.periodStart && booking.periodEnd
                      ? `${formatShortDate(booking.periodStart)} — ${formatShortDate(booking.periodEnd)}`
                      : formatDate(booking.date)}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {event.venue} · {event.city}
                  </p>
                  {hall && (
                    <p className="text-xs text-gray-500">
                      {hall.area.toLocaleString("ru-RU")} кв.м · до {hall.capacity} мест
                    </p>
                  )}
                </CardDescription>

                {booking.status === "pending" && (
                  <p className="text-xs text-gray-900 font-medium mt-3 border-t border-gray-200 pt-3">
                    Новое бронирование — ожидает ответа площадки
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <CardTitle className="text-sm mb-1">Схема размещения экспонентов</CardTitle>
          <CardDescription>
            Участки на площадке: зелёный — свободен, жёлтый — забронирован, синий — оплачен
          </CardDescription>
        </div>

        {!selectedHallId ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {halls.map((hall) => {
              const hasBooking = bookedHallIds.has(hall.id);
              const hallPlots = SEED_FLOOR_PLAN_PLOTS.filter(
                (plot) => plot.hallId === hall.id && plot.eventId === eventId
              );

              return (
                <button
                  key={hall.id}
                  type="button"
                  onClick={() => setSelectedHallId(hall.id)}
                  className="text-left"
                >
                  <Card hoverable className="cabinet-card h-full">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {hasBooking && <Badge variant="outline">В аренде</Badge>}
                      {hallPlots.length > 0 && (
                        <Badge variant="outline">{hallPlots.length} участков</Badge>
                      )}
                    </div>
                    <CardTitle className="text-base">{hall.name}</CardTitle>
                    <CardDescription>
                      {hall.area.toLocaleString("ru-RU")} кв.м · до {hall.capacity} мест
                    </CardDescription>
                  </Card>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <BackButton onClick={() => setSelectedHallId(null)} />

            <Card className="space-y-2">
              <CardTitle className="text-base">{activeHall?.name}</CardTitle>
              <CardDescription>
                Свободно: {plotStats.available} · Забронировано: {plotStats.reserved} · Оплачено:{" "}
                {plotStats.paid}
              </CardDescription>
            </Card>

            {plots.length > 0 && gridConfig ? (
              <FloorPlanCanvas
                config={gridConfig}
                features={hallFeatures}
                plots={plots}
              />
            ) : (
              <Card>
                <CardDescription>
                  Для этого зала организатор ещё не нарезал участки на схеме
                </CardDescription>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}