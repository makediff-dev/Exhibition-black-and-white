"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { CardField } from "@/components/ui/card-field";
import { EmptyState } from "@/components/ui/states";
import { SEED_EVENT_ORDERS, SEED_EVENTS } from "@/data/mocks/seed";
import type { Event } from "@/data/types";
import { usePrototypeStore } from "@/lib/store";
import { getEventOrderHref } from "@/lib/utils/entity-links";
import { formatShortDate } from "@/lib/utils/formatters";
import { withFromParam } from "@/lib/utils/message-related-links";

const EVENT_CATEGORY_LABELS: Record<Event["category"], string> = {
  exhibition: "Выставка",
  forum: "Форум",
  conference: "Конференция",
};

interface Props {
  customerId?: string;
}

export function CustomerMyEventsSection({ customerId = "user-customer" }: Props) {
  const { deals, requests } = usePrototypeStore();

  const myEvents = useMemo(() => {
    const customerName = deals.find((deal) => deal.customerId === customerId)?.customerName;
    const reasons = new Map<string, string[]>();
    const actions = new Map<string, { href: string; label: string }>();

    const addReason = (eventId: string, reason: string) => {
      const list = reasons.get(eventId) ?? [];
      if (!list.includes(reason)) list.push(reason);
      reasons.set(eventId, list);
    };

    deals
      .filter((deal) => deal.customerId === customerId && deal.eventId)
      .forEach((deal) => {
        addReason(deal.eventId!, `Есть сделка ${deal.number}`);
        if (!actions.has(deal.eventId!)) {
          actions.set(deal.eventId!, {
            href: `/deals/${deal.id}`,
            label: deal.status === "awaiting_payment" ? "Нужно оплатить" : "Открыть сделку",
          });
        }
      });

    requests
      .filter((request) => request.customerId === customerId && request.eventId)
      .forEach((request) => {
        addReason(request.eventId!, `Есть заявка «${request.title}»`);
        if (!actions.has(request.eventId!)) {
          actions.set(request.eventId!, {
            href: `/requests/${request.id}`,
            label: "Открыть заявку",
          });
        }
      });

    SEED_EVENT_ORDERS.filter(
      (order) =>
        order.customerRole === "exhibitor" &&
        ((customerName && order.customerName === customerName) ||
          deals.some((deal) => deal.id === order.dealId && deal.customerId === customerId))
    ).forEach((order) => {
      addReason(order.eventId, `Есть заказ «${order.title}»`);
      if (!actions.has(order.eventId)) {
        actions.set(order.eventId, {
          href: getEventOrderHref(order),
          label: order.status === "awaiting_payment" ? "Нужно оплатить" : "Открыть заказ",
        });
      }
    });

    return SEED_EVENTS.filter((event) => reasons.has(event.id))
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .map((event) => ({
        event,
        reasons: reasons.get(event.id) ?? [],
        action: actions.get(event.id),
      }));
  }, [customerId, deals, requests]);

  if (myEvents.length === 0) {
    return (
      <EmptyState
        title="Мероприятий пока нет"
        description="Здесь появятся выставки и форумы, в которых вы участвуете как заказчик"
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Здесь только те мероприятия, с которыми уже есть связь: заявка, сделка или заказ. На карточке
        указано основание и следующее действие.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {myEvents.map(({ event, reasons, action }) => (
          <Card key={event.id} className="h-full flex flex-col">
            <Badge variant="outline" className="mb-2 w-fit">
              {EVENT_CATEGORY_LABELS[event.category]}
            </Badge>
            <CardTitle className="text-base leading-snug mb-[10px]">{event.title}</CardTitle>
            <div className="space-y-[10px]">
              <CardField label="Город">{event.city}</CardField>
              <CardField label="Площадка">{event.venue}</CardField>
              <CardField label="Даты">
                {formatShortDate(event.startDate)} — {formatShortDate(event.endDate)}
              </CardField>
              {reasons.map((reason, index) =>
                index === 0 ? (
                  <CardField key={reason} label="Основание">
                    {reason}
                  </CardField>
                ) : (
                  <p key={reason} className="text-sm text-gray-500">
                    {reason}
                  </p>
                )
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={withFromParam(`/events/${event.id}`, "my-events")}>
                <Button size="sm" variant="outline">
                  Страница мероприятия
                </Button>
              </Link>
              {action && (
                <Link href={action.href}>
                  <Button size="sm">{action.label}</Button>
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
