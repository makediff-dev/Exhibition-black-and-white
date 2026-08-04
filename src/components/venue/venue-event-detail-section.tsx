"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Building2, CalendarDays, User } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { VENUE_SERVICE_AUDIENCES } from "@/constants/statuses";
import {
  DEMO_ACCESSIBLE_ACCOUNTS,
  DEMO_USERS,
  SEED_EVENTS,
  SEED_HALLS,
} from "@/data/mocks/seed";
import type { Event, VenueServiceAudience } from "@/data/types";
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
  const { venueEventMeta, venueServices, updateVenueEventMeta } = usePrototypeStore();
  const user = useAuthStore((state) => state.user);

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
    <div className="space-y-6 max-w-4xl">
      <BackButton fallbackHref="/account/venue/events" className="mb-0" />

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
          <Link href={`/events/${event.id}`}>
            <Button size="sm" variant="outline">
              Публичная страница
            </Button>
          </Link>
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

        <div className="border border-gray-200 p-3 space-y-1.5">
          <p className="text-sm font-medium">Остатки по площадям</p>
          {meta.availabilityNotes.map((note) => (
            <p key={note} className="text-sm text-gray-700">
              {note}
            </p>
          ))}
        </div>
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
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-gray-200 p-3"
              >
                <div>
                  <p className="font-medium">{service.title}</p>
                  <p className="text-sm text-gray-600">{service.price}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {service.audiences.map((audience) => (
                      <Badge key={audience} variant="outline">
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
