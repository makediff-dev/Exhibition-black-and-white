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
import type { AccountRole } from "@/constants/account-role-themes";
import { BOOKING_PERIOD_LABELS, BOOKING_STATUS_LABELS } from "@/constants/statuses";
import { SEED_BOOKINGS, SEED_EVENTS, SEED_HALLS } from "@/data/mocks/seed";
import type { Booking } from "@/data/types";
import { usePrototypeStore } from "@/lib/store";
import { formatDate, formatShortDate } from "@/lib/utils/formatters";
import { buildBookingInvoice } from "@/lib/utils/cabinet-scope";
import { withFromMessages } from "@/lib/utils/message-related-links";

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
  role?: AccountRole;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

function getRelatedEventHref(role: AccountRole | undefined, eventId: string) {
  if (role === "organizer") {
    return `/account/organizer/edit-event?id=${encodeURIComponent(eventId)}`;
  }
  if (role === "venue") {
    return `/account/venue/events/${encodeURIComponent(eventId)}`;
  }
  return `/events/${encodeURIComponent(eventId)}`;
}

export function VenueBookingDetailSection({
  bookingId,
  venueId = "venue-1",
  role,
  showToast,
}: Props) {
  const searchParams = useSearchParams();
  const fromMessages = searchParams.get("from") === "messages";
  const storeBookings = usePrototypeStore((state) => state.bookings);
  const updateBooking = usePrototypeStore((state) => state.updateBooking);
  const addPayment = usePrototypeStore((state) => state.addPayment);
  const payments = usePrototypeStore((state) => state.payments);
  const resolvedRole = role ?? "venue";
  const backHref = fromMessages
    ? "/messages"
    : resolvedRole === "venue"
      ? "/account/venue/bookings"
      : `/account/${resolvedRole}`;

  const booking = useMemo(() => {
    return mergeBookings(storeBookings).find((item) => {
      if (item.id !== bookingId) return false;
      if (resolvedRole === "venue") return item.venueId === venueId;
      return true;
    });
  }, [storeBookings, bookingId, venueId, resolvedRole]);

  if (!booking) {
    return (
      <div className="space-y-6">
        <BackButton fallbackHref={backHref} />
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
    const hall = booking.hallId ? SEED_HALLS.find((item) => item.id === booking.hallId) : undefined;
    const amount = hall ? hall.area * 400 : 100000;
    const invoice = buildBookingInvoice(booking, amount);
    if (!payments.some((item) => item.id === invoice.id)) {
      addPayment(invoice);
    }
    showToast("Бронирование подтверждено, счёт выставлен", "success");
  };

  const handleReject = () => {
    updateBooking(booking.id, { status: "rejected" });
    showToast("Бронирование отклонено", "success");
  };

  return (
    <div className="space-y-4 w-full max-w-3xl">
      <BackButton fallbackHref={backHref} />

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="muted">{periodLabel}</Badge>
          <Badge variant="solid">{BOOKING_STATUS_LABELS[booking.status]}</Badge>
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
            <Link
              href={
                fromMessages
                  ? withFromMessages(getRelatedEventHref(resolvedRole, event.id))
                  : getRelatedEventHref(resolvedRole, event.id)
              }
            >
              <Button size="sm" variant="outline">
                Карточка мероприятия
              </Button>
            </Link>
            {resolvedRole === "venue" ? (
              <>
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
              </>
            ) : null}
          </div>
        </Card>
      )}

      {resolvedRole === "venue" && booking.status === "pending" && (
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