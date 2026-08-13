"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MessageSquare } from "lucide-react";
import { SharedPageShell } from "@/components/layout/shared-page-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { Tabs } from "@/components/ui/tabs";
import { SEED_EVENTS } from "@/data/mocks/seed";
import type { Deal, MessageCategory, MessageThread, Request } from "@/data/types";
import { usePrototypeStore } from "@/lib/store";
import { formatPrice, formatShortDate } from "@/lib/utils/formatters";

const RELATED_TYPE_LABELS: Record<string, string> = {
  deal: "Сделка",
  request: "Заявка",
  support: "Поддержка",
  booking: "Бронирование",
  event: "Мероприятие",
};

const MESSAGE_TABS: { id: MessageCategory | "all"; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "system", label: "Системные" },
  { id: "customer", label: "Заказчики" },
  { id: "venue", label: "Площадки" },
  { id: "organizer", label: "Организаторы" },
];

const CUSTOMER_NAME = "ООО «Вымышленная Мебель»";

function resolveCategory(thread: MessageThread): MessageCategory {
  if (thread.category) return thread.category;
  if (thread.relatedType === "support") return "system";
  return "customer";
}

function getRequestCost(request: Request) {
  if (request.budget.type === "range" && request.budget.min && request.budget.max) {
    return `${formatPrice(request.budget.min)} – ${formatPrice(request.budget.max)}`;
  }
  if (request.budget.min) return formatPrice(request.budget.min);
  if (request.budget.type === "hidden") return "Скрыта";
  return "По запросу";
}

function getThreadDetails(
  thread: MessageThread,
  deals: Deal[],
  requests: Request[]
) {
  if (thread.relatedType === "deal") {
    const deal = deals.find((item) => item.id === thread.relatedId);
    if (!deal) return null;

    const request = deal.requestId ? requests.find((item) => item.id === deal.requestId) : undefined;
    const event = request?.eventId
      ? SEED_EVENTS.find((item) => item.id === request.eventId)
      : undefined;

    return {
      customer: deal.customerName,
      event: event?.title ?? "—",
      venue: event?.venue ?? request?.city ?? "—",
      cost: formatPrice(deal.totalPrice),
    };
  }

  if (thread.relatedType === "request") {
    const request = requests.find((item) => item.id === thread.relatedId);
    if (!request) return null;

    const event = request.eventId
      ? SEED_EVENTS.find((item) => item.id === request.eventId)
      : undefined;

    return {
      customer: CUSTOMER_NAME,
      event: event?.title ?? "—",
      venue: event?.venue ?? request.city,
      cost: getRequestCost(request),
    };
  }

  if (thread.category === "venue") {
    const event = SEED_EVENTS.find((item) => item.id === "evt-1");
    return {
      customer: "—",
      event: event?.title ?? "—",
      venue: event?.venue ?? "—",
      cost: "—",
    };
  }

  if (thread.category === "organizer") {
    const event = SEED_EVENTS.find((item) => item.id === thread.relatedId);
    return {
      customer: "—",
      event: event?.title ?? thread.title,
      venue: event?.venue ?? "—",
      cost: "—",
    };
  }

  return null;
}

function getRelatedLinkLabel(thread: MessageThread) {
  if (thread.relatedType === "deal") return "Открыть сделку →";
  if (thread.relatedType === "request") return "Открыть заявку →";
  if (thread.relatedType === "booking") return "Открыть бронирование →";
  if (thread.relatedType === "event") return "Открыть мероприятие →";
  return "Открыть →";
}

export default function MessagesPage() {
  const { messages, deals, requests } = usePrototypeStore();
  const [activeCategory, setActiveCategory] = useState<MessageCategory | "all">("all");

  const sortedThreads = useMemo(
    () => [...messages].sort((a, b) => b.lastDate.localeCompare(a.lastDate)),
    [messages]
  );

  const filteredThreads = useMemo(() => {
    if (activeCategory === "all") return sortedThreads;
    return sortedThreads.filter((thread) => resolveCategory(thread) === activeCategory);
  }, [activeCategory, sortedThreads]);

  return (
    <SharedPageShell title="Сообщения">
      <div className="w-full mr-auto text-left">
        <Tabs
          tabs={MESSAGE_TABS}
          activeTab={activeCategory}
          onChange={(id) => setActiveCategory(id as MessageCategory | "all")}
          className="mb-6"
        />

        {filteredThreads.length === 0 ? (
          <EmptyState
            title="Нет переписок в этой категории"
            description="Выберите другую категорию или дождитесь новых сообщений"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 justify-items-start">
            {filteredThreads.map((thread) => {
              const details = getThreadDetails(thread, deals, requests);

              return (
                <Card
                  key={thread.id}
                  className="flex flex-col h-full w-full max-w-md hover:border-gray-900"
                >
                  <Link href={`/messages/${thread.id}`} className="block flex-1 text-left">
                    <div className="flex flex-col gap-3 items-start">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                          {RELATED_TYPE_LABELS[thread.relatedType] || thread.relatedType}
                        </Badge>
                        {thread.unread > 0 && (
                          <Badge variant="solid">{thread.unread} новых</Badge>
                        )}
                      </div>

                      <CardTitle>{thread.title}</CardTitle>
                      <CardDescription>{thread.lastMessage}</CardDescription>

                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {formatShortDate(thread.lastDate)}
                      </p>

                      {details && (
                        <dl className="space-y-1 text-sm text-gray-700 w-full">
                          <div>
                            <dt className="text-gray-500 inline">Заказчик: </dt>
                            <dd className="inline">{details.customer}</dd>
                          </div>
                          <div>
                            <dt className="text-gray-500 inline">Мероприятие: </dt>
                            <dd className="inline">{details.event}</dd>
                          </div>
                          <div>
                            <dt className="text-gray-500 inline">Площадка: </dt>
                            <dd className="inline">{details.venue}</dd>
                          </div>
                          <div>
                            <dt className="text-gray-500 inline">Стоимость: </dt>
                            <dd className="inline">{details.cost}</dd>
                          </div>
                        </dl>
                      )}
                    </div>
                  </Link>

                  {thread.relatedLink && thread.relatedType !== "support" && (
                    <div className="mt-4 pt-3 border-t border-gray-200 w-full text-left">
                      <Link
                        href={thread.relatedLink}
                        className="text-xs underline text-gray-600 hover:text-gray-900"
                      >
                        {getRelatedLinkLabel(thread)}
                      </Link>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </SharedPageShell>
  );
}
