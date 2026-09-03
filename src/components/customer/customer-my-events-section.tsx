"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { SEED_EVENTS } from "@/data/mocks/seed";
import type { Event } from "@/data/types";
import { usePrototypeStore } from "@/lib/store";
import { formatShortDate } from "@/lib/utils/formatters";

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
    const eventIds = new Set<string>();
    deals
      .filter((deal) => deal.customerId === customerId && deal.eventId)
      .forEach((deal) => eventIds.add(deal.eventId!));
    requests
      .filter((request) => request.customerId === customerId && request.eventId)
      .forEach((request) => eventIds.add(request.eventId!));

    return SEED_EVENTS.filter((event) => eventIds.has(event.id)).sort((a, b) =>
      a.startDate.localeCompare(b.startDate),
    );
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
        Мероприятия, связанные с вашими заявками, проектами и заказами на платформе.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {myEvents.map((event) => (
          <Link key={event.id} href={`/events/${event.id}`}>
            <Card hoverable className="h-full">
              <Badge variant="outline" className="mb-2">
                {EVENT_CATEGORY_LABELS[event.category]}
              </Badge>
              <CardTitle className="text-base leading-snug">{event.title}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-2">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {event.city} · {event.venue}
              </CardDescription>
              <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatShortDate(event.startDate)} — {formatShortDate(event.endDate)}
              </p>
              <p className="text-sm text-gray-700 mt-2 line-clamp-2">{event.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}