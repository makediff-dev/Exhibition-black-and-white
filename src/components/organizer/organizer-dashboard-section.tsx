"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DashboardStatCard,
  DashboardStatsGrid,
  PaymentInvoicesLabel,
} from "@/components/account/dashboard-stat-card";
import { OrganizerEventsCarousel } from "@/components/organizer/organizer-events-carousel";
import { SEED_EVENT_ORDERS, SEED_EVENTS } from "@/data/mocks/seed";
import { usePrototypeStore } from "@/lib/store";

interface Props {
  organizerId?: string;
}

function isOrganizerEventOrder(order: (typeof SEED_EVENT_ORDERS)[number], organizerId: string) {
  const event = SEED_EVENTS.find((item) => item.id === order.eventId);
  return event?.organizerId === organizerId;
}

export function OrganizerDashboardSection({ organizerId = "user-organizer" }: Props) {
  const { payments } = usePrototypeStore();

  const organizerEvents = SEED_EVENTS.filter((event) => event.organizerId === organizerId);

  const organizerOrders = useMemo(
    () => SEED_EVENT_ORDERS.filter((order) => isOrganizerEventOrder(order, organizerId)),
    [organizerId]
  );

  const incomingOrders = organizerOrders.filter((order) => order.direction === "incoming").length;
  const outgoingOrders = organizerOrders.filter((order) => order.direction === "outgoing").length;

  const organizerPayments = useMemo(
    () => payments.filter((payment) => payment.organizerId === organizerId),
    [payments, organizerId]
  );

  const incomingInvoices = organizerPayments.filter(
    (payment) => payment.direction === "incoming" && payment.status === "pending"
  ).length;

  const outgoingInvoices = organizerPayments.filter(
    (payment) => payment.direction === "outgoing" && payment.status === "pending"
  ).length;

  return (
    <div className="space-y-6 w-full">
      <DashboardStatsGrid>
        <DashboardStatCard
          value={organizerEvents.length}
          label="Мероприятия"
          href="/account/organizer/events"
        />
        <DashboardStatCard
          value={incomingOrders + outgoingOrders}
          label="Активные заказы"
          href="/account/organizer/orders"
        />
        <DashboardStatCard
          value={outgoingInvoices}
          href="/account/organizer/payments"
          label={
            <PaymentInvoicesLabel
              direction="исходящие"
              tooltip="Счета, которые организатор оплачивает площадке и подрядчикам"
            />
          }
        />
        <DashboardStatCard
          value={incomingInvoices}
          href="/account/organizer/payments"
          label={<PaymentInvoicesLabel direction="входящие" />}
        />
      </DashboardStatsGrid>

      <div className="flex flex-wrap gap-2">
        <Link href="/account/organizer/create-event">
          <Button size="sm">Создать мероприятие</Button>
        </Link>
      </div>

      <OrganizerEventsCarousel organizerId={organizerId} />

      <Card className="cabinet-card space-y-2">
        <p className="text-sm font-medium">Входящие и исходящие</p>
        <p className="text-sm text-gray-600">
          Входящий заказ — от экспонента или участника мероприятия (аренда площади, услуги).
          Исходящий — когда организатор размещает заказ у площадки или подрядчика. Та же логика
          применяется к счетам: входящие вы выставляете участникам, исходящие — оплачиваете
          площадке и партнёрам.
        </p>
      </Card>
    </div>
  );
}