"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Building2, CalendarDays, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { Select } from "@/components/ui/select";
import {
  SEED_BOOKINGS,
  SEED_EVENTS,
  SEED_HALLS,
  SEED_VENUE_INQUIRIES,
} from "@/data/mocks/seed";
import type { Booking, VenueBookingDateStatus, VenueInquiry } from "@/data/types";
import { usePrototypeStore } from "@/lib/store";
import { formatShortDate } from "@/lib/utils/formatters";
import {
  getEventVenueStatuses,
  getMonthKey,
  getMonthLabel,
  getYearMonthKeys,
  VENUE_BOOKING_DATE_STATUS_META,
} from "@/lib/utils/venue-date-statuses";
import { cn } from "@/lib/utils/cn";

const STATUS_FILTER_OPTIONS: Array<{ value: "" | VenueBookingDateStatus; label: string }> = [
  { value: "", label: "Все статусы" },
  { value: "rented", label: "Арендовано" },
  { value: "booked", label: "Бронирование" },
  { value: "negotiating", label: "Переговоры" },
];

function mergeBookings(storedBookings: Booking[]): Booking[] {
  const ids = new Set(storedBookings.map((booking) => booking.id));
  const missing = SEED_BOOKINGS.filter((booking) => !ids.has(booking.id));
  return missing.length ? [...storedBookings, ...missing] : storedBookings;
}

function mergeInquiries(storedInquiries: VenueInquiry[]): VenueInquiry[] {
  const ids = new Set(storedInquiries.map((item) => item.id));
  const missing = SEED_VENUE_INQUIRIES.filter((item) => !ids.has(item.id));
  return missing.length ? [...storedInquiries, ...missing] : storedInquiries;
}

interface Props {
  organizerId?: string;
}

export function OrganizerEventsSection({ organizerId = "user-organizer" }: Props) {
  const venueEventMeta = usePrototypeStore((state) => state.venueEventMeta);
  const storeBookings = usePrototypeStore((state) => state.bookings);
  const storeInquiries = usePrototypeStore((state) => state.venueInquiries);

  const [statusFilter, setStatusFilter] = useState<"" | VenueBookingDateStatus>("");
  const [activeMonth, setActiveMonth] = useState("all");

  const bookings = useMemo(() => mergeBookings(storeBookings), [storeBookings]);
  const inquiries = useMemo(() => mergeInquiries(storeInquiries), [storeInquiries]);

  const events = useMemo(() => {
    return SEED_EVENTS.filter((event) => event.organizerId === organizerId)
      .map((event) => {
        const meta = venueEventMeta.find(
          (item) => item.eventId === event.id && item.venueId === event.venueId
        );
        const halls = (meta?.hallIds ?? [])
          .map((hallId) => SEED_HALLS.find((hall) => hall.id === hallId))
          .filter(Boolean);
        const statuses = getEventVenueStatuses(event, bookings, inquiries, Boolean(meta));
        const pendingBookings = bookings.filter(
          (booking) => booking.eventId === event.id && booking.status === "pending"
        ).length;

        return { event, meta, halls, statuses, pendingBookings };
      })
      .sort((a, b) => a.event.startDate.localeCompare(b.event.startDate));
  }, [organizerId, venueEventMeta, bookings, inquiries]);

  const calendarYear = useMemo(() => {
    if (!events.length) return 2026;
    return new Date(events[0].event.startDate).getFullYear();
  }, [events]);

  const monthKeys = useMemo(() => getYearMonthKeys(calendarYear), [calendarYear]);

  const eventCountByMonth = useMemo(() => {
    const counts = new Map<string, number>();
    events.forEach(({ event }) => {
      const key = getMonthKey(event.startDate);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return counts;
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter(({ event, statuses }) => {
      const monthMatch = activeMonth === "all" || getMonthKey(event.startDate) === activeMonth;
      const statusMatch = !statusFilter || statuses.includes(statusFilter);
      return monthMatch && statusMatch;
    });
  }, [events, activeMonth, statusFilter]);

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-600">
            Список привязан к календарю — фильтруйте по месяцу и статусу аренды,
            бронирования или переговоров.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/account/organizer/venues"
            className="text-sm underline hover:text-gray-900"
          >
            Площадки проведения
          </Link>
          <Link href="/account/organizer/create-event">
            <Button size="sm">Создать мероприятие</Button>
          </Link>
        </div>
      </div>

      <Select
        label="Статус"
        value={statusFilter}
        onChange={(event) =>
          setStatusFilter(event.target.value as "" | VenueBookingDateStatus)
        }
        options={STATUS_FILTER_OPTIONS}
        className="max-w-xs w-full"
      />

      <div className="space-y-3">
        <p className="text-sm font-medium">Календарь</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveMonth("all")}
            className={cn(
              "cabinet-chip px-3 py-1.5 text-sm border transition-colors",
              activeMonth === "all"
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-300 bg-white hover:border-gray-900"
            )}
          >
            Все месяцы
          </button>
          {monthKeys.map((key) => {
            const count = eventCountByMonth.get(key) ?? 0;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveMonth(key)}
                className={cn(
                  "cabinet-chip px-3 py-1.5 text-sm border transition-colors",
                  activeMonth === key
                    ? "border-gray-900 bg-gray-900 text-white"
                    : count > 0
                      ? "border-gray-300 bg-white hover:border-gray-900"
                      : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-400"
                )}
              >
                {getMonthLabel(key)}
              </button>
            );
          })}
        </div>
        <p className="text-sm text-gray-600">
          {activeMonth === "all"
            ? `Показано ${filteredEvents.length} из ${events.length} мероприятий`
            : `В ${getMonthLabel(activeMonth).toLowerCase()} — ${filteredEvents.length} мероприятий`}
        </p>
      </div>

      {filteredEvents.length === 0 ? (
        <EmptyState
          title="Нет мероприятий по фильтру"
          description="Измените месяц или статус, чтобы увидеть другие события"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.map(({ event, meta, halls, statuses, pendingBookings }) => {
            const lowAvailability = meta && meta.freeAreaSqm > 0 && meta.freeAreaSqm < 500;

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
                <Card hoverable className="cabinet-card h-full">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="outline">
                      {event.category === "exhibition"
                        ? "Выставка"
                        : event.category === "forum"
                          ? "Форум"
                          : "Конференция"}
                    </Badge>
                    {statuses.map((status) => (
                      <Badge key={`${event.id}-${status}`} variant="solid">
                        {VENUE_BOOKING_DATE_STATUS_META[status].label}
                      </Badge>
                    ))}
                    {lowAvailability && <Badge variant="outline">Мало свободной площади</Badge>}
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
                      <span className="text-gray-500">
                        · {getMonthLabel(getMonthKey(event.startDate))}
                      </span>
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
      )}
    </div>
  );
}