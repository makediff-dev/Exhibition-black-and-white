"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  DashboardStatCard,
  DashboardStatsGrid,
  PaymentInvoicesLabel,
} from "@/components/account/dashboard-stat-card";
import {
  VenueDashboardBookingQueue,
  VenueDashboardNegotiationQueue,
  VenueDashboardServiceAlerts,
} from "@/components/venue/venue-dashboard-blocks";
import { VenueEventsCarousel } from "@/components/venue/venue-events-carousel";
import { SEED_BOOKINGS, SEED_HALLS } from "@/data/mocks/seed";
import type { Booking, Payment } from "@/data/types";
import { usePrototypeStore } from "@/lib/store";

function mergeBookings(storedBookings: Booking[]): Booking[] {
  const ids = new Set(storedBookings.map((booking) => booking.id));
  const missing = SEED_BOOKINGS.filter((booking) => !ids.has(booking.id));
  return missing.length ? [...storedBookings, ...missing] : storedBookings;
}

function countPendingPayments(
  payments: Payment[],
  venueId: string,
  direction: "incoming" | "outgoing"
) {
  return payments.filter(
    (item) =>
      item.venueId === venueId &&
      item.status === "pending" &&
      (item.direction === direction || (!item.direction && direction === "incoming"))
  ).length;
}

interface Props {
  venueId?: string;
}

export function VenueDashboardSection({ venueId = "venue-1" }: Props) {
  const { bookings, payments } = usePrototypeStore();

  const hallCount = SEED_HALLS.filter((item) => item.venueId === venueId).length;

  const mergedBookings = useMemo(() => mergeBookings(bookings), [bookings]);
  const pendingBookings = mergedBookings.filter(
    (item) => item.venueId === venueId && item.status === "pending"
  ).length;

  const incomingPending = useMemo(
    () => countPendingPayments(payments, venueId, "incoming"),
    [payments, venueId]
  );

  const outgoingPending = useMemo(
    () => countPendingPayments(payments, venueId, "outgoing"),
    [payments, venueId]
  );

  return (
    <div className="space-y-6 w-full">
      <DashboardStatsGrid>
        <DashboardStatCard
          value={pendingBookings}
          label="Ожидают подтверждения"
          href="/account/venue/bookings"
        />
        <DashboardStatCard
          value={hallCount}
          label="Залы"
          href="/account/venue/halls"
        />
        <DashboardStatCard
          value={outgoingPending}
          href="/account/venue/payments"
          label={
            <PaymentInvoicesLabel
              direction="исходящие"
              tooltip="Счета, которые площадка оплачивает подрядчикам и партнёрам"
            />
          }
        />
        <DashboardStatCard
          value={incomingPending}
          href="/account/venue/payments"
          label={<PaymentInvoicesLabel direction="входящие" />}
        />
      </DashboardStatsGrid>

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