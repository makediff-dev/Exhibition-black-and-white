"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Building2, CalendarDays, User } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { VENUE_SERVICE_AUDIENCES, BOOKING_PERIOD_LABELS, BOOKING_STATUS_LABELS } from "@/constants/statuses";
import {
  DEMO_ACCESSIBLE_ACCOUNTS,
  DEMO_USERS,
  SEED_BOOKINGS,
  SEED_EVENT_ORDERS,
  SEED_EVENTS,
  SEED_HALLS,
} from "@/data/mocks/seed";
import type { Booking, Event, VenueServiceAudience } from "@/data/types";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { formatShortDate } from "@/lib/utils/formatters";
import { VenueCabinetHeader } from "@/components/venue/venue-cabinet-header";

const ORGANIZER_ACCOUNTS = [
  DEMO_USERS.organizer,
  ...DEMO_ACCESSIBLE_ACCOUNTS.organizer.filter((account) => account.id !== DEMO_USERS.organizer.id),
];

function getOrganizerName(event: Event) {
  return ORGANIZER_ACCOUNTS.find((account) => account.id === event.organizerId)?.name ?? "—";
}

function getAudienceLabel(id: VenueServiceAudience) {
  return VENUE_SERVICE_AUDIENCES.find((item) => item.id === id)?.label ?? id;
}

function mergeBookings(storedBookings: Booking[]): Booking[] {
  const ids = new Set(storedBookings.map((booking) => booking.id));
  const missing = SEED_BOOKINGS.filter((booking) => !ids.has(booking.id));
  const upgraded = storedBookings.map((booking) => {
    const seed = SEED_BOOKINGS.find((item) => item.id === booking.id);
    if (seed && (!booking.hallId || !booking.periodType)) {
      return { ...seed, status: booking.status };
    }
    return booking;
  });

  return missing.length ? [...upgraded, ...missing] : upgraded;
}

interface Props {
  eventId: string;
  venueId?: string;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

export function VenueEventDetailSection({
  eventId,
  venueId = "venue-1",
  showToast,
}: Props) {
  const { venueEventMeta, venueServices, updateVenueEventMeta, bookings: storeBookings } =
    usePrototypeStore();
  const user = useAuthStore((state) => state.user);
  const searchParams = useSearchParams();
  const fromMessages = searchParams.get("from") === "messages";

  const event = SEED_EVENTS.find((item) => item.id === eventId && item.venueId === venueId);
  const meta = venueEventMeta.find((item) => item.eventId === eventId && item.venueId === venueId);

  const halls = useMemo(
    () =>
      (meta?.hallIds ?? [])
        .map((hallId) => SEED_HALLS.find((hall) => hall.id === hallId))
        .filter(Boolean),
    [meta]
  );

  const services = useMemo(
    () => venueServices.filter((service) => service.venueId === venueId),
    [venueServices, venueId]
  );

  const eventOrdersCount = useMemo(
    () =>
      SEED_EVENT_ORDERS.filter(
        (order) => order.eventId === eventId && order.venueId === venueId
      ).length,
    [eventId, venueId]
  );

  const eventBookings = useMemo(
    () =>
      mergeBookings(storeBookings)
        .filter(
          (booking) =>
            booking.venueId === venueId &&
            booking.eventId === eventId &&
            booking.hallId &&
            booking.periodType
        )
        .sort((a, b) =>
          (a.periodStart ?? a.date).localeCompare(b.periodStart ?? b.date)
        ),
    [storeBookings, venueId, eventId]
  );

  if (!event || !meta) {
    return (
      <EmptyState
        title="Мероприятие не найдено"
        description="Проверьте ссылку или вернитесь к списку мероприятий"
      />
    );
  }

  const toggleService = (serviceId: string) => {
    const active = meta.activeServiceIds.includes(serviceId);
    const activeServiceIds = active
      ? meta.activeServiceIds.filter((id) => id !== serviceId)
      : [...meta.activeServiceIds, serviceId];

    updateVenueEventMeta(meta.id, { activeServiceIds });
    showToast(active ? "Услуга отключена для мероприятия" : "Услуга подключена к мероприятию");
  };

  return (
    <div className="space-y-6 w-full">
      <BackButton fallbackHref={fromMessages ? "/messages" : "/account/venue/events"} className="mb-0" />

      {user ? <VenueCabinetHeader user={user} venueId={venueId} /> : null}

      <h1 className="text-xl font-bold">{event.title}</h1>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardDescription className="space-y-1.5">
              <p className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                {formatShortDate(event.startDate)} — {formatShortDate(event.endDate)}
              </p>
              <p className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 shrink-0" />
                Организатор: {getOrganizerName(event)}
              </p>
              <p className="flex items-start gap-1.5">
                <Building2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                Залы в аренде: {halls.map((hall) => hall!.name).join(", ") || "—"}
              </p>
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link href={`/account/venue/bookings/event/${event.id}`}>
              <Button size="sm" variant="outline">
                Бронирования · {eventBookings.length}
              </Button>
            </Link>
            <Link href={`/account/venue/orders/${event.id}`}>
              <Button size="sm" variant="outline">
                Заказы · {eventOrdersCount}
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <Card>
            <CardDescription>Сдано в аренду</CardDescription>
            <CardTitle className="mt-1">{meta.rentedAreaSqm.toLocaleString("ru-RU")} кв.м</CardTitle>
          </Card>
          <Card>
            <CardDescription>Свободно к сдаче</CardDescription>
            <CardTitle className="mt-1">{meta.freeAreaSqm.toLocaleString("ru-RU")} кв.м</CardTitle>
          </Card>
          <Card>
            <CardDescription>Услуг подключено</CardDescription>
            <CardTitle className="mt-1">{meta.activeServiceIds.length}</CardTitle>
          </Card>
        </div>

        <div className="cabinet-card border border-gray-200 p-3 space-y-1.5">
          <p className="text-sm font-medium">Остатки по площадям</p>
          {meta.availabilityNotes.map((note) => (
            <p key={note} className="text-sm text-gray-700">
              {note}
            </p>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Бронирования</CardTitle>
            <CardDescription>
              Периоды монтажа, проведения и демонтажа по этому мероприятию
            </CardDescription>
          </div>
          {eventBookings.length > 0 ? (
            <Link href={`/account/venue/bookings/event/${event.id}`}>
              <Button size="sm" variant="outline">
                Все бронирования
              </Button>
            </Link>
          ) : null}
        </div>

        {eventBookings.length === 0 ? (
          <p className="text-sm text-gray-600">Бронирований по этому мероприятию пока нет</p>
        ) : (
          <div className="flex flex-col gap-4">
            {eventBookings.map((booking) => {
              const hall = booking.hallId
                ? SEED_HALLS.find((item) => item.id === booking.hallId)
                : undefined;
              const periodLabel = booking.periodType
                ? BOOKING_PERIOD_LABELS[booking.periodType]
                : "Период";

              return (
                <Link
                  key={booking.id}
                  href={`/account/venue/bookings/${booking.id}`}
                  className="block"
                >
                  <Card hoverable className="cabinet-card">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="muted">{periodLabel}</Badge>
                      <Badge variant="solid">{BOOKING_STATUS_LABELS[booking.status]}</Badge>
                    </div>
                    <CardTitle className="text-sm">{hall?.name ??"Зал"}</CardTitle>
                    <CardDescription className="mt-2 space-y-1">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                        {formatShortDate(booking.periodStart ?? booking.date)}
                        {booking.periodEnd && booking.periodEnd !== booking.periodStart
                          ? ` — ${formatShortDate(booking.periodEnd)}`
                          : ""}
                      </span>
                      {booking.organizerName ? (
                        <span className="flex items-start gap-1.5">
                          <User className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          {booking.organizerName}
                        </span>
                      ) : null}
                    </CardDescription>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="space-y-4">
        <div>
          <CardTitle>Услуги площадки на мероприятии</CardTitle>
          <CardDescription>
            Управляйте набором услуг, доступных участникам этого мероприятия
          </CardDescription>
        </div>

        <div className="space-y-3">
          {services.map((service) => {
            const active = meta.activeServiceIds.includes(service.id);

            return (
              <div
                key={service.id}
                className="cabinet-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-gray-200 p-3"
              >
                <div>
                  <p className="font-medium">{service.title}</p>
                  <p className="text-sm text-gray-600">{service.price}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {service.audiences.map((audience) => (
                      <Badge key={audience} variant="muted">
                        {getAudienceLabel(audience)}
                      </Badge>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleService(service.id)}
                  />
                  {active ? "Подключена" : "Отключена"}
                </label>
              </div>
            );
          })}
        </div>

        <Button onClick={() => showToast("Набор услуг для мероприятия сохранён")}>
          Сохранить
        </Button>
      </Card>
    </div>
  );
}