"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Building2, CalendarDays, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { SEED_EVENTS, SEED_HALLS } from "@/data/mocks/seed";
import { usePrototypeStore } from "@/lib/store";
import { formatShortDate } from "@/lib/utils/formatters";

function getMonthLabel(date: string) {
  return new Intl.DateTimeFormat("ru-RU", { month: "long" }).format(new Date(date));
}

interface Props {
  organizerId?: string;
}

export function OrganizerEventsSection({ organizerId = "user-organizer" }: Props) {
  const venueEventMeta = usePrototypeStore((state) => state.venueEventMeta);
  const bookings = usePrototypeStore((state) => state.bookings);

  const events = useMemo(() => {
    return SEED_EVENTS.filter((event) => event.organizerId === organizerId)
      .map((event) => {
        const meta = venueEventMeta.find(
          (item) => item.eventId === event.id && item.venueId === event.venueId
        );
        const halls = (meta?.hallIds ?? [])
          .map((hallId) => SEED_HALLS.find((hall) => hall.id === hallId))
          .filter(Boolean);

        return { event, meta, halls };
      })
      .sort((a, b) => a.event.startDate.localeCompare(b.event.startDate));
  }, [organizerId, venueEventMeta]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {events.map(({ event, meta, halls }) => {
        const lowAvailability = meta && meta.freeAreaSqm > 0 && meta.freeAreaSqm < 500;
        const pendingBookings = bookings.filter(
          (booking) => booking.eventId === event.id && booking.status === "pending"
        ).length;

        return (
          <Link
            key={event.id}
            href={
              pendingBookings > 0
                ? `/account/organizer/edit-event?id=${event.id}&tab=bookings`
                : `/account/organizer/edit-event?id=${event.id}`
            }
            className="block h-full"
          >
            <Card className="h-full hover:border-gray-900 transition-colors">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="outline">
                  {event.category === "exhibition"
                    ? "Выставка"
                    : event.category === "forum"
                      ? "Форум"
                      : "Конференция"}
                </Badge>
                {lowAvailability && <Badge variant="solid">Мало свободной площади</Badge>}
                {pendingBookings > 0 && (
                  <Badge variant="solid">
                    {pendingBookings} нов{pendingBookings === 1 ? "ое" : "ых"} бронирован
                    {pendingBookings === 1 ? "ие" : "ия"}
                  </Badge>
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
                  <Building2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  {event.venue}
                  <span className="text-gray-500">· {event.city}</span>
                </p>

                {halls.length > 0 && (
                  <p className="flex items-start gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
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
