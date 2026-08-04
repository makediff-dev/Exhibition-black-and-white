"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { Select } from "@/components/ui/select";
import {
  DEAL_STATUS_LABELS,
  EVENT_ORDER_CUSTOMER_ROLE_LABELS,
  EVENT_ORDER_PRIORITY_LABELS,
  EVENT_ORDER_TYPE_LABELS,
} from "@/constants/statuses";
import { SEED_EVENT_ORDERS, SEED_EVENTS } from "@/data/mocks/seed";
import type { DealStatus, EventOrder, EventOrderPriority } from "@/data/types";
import { formatPrice } from "@/lib/utils/formatters";

const PRIORITY_ORDER: EventOrderPriority[] = ["high", "medium", "normal"];

const PRIORITY_FILTERS = [
  { id: "all", label: "Все" },
  { id: "high", label: "Высокий" },
  { id: "medium", label: "Средний" },
  { id: "normal", label: "Обычный" },
] as const;

function getOrderStatusLabel(status: EventOrder["status"]) {
  if (status === "pending") return "Ожидает";
  if (status === "completed") return "Завершён";
  return DEAL_STATUS_LABELS[status as DealStatus] ?? status;
}

function getOrderHref(order: EventOrder) {
  if (order.dealId) return `/deals/${order.dealId}`;
  if (order.requestId) return `/requests/${order.requestId}`;
  return undefined;
}

interface EventOrderCardProps {
  order: EventOrder;
  highlighted?: boolean;
  eventTitle?: string;
}

function EventOrderCard({ order, highlighted, eventTitle }: EventOrderCardProps) {
  const href = getOrderHref(order);
  const content = (
    <Card
      className={`h-full ${highlighted ? "border-2 border-gray-900" : ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <Badge variant="outline">{EVENT_ORDER_TYPE_LABELS[order.type]}</Badge>
        <Badge>{getOrderStatusLabel(order.status)}</Badge>
      </div>
      <CardTitle className="text-sm">{order.title}</CardTitle>
      <CardDescription className="mt-2 space-y-1">
        {eventTitle && (
          <span className="block text-xs text-gray-500">Мероприятие: {eventTitle}</span>
        )}
        <span className="block">
          {EVENT_ORDER_CUSTOMER_ROLE_LABELS[order.customerRole]}:{" "}
          <span className="text-gray-900">{order.customerName}</span>
        </span>
        {order.amount != null && (
          <span className="block font-medium text-gray-900">
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
  { id: "incoming", label: "Входящие" },
  { id: "outgoing", label: "Исходящие" },
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
  const [priorityFilter, setPriorityFilter] =
    useState<(typeof PRIORITY_FILTERS)[number]["id"]>("all");
  const [directionFilter, setDirectionFilter] =
    useState<(typeof DIRECTION_FILTERS)[number]["id"]>("all");

  const event = eventId ? SEED_EVENTS.find((item) => item.id === eventId) : undefined;

  const orders = useMemo(
    () =>
      SEED_EVENT_ORDERS.filter((order) => {
        if (eventId && order.eventId !== eventId) return false;
        if (organizerId) {
          const orderEvent = SEED_EVENTS.find((item) => item.id === order.eventId);
          if (orderEvent?.organizerId !== organizerId) return false;
        }
        return !venueId || order.venueId === venueId;
      }),
    [eventId, organizerId, venueId]
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
              <div className="grid md:grid-cols-2 gap-3">
                {group.items.map((order) => {
                  const orderEvent = SEED_EVENTS.find((item) => item.id === order.eventId);
                  return (
                    <EventOrderCard
                      key={order.id}
                      order={order}
                      highlighted={Boolean(currentDealId && order.dealId === currentDealId)}
                      eventTitle={organizerId ? orderEvent?.title : undefined}
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
    return <div className="max-w-6xl">{panelContent}</div>;
  }

  return <Card className="md:col-span-2">{panelContent}</Card>;
}
