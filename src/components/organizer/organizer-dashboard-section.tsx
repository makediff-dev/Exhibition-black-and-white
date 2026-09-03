"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
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
  const { notifications, documents } = usePrototypeStore();

  const organizerEvents = SEED_EVENTS.filter((event) => event.organizerId === organizerId);

  const organizerOrders = useMemo(
    () => SEED_EVENT_ORDERS.filter((order) => isOrganizerEventOrder(order, organizerId)),
    [organizerId]
  );

  const incomingOrders = organizerOrders.filter((order) => order.direction === "incoming").length;
  const outgoingOrders = organizerOrders.filter((order) => order.direction === "outgoing").length;

  const organizerNotifications = useMemo(
    () => notifications.filter((item) => item.audience === "organizer" && !item.read).length,
    [notifications]
  );

  const organizerDocs = useMemo(
    () => documents.filter((doc) => doc.organizerId === organizerId && doc.type === "Счёт"),
    [documents, organizerId]
  );

  const incomingInvoices = organizerDocs.filter(
    (doc) => doc.direction === "incoming" && doc.status !== "signed" && doc.status !== "archived"
  ).length;

  const outgoingInvoices = organizerDocs.filter(
    (doc) => doc.direction === "outgoing" && doc.status !== "signed" && doc.status !== "archived"
  ).length;

  return (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Link href="/notifications">
          <Card hoverable className="h-full">
            <CardTitle>{organizerNotifications}</CardTitle>
            <CardDescription>Новые уведомления</CardDescription>
          </Card>
        </Link>
        <Link href="/account/organizer/payments">
          <Card hoverable className="h-full">
            <CardTitle>{incomingInvoices}</CardTitle>
            <CardDescription>Неоплаченные счета · входящие</CardDescription>
          </Card>
        </Link>
        <Link href="/account/organizer/payments">
          <Card hoverable className="h-full">
            <CardTitle>{outgoingInvoices}</CardTitle>
            <CardDescription>Неоплаченные счета · исходящие</CardDescription>
          </Card>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <Link href="/account/organizer/orders">
          <Card hoverable className="h-full">
            <CardTitle>{incomingOrders}</CardTitle>
            <CardDescription>Заказы · входящие</CardDescription>
          </Card>
        </Link>
        <Link href="/account/organizer/orders">
          <Card hoverable className="h-full">
            <CardTitle>{outgoingOrders}</CardTitle>
            <CardDescription>Заказы · исходящие</CardDescription>
          </Card>
        </Link>
        <Link href="/account/organizer/events">
          <Card hoverable className="h-full">
            <CardTitle>{organizerEvents.length}</CardTitle>
            <CardDescription>Мероприятий</CardDescription>
          </Card>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/account/organizer/create-event">
          <Button size="sm">Создать мероприятие</Button>
        </Link>
      </div>

      <OrganizerEventsCarousel organizerId={organizerId} />

      <Card className="space-y-2">
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