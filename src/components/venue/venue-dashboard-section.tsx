"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  VenueDashboardBookingQueue,
  VenueDashboardNegotiationQueue,
  VenueDashboardServiceAlerts,
} from "@/components/venue/venue-dashboard-blocks";
import { VenueEventsCarousel } from "@/components/venue/venue-events-carousel";
import {
  PAYMENT_STATUS_LABELS,
  VENUE_PAYMENT_ROLE_LABELS,
} from "@/constants/statuses";
import {
  SEED_BOOKINGS,
  SEED_HALLS,
  SEED_PAVILIONS,
} from "@/data/mocks/seed";
import type { Booking, Payment } from "@/data/types";
import { usePrototypeStore } from "@/lib/store";

function mergeBookings(storedBookings: Booking[]): Booking[] {
  const ids = new Set(storedBookings.map((booking) => booking.id));
  const missing = SEED_BOOKINGS.filter((booking) => !ids.has(booking.id));
  return missing.length ? [...storedBookings, ...missing] : storedBookings;
}

function summarizePendingPayments(
  payments: Payment[],
  venueId: string,
  direction: "incoming" | "outgoing"
) {
  const pending = payments.filter(
    (item) =>
      item.venueId === venueId &&
      item.status === "pending" &&
      (item.direction === direction || (!item.direction && direction === "incoming"))
  );

  const roleCounts = pending.reduce<Record<string, number>>((acc, item) => {
    const role = item.participantRole ?? "organizer";
    const label =
      VENUE_PAYMENT_ROLE_LABELS[role as keyof typeof VENUE_PAYMENT_ROLE_LABELS] ?? role;
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});

  const breakdown = Object.entries(roleCounts)
    .map(([label, count]) => `${label} · ${count}`)
    .join(", ");

  return {
    count: pending.length,
    breakdown: breakdown || PAYMENT_STATUS_LABELS.pending,
  };
}

interface Props {
  venueId?: string;
}

export function VenueDashboardSection({ venueId = "venue-1" }: Props) {
  const { bookings, notifications, payments } = usePrototypeStore();

  const pavilionCount = SEED_PAVILIONS.filter((item) => item.venueId === venueId).length;
  const hallCount = SEED_HALLS.filter((item) => item.venueId === venueId).length;

  const mergedBookings = useMemo(() => mergeBookings(bookings), [bookings]);
  const pendingBookings = mergedBookings.filter(
    (item) => item.venueId === venueId && item.status === "pending"
  ).length;

  const venueNotifications = useMemo(
    () =>
      notifications.filter(
        (item) => (item.audience === "venue" || item.category === "bookings") && !item.read
      ).length,
    [notifications]
  );

  const incomingPending = useMemo(
    () => summarizePendingPayments(payments, venueId, "incoming"),
    [payments, venueId]
  );

  const outgoingPending = useMemo(
    () => summarizePendingPayments(payments, venueId, "outgoing"),
    [payments, venueId]
  );

  return (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Link href="/notifications">
          <Card hoverable className="cabinet-card h-full">
            <CardTitle>{venueNotifications}</CardTitle>
            <CardDescription>Новые уведомления</CardDescription>
          </Card>
        </Link>
        <Link href="/account/venue/payments">
          <Card hoverable className="cabinet-card h-full">
            <CardTitle>{incomingPending.count}</CardTitle>
            <CardDescription>Неоплаченные счета · входящие</CardDescription>
            {incomingPending.breakdown ? (
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                {incomingPending.breakdown}
              </p>
            ) : null}
          </Card>
        </Link>
        <Link href="/account/venue/payments">
          <Card hoverable className="cabinet-card h-full">
            <CardTitle>{outgoingPending.count}</CardTitle>
            <CardDescription>Неоплаченные счета · исходящие</CardDescription>
            {outgoingPending.breakdown ? (
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                {outgoingPending.breakdown}
              </p>
            ) : null}
          </Card>
        </Link>
        <Link href="/account/venue/halls">
          <Card hoverable className="cabinet-card h-full">
            <CardTitle>{pavilionCount}</CardTitle>
            <CardDescription>Павильоны</CardDescription>
          </Card>
        </Link>
        <Link href="/account/venue/bookings">
          <Card hoverable className="cabinet-card h-full">
            <CardTitle>{pendingBookings}</CardTitle>
            <CardDescription>Ожидают подтверждения</CardDescription>
          </Card>
        </Link>
        <Link href="/account/venue/halls">
          <Card hoverable className="cabinet-card h-full">
            <CardTitle>{hallCount}</CardTitle>
            <CardDescription>Залов</CardDescription>
          </Card>
        </Link>
      </div>

      <VenueDashboardServiceAlerts venueId={venueId} />

      <VenueEventsCarousel venueId={venueId} />

      <VenueDashboardBookingQueue venueId={venueId} />

      <VenueDashboardNegotiationQueue venueId={venueId} />

      <Card className="cabinet-card space-y-2">
        <p className="text-sm font-medium">Роли на платформе</p>
        <p className="text-sm text-gray-600">
          Площадка сдаёт залы организатору. Организатор нарезает площадь экспонентам и продаёт
          допуслуги. Экспонент покупает аренду и сервисы у организатора, строительство стенда — у
          застройщика. Пропуска, аккредитацию и техконтроль застройщик может оплачивать у площадки
          или организатора — в зависимости от того, кто ведёт эти деньги на конкретном мероприятии.
        </p>
      </Card>
    </div>
  );
}