"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { VenueEventsCarousel } from "@/components/venue/venue-events-carousel";
import {
  SEED_HALLS,
  SEED_PAVILIONS,
} from "@/data/mocks/seed";
import { usePrototypeStore } from "@/lib/store";

interface Props {
  venueId?: string;
}

export function VenueDashboardSection({ venueId = "venue-1" }: Props) {
  const { bookings, notifications, payments } = usePrototypeStore();

  const pavilionCount = SEED_PAVILIONS.filter((item) => item.venueId === venueId).length;
  const hallCount = SEED_HALLS.filter((item) => item.venueId === venueId).length;
  const pendingBookings = bookings.filter((item) => item.status === "pending").length;

  const venueNotifications = useMemo(
    () =>
      notifications.filter(
        (item) => (item.audience === "venue" || item.category === "bookings") && !item.read
      ).length,
    [notifications]
  );

  const incomingPending = useMemo(
    () =>
      payments.filter(
        (item) =>
          item.venueId === venueId &&
          item.status === "pending" &&
          (item.direction === "incoming" || !item.direction)
      ).length,
    [payments, venueId]
  );

  const outgoingPending = useMemo(
    () =>
      payments.filter(
        (item) =>
          item.venueId === venueId && item.status === "pending" && item.direction === "outgoing"
      ).length,
    [payments, venueId]
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Link href="/notifications">
          <Card className="hover:border-gray-900 transition-colors h-full">
            <CardTitle>{venueNotifications}</CardTitle>
            <CardDescription>Новые уведомления</CardDescription>
          </Card>
        </Link>
        <Link href="/account/venue/payments">
          <Card className="hover:border-gray-900 transition-colors h-full">
            <CardTitle>{incomingPending}</CardTitle>
            <CardDescription>Неоплаченные счета · входящие</CardDescription>
          </Card>
        </Link>
        <Link href="/account/venue/payments">
          <Card className="hover:border-gray-900 transition-colors h-full">
            <CardTitle>{outgoingPending}</CardTitle>
            <CardDescription>Неоплаченные счета · исходящие</CardDescription>
          </Card>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <Link href="/account/venue/halls">
          <Card className="hover:border-gray-900 transition-colors h-full">
            <CardTitle>{pavilionCount}</CardTitle>
            <CardDescription>Павильоны</CardDescription>
          </Card>
        </Link>
        <Link href="/account/venue/bookings">
          <Card className="hover:border-gray-900 transition-colors h-full">
            <CardTitle>{pendingBookings}</CardTitle>
            <CardDescription>Ожидают подтверждения</CardDescription>
          </Card>
        </Link>
        <Link href="/account/venue/halls">
          <Card className="hover:border-gray-900 transition-colors h-full">
            <CardTitle>{hallCount}</CardTitle>
            <CardDescription>Залов</CardDescription>
          </Card>
        </Link>
      </div>

      <VenueEventsCarousel venueId={venueId} />

      <Card className="space-y-2">
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
