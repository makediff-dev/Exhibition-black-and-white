"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { CardField } from "@/components/ui/card-field";
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
  resolveDefaultMonthKey,
  VENUE_BOOKING_DATE_STATUS_META,
} from "@/lib/utils/venue-date-statuses";
import { cn } from "@/lib/utils/cn";
import { HorizontalChipScroller } from "@/components/ui/horizontal-chip-scroller";

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
  const [activeMonth, setActiveMonth] = useState(() =>
    resolveDefaultMonthKey(
      SEED_EVENTS.filter((event) => event.organizerId === organizerId).map((event) => event.startDate)
    )
  );

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
        <div className="flex w-full min-w-0 flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            href="/account/organizer/venues"
            className="text-sm underline hover:text-gray-900 inline-flex items-center"
          >
            Площадки проведения
          </Link>
          <Link href="/account/organizer/create-event" className="w-full min-w-0 sm:w-auto">
            <Button size="sm" className="w-full min-w-0 whitespace-normal sm:w-auto">
              Создать мероприятие
            </Button>
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
        <HorizontalChipScroller>
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
        </HorizontalChipScroller>
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
        <div className="catalog-cards-grid catalog-cards-grid--projects">
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
                  <div className="flex flex-wrap items-center gap-2 mb-[10px]">
                    <Badge variant="muted">
                      {event.category === "exhibition"
                        ? "Выставка"
                        : event.category === "forum"
                          ? "Форум"
                          : "Конференция"}
                    </Badge>
                    {statuses.map((status, index) => (
                      <Badge
                        key={`${event.id}-${status}`}
                        variant={
                          pendingBookings > 0
                            ? index === 0
                              ? "outline"
                              : "muted"
                            : index === 0
                              ? "solid"
                              : index === 1
                                ? "outline"
                                : "muted"
                        }
                      >
                        {VENUE_BOOKING_DATE_STATUS_META[status].label}
                      </Badge>
                    ))}
                    {lowAvailability && <Badge variant="muted">Мало свободной площади</Badge>}
                    {pendingBookings > 0 && (
                      <Badge variant="solid">
                        {pendingBookings} нов{pendingBookings === 1 ? "ое" : "ых"} бронирован
                        {pendingBookings === 1 ? "ие" : "ия"}
                      </Badge>
                    )}
                  </div>

                  <CardTitle className="text-sm leading-snug mb-[10px]">{event.title}</CardTitle>

                  <div className="space-y-[10px]">
                    <CardField label="Даты">
                      {formatShortDate(event.startDate)} — {formatShortDate(event.endDate)}
                    </CardField>
                    <CardField label="Период">{getMonthLabel(getMonthKey(event.startDate))}</CardField>
                    <CardField label="Площадка">{event.venue}</CardField>
                    <CardField label="Город">{event.city}</CardField>
                    {halls.length > 0 ? (
                      <CardField label="Залы">{halls.map((hall) => hall!.name).join(", ")}</CardField>
                    ) : null}
                    {meta ? (
                      <CardField label="В аренде">
                        {meta.rentedAreaSqm.toLocaleString("ru-RU")} кв.м
                      </CardField>
                    ) : null}
                  </div>

                  {meta && (
                    <div className="mt-[10px] pt-[10px] border-t border-gray-200 space-y-[10px]">
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