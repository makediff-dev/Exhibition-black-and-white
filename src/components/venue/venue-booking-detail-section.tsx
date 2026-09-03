"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Building2, CalendarDays, User } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { BOOKING_PERIOD_LABELS, BOOKING_STATUS_LABELS } from "@/constants/statuses";
import { SEED_BOOKINGS, SEED_EVENTS, SEED_HALLS } from "@/data/mocks/seed";
import type { Booking } from "@/data/types";
import { usePrototypeStore } from "@/lib/store";
import { formatDate, formatShortDate } from "@/lib/utils/formatters";

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
  bookingId: string;
  venueId?: string;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

export function VenueBookingDetailSection({
  bookingId,
  venueId = "venue-1",
  showToast,
}: Props) {
  const storeBookings = usePrototypeStore((state) => state.bookings);
  const updateBooking = usePrototypeStore((state) => state.updateBooking);

  const booking = useMemo(() => {
    return mergeBookings(storeBookings).find(
      (item) => item.id === bookingId && item.venueId === venueId
    );
  }, [storeBookings, bookingId, venueId]);

  if (!booking) {
    return (
      <div className="space-y-6">
        <BackButton fallbackHref="/account/venue/bookings" />
        <EmptyState
          title="Бронирование не найдено"
          description="Проверьте ссылку или вернитесь к списку бронирований"
        />
      </div>
    );
  }

  const event = SEED_EVENTS.find((item) => item.id === booking.eventId);
  const hall = booking.hallId ? SEED_HALLS.find((item) => item.id === booking.hallId) : undefined;
  const periodLabel = booking.periodType
    ? BOOKING_PERIOD_LABELS[booking.periodType]
    : "Период";

  const handleConfirm = () => {
    updateBooking(booking.id, { status: "confirmed" });
    showToast("Бронирование подтверждено", "success");
  };

  const handleReject = () => {
    updateBooking(booking.id, { status: "rejected" });
    showToast("Бронирование отклонено", "success");
  };

  return (
    <div className="space-y-4 w-full max-w-3xl">
      <BackButton fallbackHref="/account/venue/bookings" />

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-4">
          <Badge variant="outline">{periodLabel}</Badge>
          <Badge variant={booking.status === "pending" ? "solid" : "outline"}>
            {BOOKING_STATUS_LABELS[booking.status]}
          </Badge>
        </div>
        <h1 className="text-xl font-bold">{event?.title ?? "Бронирование"}</h1>
        <p className="text-sm text-gray-600">
          Заявка от {formatDate(booking.date)} · ID {booking.id}
        </p>
      </div>

      <Card className="space-y-4">
        <CardTitle className="text-sm">Детали бронирования</CardTitle>
        <CardDescription className="space-y-3">
          <p className="flex items-start gap-1.5">
            <User className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Организатор:{" "}
              <span className="text-gray-900">{booking.organizerName ?? "—"}</span>
            </span>
          </p>
          {hall && (
            <p className="flex items-start gap-1.5">
              <Building2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                {hall.name}
                <span className="text-gray-500">
                  {" "}
                  · {hall.area.toLocaleString("ru-RU")} кв.м
                </span>
              </span>
            </p>
          )}
          <p className="flex items-start gap-1.5">
            <CalendarDays className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Период: {formatShortDate(booking.periodStart ?? booking.date)}
              {booking.periodEnd && booking.periodEnd !== booking.periodStart
                ? ` — ${formatShortDate(booking.periodEnd)}`
                : ""}
            </span>
          </p>
        </CardDescription>
      </Card>

      {event && (
        <Card className="space-y-3">
          <CardTitle className="text-sm">Связанное мероприятие</CardTitle>
          <CardDescription className="space-y-1">
            <p>{event.title}</p>
            <p>
              {formatShortDate(event.startDate)} — {formatShortDate(event.endDate)} · {event.city}
            </p>
          </CardDescription>
          <div className="flex flex-wrap gap-2">
            <Link href={`/account/venue/events/${event.id}`}>
              <Button size="sm" variant="outline">
                Карточка мероприятия
              </Button>
            </Link>
            <Link href={`/account/venue/bookings/event/${event.id}`}>
              <Button size="sm" variant="outline">
                Бронирования по мероприятию
              </Button>
            </Link>
            <Link href={`/account/venue/orders/${event.id}`}>
              <Button size="sm" variant="outline">
                Заказы по мероприятию
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {booking.status === "pending" && (
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleConfirm}>Подтвердить бронирование</Button>
          <Button variant="outline" onClick={handleReject}>
            Отклонить
          </Button>
        </div>
      )}
    </div>
  );
}