"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EventOrderStatusBadges } from "@/components/orders/event-order-status-badges";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { CardField } from "@/components/ui/card-field";
import { EmptyState } from "@/components/ui/states";
import { Select } from "@/components/ui/select";
import { EVENT_ORDER_PRIORITY_LABELS } from "@/constants/statuses";
import { SEED_EVENT_ORDERS, SEED_EVENTS } from "@/data/mocks/seed";
import type { EventOrder, EventOrderPriority } from "@/data/types";
import { canReadEventOrder } from "@/lib/auth/authorization";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { getEventOrderHref } from "@/lib/utils/entity-links";
import { formatPrice } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import {
  getOrderCounterparty,
  getOrderDeadlineLabel,
  getOrderNextStep,
} from "@/lib/utils/order-presentation";

const PRIORITY_ORDER: EventOrderPriority[] = ["high", "medium", "normal"];

const PRIORITY_FILTERS = [
  { id: "all", label: "Все" },
  { id: "high", label: "Высокий" },
  { id: "medium", label: "Средний" },
  { id: "normal", label: "Обычный" },
] as const;

function getOrderHref(order: EventOrder) {
  return getEventOrderHref(order);
}

interface EventOrderCardProps {
  order: EventOrder;
  highlighted?: boolean;
  eventTitle?: string;
}

function EventOrderCard({ order, highlighted, eventTitle }: EventOrderCardProps) {
  const user = useAuthStore((state) => state.user);
  const href = getOrderHref(order);
  const event = SEED_EVENTS.find((item) => item.id === order.eventId);
  const content = (
    <Card
      hoverable={Boolean(href)}
      className={cn("cabinet-card h-full", highlighted && "bg-gray-50")}
    >
      <div className="mb-[10px]">
        <EventOrderStatusBadges order={order} event={event} viewer={user} />
      </div>
      <CardTitle className="text-sm mb-[10px]">{order.title}</CardTitle>
      <CardDescription className="mt-0 space-y-[10px]">
        {eventTitle && <CardField label="Мероприятие">{eventTitle}</CardField>}
        <CardField label="Контрагент">{getOrderCounterparty(order, user, event?.venue)}</CardField>
        <CardField label="Предмет">{order.title}</CardField>
        <CardField label="Следующий шаг">{getOrderNextStep(order, user?.role, event)}</CardField>
        {getOrderDeadlineLabel(event) && (
          <CardField label="Срок">{getOrderDeadlineLabel(event)?.replace(/^Срок:\s*/, "")}</CardField>
        )}
        {order.amount != null && (
          <span className="block pt-1 text-lg font-semibold text-gray-900">
            {formatPrice(order.amount)}
          </span>
        )}
      </CardDescription>
    </Card>
  );

  if (!href) return content;

  return (
    <Link href={href} className="block h-full hover:opacity-90">
      {content}
    </Link>
  );
}

const DIRECTION_FILTERS = [
  { id: "all", label: "Все" },
  { id: "incoming", label: "Вы продаёте" },
  { id: "outgoing", label: "Вы покупаете" },
] as const;

interface Props {
  eventId?: string;
  organizerId?: string;
  venueId?: string;
  currentDealId?: string;
  showVenueNote?: boolean;
  showDirectionFilter?: boolean;
  title?: string;
  unboxed?: boolean;
}

export function EventOrdersPanel({
  eventId,
  organizerId,
  venueId,
  currentDealId,
  showVenueNote = false,
  showDirectionFilter = false,
  title,
  unboxed = false,
}: Props) {
  const user = useAuthStore((state) => state.user);
  const deals = usePrototypeStore((state) => state.deals);
  const [priorityFilter, setPriorityFilter] =
    useState<(typeof PRIORITY_FILTERS)[number]["id"]>("all");
  const [directionFilter, setDirectionFilter] =
    useState<(typeof DIRECTION_FILTERS)[number]["id"]>("all");

  const event = eventId ? SEED_EVENTS.find((item) => item.id === eventId) : undefined;

  const orders = useMemo(
    () =>
      SEED_EVENT_ORDERS.filter((order) => {
        if (currentDealId) return order.dealId === currentDealId;
        if (eventId && order.eventId !== eventId) return false;
        if (organizerId) {
          const orderEvent = SEED_EVENTS.find((item) => item.id === order.eventId);
          if (orderEvent?.organizerId !== organizerId) return false;
        }
        if (venueId && order.venueId !== venueId) return false;
        return canReadEventOrder(user, order, deals, SEED_EVENTS).allowed;
      }),
    [eventId, organizerId, venueId, currentDealId, user, deals]
  );

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const matchesPriority =
          priorityFilter === "all" || order.priority === priorityFilter;
        const matchesDirection =
          directionFilter === "all" || order.direction === directionFilter;
        return matchesPriority && matchesDirection;
      }),
    [orders, priorityFilter, directionFilter]
  );

  const groupedOrders = useMemo(() => {
    if (priorityFilter !== "all") {
      return [{ priority: priorityFilter as EventOrderPriority, items: filteredOrders }];
    }

    return PRIORITY_ORDER.map((priority) => ({
      priority,
      items: filteredOrders.filter((order) => order.priority === priority),
    })).filter((group) => group.items.length > 0);
  }, [filteredOrders, priorityFilter]);

  if (orders.length === 0) {
    return (
      <EmptyState
        title="Заказов пока нет"
        description="Здесь появятся входящие заказы от экспонентов и исходящие — к площадке и подрядчикам"
      />
    );
  }

  const panelContent = (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <CardTitle className="text-sm">
            {title ?? `Заказы по мероприятию «${event?.title ?? "Мероприятие"}»`}
          </CardTitle>
          <CardDescription className="mt-1">
            Бронирование площади, пропуска, аккредитация и другие заказы участников
          </CardDescription>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mb-4 max-w-2xl">
        {showDirectionFilter && (
          <Select
            label="Направление"
            value={directionFilter}
            onChange={(event) =>
              setDirectionFilter(event.target.value as (typeof DIRECTION_FILTERS)[number]["id"])
            }
            options={DIRECTION_FILTERS.map((filter) => ({
              value: filter.id,
              label: filter.label,
            }))}
          />
        )}
        <Select
          label="Приоритет"
          value={priorityFilter}
          onChange={(event) =>
            setPriorityFilter(event.target.value as (typeof PRIORITY_FILTERS)[number]["id"])
          }
          options={PRIORITY_FILTERS.map((filter) => ({
            value: filter.id,
            label: filter.label,
          }))}
        />
      </div>

      {filteredOrders.length === 0 ? (
        <EmptyState title="Нет заказов с выбранным приоритетом" />
      ) : (
        <div className="space-y-5">
          {groupedOrders.map((group) => (
            <section key={group.priority}>
              {priorityFilter === "all" && (
                <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-3 border-b border-gray-200 pb-2">
                  {EVENT_ORDER_PRIORITY_LABELS[group.priority]}
                </h3>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {group.items.map((order) => {
                  const orderEvent = SEED_EVENTS.find((item) => item.id === order.eventId);
                  const showEventTitle = Boolean(organizerId || (venueId && !eventId));
                  return (
                    <EventOrderCard
                      key={order.id}
                      order={order}
                      highlighted={Boolean(currentDealId && order.dealId === currentDealId)}
                      eventTitle={showEventTitle ? orderEvent?.title : undefined}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {showVenueNote && (
        <p className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600">
          Площадки, как правило, не размещают заказы на строительство выставочных
          стендов — у каждой площадки есть генеральный застройщик. Организаторы
          выбирают своего генподрядчика под мероприятие или пользуются услугами
          генподрядчика площадки.
        </p>
      )}
    </>
  );

  if (unboxed) {
    return <div className="w-full">{panelContent}</div>;
  }

  return <Card className="md:col-span-2">{panelContent}</Card>;
}