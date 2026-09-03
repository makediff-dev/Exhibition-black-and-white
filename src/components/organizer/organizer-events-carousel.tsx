"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Building2, CalendarDays, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { SEED_EVENTS, SEED_VENUE_PROFILE_MEDIA } from "@/data/mocks/seed";
import type { Notification } from "@/data/types";
import { usePrototypeStore } from "@/lib/store";
import { formatShortDate } from "@/lib/utils/formatters";

interface Props {
  organizerId?: string;
}

function getMonthKey(date: string) {
  const parsed = new Date(date);
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(
    new Date(year, month - 1, 1)
  );
}

export function OrganizerEventsCarousel({ organizerId = "user-organizer" }: Props) {
  const notifications = usePrototypeStore((state) => state.notifications);

  const photos = SEED_VENUE_PROFILE_MEDIA.filter((item) => item.type === "photo");

  const events = useMemo(() => {
    return SEED_EVENTS.filter((event) => event.organizerId === organizerId)
      .map((event) => {
        const eventNotifications = notifications.filter(
          (item) => item.eventId === event.id && item.audience === "organizer" && !item.read
        );
        return { event, eventNotifications };
      })
      .sort((a, b) => a.event.startDate.localeCompare(b.event.startDate));
  }, [organizerId, notifications]);

  const monthKeys = useMemo(() => {
    const keys = new Set(events.map(({ event }) => getMonthKey(event.startDate)));
    return Array.from(keys).sort();
  }, [events]);

  const [activeMonth, setActiveMonth] = useState(() => monthKeys[0] ?? "2026-03");

  const monthEvents = useMemo(
    () => events.filter(({ event }) => getMonthKey(event.startDate) === activeMonth),
    [events, activeMonth]
  );

  if (!events.length) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Мои мероприятия</p>
          <p className="text-sm text-gray-600 mt-1">
            Карусель по календарю — в {getMonthLabel(activeMonth).toLowerCase()}{" "}
            {monthEvents.length} мероприятий с привязкой к площадкам и датам
          </p>
        </div>
        <Link href="/account/organizer/events" className="text-sm underline hover:text-gray-900">
          Все мероприятия
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {monthKeys.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveMonth(key)}
            className={`px-3 py-1.5 text-sm border transition-colors ${
              activeMonth === key
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-300 bg-white hover:border-gray-900"
            }`}
          >
            {getMonthLabel(key)}
          </button>
        ))}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
        {monthEvents.map(({ event, eventNotifications }, index) => {
          const photo = photos[index % photos.length];

          return (
            <Link
              key={event.id}
              href={`/account/organizer/edit-event?id=${event.id}`}
              className="snap-start shrink-0 w-[240px]"
            >
              <Card hoverable className="h-full overflow-hidden p-0">
                <div className="h-28 bg-gray-100 border-b border-gray-200 flex items-center justify-center text-xs text-gray-500 px-3 text-center">
                  {photo?.title ?? "Фото мероприятия"}
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline">
                      {event.category === "exhibition"
                        ? "Выставка"
                        : event.category === "forum"
                          ? "Форум"
                          : "Конференция"}
                    </Badge>
                    {eventNotifications.length > 0 ? (
                      <Badge variant="solid">{eventNotifications.length} новых</Badge>
                    ) : null}
                  </div>

                  <CardTitle className="text-sm leading-snug">{event.title}</CardTitle>

                  <CardDescription className="space-y-1.5">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      {formatShortDate(event.startDate)} — {formatShortDate(event.endDate)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {event.city}
                    </span>
                    <span className="flex items-start gap-1.5">
                      <Building2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      {event.venue}
                    </span>
                  </CardDescription>

                  {eventNotifications.length > 0 ? (
                    <div className="pt-2 border-t border-gray-200 space-y-1">
                      {eventNotifications.slice(0, 2).map((item: Notification) => (
                        <p key={item.id} className="text-[11px] text-gray-700 leading-snug">
                          {item.title}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}