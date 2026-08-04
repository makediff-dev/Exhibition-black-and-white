"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Building2, CalendarDays, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { DEMO_ACCESSIBLE_ACCOUNTS, DEMO_USERS, SEED_EVENTS, SEED_HALLS } from "@/data/mocks/seed";
import type { Event } from "@/data/types";
import { usePrototypeStore } from "@/lib/store";
import { formatShortDate } from "@/lib/utils/formatters";

const ORGANIZER_ACCOUNTS = [
  DEMO_USERS.organizer,
  ...DEMO_ACCESSIBLE_ACCOUNTS.organizer.filter((account) => account.id !== DEMO_USERS.organizer.id),
];

function getOrganizerName(event: Event) {
  return ORGANIZER_ACCOUNTS.find((account) => account.id === event.organizerId)?.name ?? "—";
}

function getMonthLabel(date: string) {
  return new Intl.DateTimeFormat("ru-RU", { month: "long" }).format(new Date(date));
}

interface Props {
  venueId?: string;
}

export function VenueEventsSection({ venueId = "venue-1" }: Props) {
  const venueEventMeta = usePrototypeStore((state) => state.venueEventMeta);

  const events = useMemo(() => {
    return SEED_EVENTS.filter((event) => event.venueId === venueId)
      .map((event) => {
        const meta = venueEventMeta.find((item) => item.eventId === event.id);
        const halls = (meta?.hallIds ?? [])
          .map((hallId) => SEED_HALLS.find((hall) => hall.id === hallId))
          .filter(Boolean);

        return { event, meta, halls };
      })
      .sort((a, b) => a.event.startDate.localeCompare(b.event.startDate));
  }, [venueId, venueEventMeta]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {events.map(({ event, meta, halls }) => {
        const lowAvailability = meta && meta.freeAreaSqm > 0 && meta.freeAreaSqm < 500;

        return (
          <Link key={event.id} href={`/account/venue/events/${event.id}`} className="block h-full">
            <Card className="h-full hover:border-gray-900 transition-colors">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="outline">
                  {event.category === "exhibition"
                    ? "Выставка"
                    : event.category === "forum"
                      ? "Форум"
                      : "Конференция"}
                </Badge>
                {lowAvailability && (
                  <Badge variant="solid">Мало свободной площади</Badge>
                )}
              </div>

              <CardTitle className="mb-2">{event.title}</CardTitle>

              <CardDescription className="space-y-2">
                <p className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                  {formatShortDate(event.startDate)} — {formatShortDate(event.endDate)}
                  <span className="text-gray-500">· {getMonthLabel(event.startDate)}</span>
                </p>

                <p className="flex items-start gap-1.5">
                  <User className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  {getOrganizerName(event)}
                </p>

                {halls.length > 0 && (
                  <p className="flex items-start gap-1.5">
                    <Building2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>
                      {halls.map((hall) => hall!.name).join(", ")}
                      {meta && (
                        <span className="block text-xs text-gray-500 mt-0.5">
                          В аренде: {meta.rentedAreaSqm.toLocaleString("ru-RU")} кв.м
                        </span>
                      )}
                    </span>
                  </p>
                )}
              </CardDescription>

              {meta && (
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-1.5">
                  {meta.availabilityNotes.map((note) => (
                    <p
                      key={note}
                      className={`text-xs ${
                        note.toLowerCase().includes("свобод")
                          ? "text-gray-900 font-medium"
                          : "text-gray-500"
                      }`}
                    >
                      {note}
                    </p>
                  ))}
                  <p className="text-xs text-gray-500">
                    Свободно: {meta.freeAreaSqm.toLocaleString("ru-RU")} кв.м
                  </p>
                </div>
              )}
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
