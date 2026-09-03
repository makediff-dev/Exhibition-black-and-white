"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Building2, CalendarDays, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast-provider";
import { BookingDateRangePicker } from "@/components/venue/booking-date-calendar";
import { BOOKING_PERIOD_LABELS, BOOKING_STATUS_LABELS } from "@/constants/statuses";
import { SEED_BOOKINGS, SEED_EVENTS, SEED_HALLS } from "@/data/mocks/seed";
import type { Booking } from "@/data/types";
import { usePrototypeStore } from "@/lib/store";
import { formatShortDate } from "@/lib/utils/formatters";

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

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function expandDateRange(start: string, end: string) {
  const dates: string[] = [];
  const cursor = new Date(start);
  const last = new Date(end || start);

  while (cursor <= last) {
    dates.push(toIsoDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

function bookingOverlapsRange(booking: Booking, rangeStart: string, rangeEnd: string) {
  if (!rangeStart) return true;

  const start = booking.periodStart ?? booking.date;
  const end = booking.periodEnd ?? start;
  const filterEnd = rangeEnd || rangeStart;

  return start <= filterEnd && end >= rangeStart;
}

interface Props {
  venueId?: string;
  initialEventId?: string;
  lockEventFilter?: boolean;
}

export function VenueBookingsSection({
  venueId = "venue-1",
  initialEventId,
  lockEventFilter = false,
}: Props) {
  const storeBookings = usePrototypeStore((state) => state.bookings);
  const updateBooking = usePrototypeStore((state) => state.updateBooking);
  const { showToast } = useToast();
  const router = useRouter();

  const [eventFilter, setEventFilter] = useState(initialEventId ?? "all");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");

  const bookings = useMemo(() => mergeBookings(storeBookings), [storeBookings]);

  const hallBookings = useMemo(
    () =>
      bookings.filter(
        (booking) => booking.venueId === venueId && booking.hallId && booking.periodType
      ),
    [bookings, venueId]
  );

  const eventMap = useMemo(
    () => Object.fromEntries(SEED_EVENTS.map((event) => [event.id, event])),
    []
  );

  const hallMap = useMemo(
    () => Object.fromEntries(SEED_HALLS.map((hall) => [hall.id, hall])),
    []
  );

  const eventOptions = useMemo(() => {
    const eventIds = new Set(hallBookings.map((booking) => booking.eventId));

    return [
      { value: "all", label: "Все мероприятия" },
      ...Array.from(eventIds)
        .map((eventId) => ({
          value: eventId,
          label: eventMap[eventId]?.title ?? eventId,
        }))
        .sort((a, b) => a.label.localeCompare(b.label, "ru")),
    ];
  }, [hallBookings, eventMap]);

  const markedDates = useMemo(() => {
    const dates = new Set<string>();

    hallBookings.forEach((booking) => {
      if (!booking.periodStart) return;
      expandDateRange(booking.periodStart, booking.periodEnd ?? booking.periodStart).forEach(
        (date) => dates.add(date)
      );
    });

    return Array.from(dates);
  }, [hallBookings]);

  const filteredBookings = useMemo(() => {
    return hallBookings
      .filter((booking) => {
        if (eventFilter !== "all" && booking.eventId !== eventFilter) return false;
        if (!bookingOverlapsRange(booking, rangeStart, rangeEnd)) return false;
        return true;
      })
      .sort((a, b) =>
        (a.periodStart ?? a.date).localeCompare(b.periodStart ?? b.date)
      );
  }, [hallBookings, eventFilter, rangeStart, rangeEnd]);

  const handleConfirm = (booking: Booking) => {
    updateBooking(booking.id, { status: "confirmed" });
    showToast("Бронирование подтверждено", "success");
  };

  const handleReject = (booking: Booking) => {
    updateBooking(booking.id, { status: "rejected" });
    showToast("Бронирование отклонено", "success");
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Организатор бронирует у площадки целые залы на периоды монтажа, проведения
        мероприятия и демонтажа.
      </p>

      <div className={lockEventFilter ? "grid gap-4" : "grid gap-4 sm:grid-cols-2"}>
        {!lockEventFilter ? (
          <Select
            label="Мероприятие"
            value={eventFilter}
            onChange={(event) => setEventFilter(event.target.value)}
            options={eventOptions}
          />
        ) : null}
        <BookingDateRangePicker
          markedDates={markedDates}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          onRangeChange={(start, end) => {
            setRangeStart(start);
            setRangeEnd(end);
          }}
        />
      </div>

      {filteredBookings.length === 0 ? (
        <EmptyState
          title="Бронирования не найдены"
          description={
            rangeStart || eventFilter !== "all"
              ? "По выбранным фильтрам бронирований нет"
              : "Бронирования появятся после заявок организаторов"
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredBookings.map((booking) => {
            const event = eventMap[booking.eventId];
            const hall = booking.hallId ? hallMap[booking.hallId] : undefined;
            const periodLabel = booking.periodType
              ? BOOKING_PERIOD_LABELS[booking.periodType]
              : "Период";

            return (
              <Link
                key={booking.id}
                href={`/account/venue/bookings/${booking.id}`}
                className="block h-full"
              >
                <Card hoverable className="h-full flex flex-col gap-[10px]">
                  <div className="flex flex-wrap items-center gap-[10px]">
                    <Badge variant="outline">{periodLabel}</Badge>
                    <Badge variant={booking.status === "pending" ? "solid" : "outline"}>
                      {BOOKING_STATUS_LABELS[booking.status]}
                    </Badge>
                  </div>

                  <CardTitle className="text-sm">
                    {event && !lockEventFilter ? (
                      <button
                        type="button"
                        className="underline hover:text-gray-700 text-left"
                        onClick={(clickEvent) => {
                          clickEvent.preventDefault();
                          clickEvent.stopPropagation();
                          router.push(`/account/venue/bookings/event/${booking.eventId}`);
                        }}
                      >
                        {event.title}
                      </button>
                    ) : (
                      event?.title ?? "Мероприятие"
                    )}
                  </CardTitle>

                  <CardDescription className="space-y-[10px] flex-1">
                    <p className="flex items-start gap-1.5">
                      <User className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      {booking.organizerName ?? "Организатор"}
                    </p>
                    {hall && (
                      <p className="flex items-start gap-1.5">
                        <Building2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        {hall.name}
                        <span className="text-gray-500">
                          · {hall.area.toLocaleString("ru-RU")} кв.м
                        </span>
                      </p>
                    )}
                    <p className="flex items-start gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      {formatShortDate(booking.periodStart ?? booking.date)}
                      {booking.periodEnd && booking.periodEnd !== booking.periodStart
                        ? ` — ${formatShortDate(booking.periodEnd)}`
                        : ""}
                    </p>
                  </CardDescription>

                  {booking.status === "pending" && (
                    <div className="flex flex-wrap gap-[10px]">
                      <Button
                        size="sm"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          handleConfirm(booking);
                        }}
                      >
                        Подтвердить
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          handleReject(booking);
                        }}
                      >
                        Отклонить
                      </Button>
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