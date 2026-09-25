"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Building2, CalendarDays, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EventOrderStatusBadges } from "@/components/orders/event-order-status-badges";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { CardField } from "@/components/ui/card-field";
import { Select } from "@/components/ui/select";
import { BOOKING_PERIOD_LABELS } from "@/constants/statuses";
import {
  SEED_BOOKINGS,
  SEED_EVENT_ORDERS,
  SEED_EVENTS,
  SEED_HALLS,
  SEED_VENUE_INQUIRIES,
} from "@/data/mocks/seed";
import type { Booking, EventOrder, VenueInquiry } from "@/data/types";
import { canReadEventOrder } from "@/lib/auth/authorization";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast-provider";
import { getBookingLifecycleCode, getBookingStatus } from "@/lib/state/booking-machine";
import { getInquiryLifecycleCode, getInquiryStatus } from "@/lib/state/inquiry-machine";
import { formatPrice, formatShortDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import {
  getOrderCounterparty,
  getOrderNextStep,
} from "@/lib/utils/order-presentation";

const ACTION_ORDER_STATUSES = new Set([
  "pending",
  "in_progress",
  "negotiation",
  "awaiting_payment",
]);

const SERVICE_ORDER_TYPES = new Set<EventOrder["type"]>([
  "venue_service",
  "passes",
  "accreditation",
]);

function mergeBookings(storedBookings: Booking[]): Booking[] {
  const ids = new Set(storedBookings.map((booking) => booking.id));
  const missing = SEED_BOOKINGS.filter((booking) => !ids.has(booking.id));
  return missing.length ? [...storedBookings, ...missing] : storedBookings;
}

function mergeInquiries(storedInquiries: VenueInquiry[]): VenueInquiry[] {
  const ids = new Set(storedInquiries.map((item) => item.id));
  const missing = SEED_VENUE_INQUIRIES.filter((item) => !ids.has(item.id));
  return missing.length ? [...storedInquiries, ...missing] : storedInquiries;
}

function getEventTitle(eventId: string) {
  return SEED_EVENTS.find((event) => event.id === eventId)?.title ?? eventId;
}

function getHallName(hallId?: string) {
  if (!hallId) return null;
  return SEED_HALLS.find((hall) => hall.id === hallId)?.name;
}

interface VenueDashboardServiceAlertsProps {
  venueId: string;
}

export function VenueDashboardServiceAlerts({ venueId }: VenueDashboardServiceAlertsProps) {
  const notifications = usePrototypeStore((state) => state.notifications);
  const deals = usePrototypeStore((state) => state.deals);
  const user = useAuthStore((state) => state.user);
  const role = user?.role;

  const serviceOrders = useMemo(
    () =>
      SEED_EVENT_ORDERS.filter(
        (order) =>
          order.venueId === venueId &&
          SERVICE_ORDER_TYPES.has(order.type) &&
          ACTION_ORDER_STATUSES.has(order.status) &&
          canReadEventOrder(user, order, deals, SEED_EVENTS).allowed
      ).sort((a, b) => {
        const priorityWeight = { high: 0, medium: 1, normal: 2 };
        return priorityWeight[a.priority] - priorityWeight[b.priority];
      }),
    [venueId, user, deals]
  );

  const actionNotifications = useMemo(
    () =>
      notifications.filter(
        (item) =>
          item.audience === "venue" &&
          !item.read &&
          item.priority === "action_required" &&
          item.category === "orders"
      ),
    [notifications]
  );

  if (!serviceOrders.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Услуги · требуют действия</p>
          <p className="text-sm text-gray-600 mt-1">
            Заказы на услуги площадки: лебёдка, пропуска, аккредитация и смежные позиции
          </p>
        </div>
        <Link href="/account/venue/orders" className="text-sm underline hover:text-gray-900">
          Все заказы
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {serviceOrders.map((order) => {
          const highlighted = actionNotifications.some((item) => item.eventId === order.eventId);
          const eventTitle = getEventTitle(order.eventId);

          return (
            <Link key={order.id} href={`/account/venue/orders/${order.eventId}`} className="block h-full">
              <Card hoverable
                className={cn(
                  "cabinet-card h-full",
                  highlighted && "bg-gray-50",
                )}
              >
                <div className="mb-[10px]">
                  <EventOrderStatusBadges
                    order={order}
                    event={SEED_EVENTS.find((item) => item.id === order.eventId)}
                    viewer={user}
                    actionRequired={highlighted}
                  />
                </div>
                <CardTitle className="text-sm leading-snug mb-[10px]">{order.title}</CardTitle>
                <CardDescription className="mt-0 space-y-[10px]">
                  <CardField label="Мероприятие">{eventTitle}</CardField>
                  <CardField label="Контрагент">
                    {getOrderCounterparty(
                      order,
                      user,
                      SEED_EVENTS.find((item) => item.id === order.eventId)?.venue
                    )}
                  </CardField>
                  <CardField label="Следующий шаг">
                    {getOrderNextStep(
                      order,
                      role,
                      SEED_EVENTS.find((item) => item.id === order.eventId)
                    )}
                  </CardField>
                  {order.amount != null ? (
                    <span className="block pt-1 text-lg font-semibold text-gray-900">
                      {formatPrice(order.amount)}
                    </span>
                  ) : null}
                </CardDescription>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

type BookingSort = "date" | "event" | "period";

interface VenueDashboardBookingQueueProps {
  venueId: string;
}

export function VenueDashboardBookingQueue({ venueId }: VenueDashboardBookingQueueProps) {
  const storeBookings = usePrototypeStore((state) => state.bookings);
  const user = useAuthStore((state) => state.user);
  const [sortBy, setSortBy] = useState<BookingSort>("date");

  const bookings = useMemo(() => {
    const merged = mergeBookings(storeBookings).filter(
      (booking) =>
        booking.venueId === venueId && getBookingLifecycleCode(booking) === "pending"
    );

    return [...merged].sort((a, b) => {
      if (sortBy === "event") {
        return getEventTitle(a.eventId).localeCompare(getEventTitle(b.eventId), "ru");
      }
      if (sortBy === "period") {
        return (a.periodType ?? "").localeCompare(b.periodType ?? "", "ru");
      }
      const aStart = a.periodStart ?? a.date;
      const bStart = b.periodStart ?? b.date;
      return aStart.localeCompare(bStart);
    });
  }, [storeBookings, venueId, sortBy]);

  if (!bookings.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Бронирования · ожидают подтверждения</p>
          <p className="text-sm text-gray-600 mt-1">
            Заявки организаторов на периоды монтажа, проведения и демонтажа мероприятий
          </p>
        </div>
        <Link href="/account/venue/bookings" className="text-sm underline hover:text-gray-900 shrink-0">
          Все бронирования
        </Link>
      </div>

      <Select
        label="Сортировка"
        value={sortBy}
        onChange={(event) => setSortBy(event.target.value as BookingSort)}
        options={[
          { value: "date", label: "По дате периода" },
          { value: "event", label: "По мероприятию" },
          { value: "period", label: "По типу периода" },
        ]}
        className="max-w-xs"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bookings.map((booking) => {
          const eventTitle = getEventTitle(booking.eventId);
          const hallName = getHallName(booking.hallId);
          const periodStart = booking.periodStart ?? booking.date;
          const periodEnd = booking.periodEnd ?? periodStart;

          return (
            <Link key={booking.id} href={`/account/venue/bookings/${booking.id}`} className="block h-full">
              <Card hoverable className="cabinet-card h-full">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="muted">
                    {booking.periodType
                      ? BOOKING_PERIOD_LABELS[booking.periodType]
                      : "Период"}
                  </Badge>
                  <Badge variant="solid">{getBookingStatus(booking, user).label}</Badge>
                </div>
                <CardTitle className="text-sm leading-snug">{eventTitle}</CardTitle>
                <CardDescription className="mt-2 space-y-1.5">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                    {formatShortDate(periodStart)} — {formatShortDate(periodEnd)}
                  </span>
                  {booking.organizerName ? (
                    <span className="flex items-start gap-1.5">
                      <User className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      {booking.organizerName}
                    </span>
                  ) : null}
                  {hallName ? (
                    <span className="flex items-start gap-1.5">
                      <Building2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      {hallName}
                    </span>
                  ) : null}
                </CardDescription>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

type InquirySort = "sent" | "start" | "status";

interface VenueDashboardNegotiationQueueProps {
  venueId: string;
}

export function VenueDashboardNegotiationQueue({ venueId }: VenueDashboardNegotiationQueueProps) {
  const storeInquiries = usePrototypeStore((state) => state.venueInquiries);
  const updateVenueInquiry = usePrototypeStore((state) => state.updateVenueInquiry);
  const addBooking = usePrototypeStore((state) => state.addBooking);
  const user = useAuthStore((state) => state.user);
  const { showToast } = useToast();
  const [sortBy, setSortBy] = useState<InquirySort>("sent");

  const inquiries = useMemo(() => {
    const merged = mergeInquiries(storeInquiries).filter((item) => {
      if (item.venueId !== venueId) return false;
      const code = getInquiryLifecycleCode(item);
      return code === "pending" || code === "proposal_received" || code === "changes_proposed";
    });

    return [...merged].sort((a, b) => {
      if (sortBy === "start") return a.dateFrom.localeCompare(b.dateFrom);
      if (sortBy === "status") return a.status.localeCompare(b.status, "ru");
      return b.sentAt.localeCompare(a.sentAt);
    });
  }, [storeInquiries, venueId, sortBy]);

  if (!inquiries.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Переговорный процесс</p>
          <p className="text-sm text-gray-600 mt-1">
            Запросы организаторов на свободные даты: от первого обращения до выбора площадки
          </p>
        </div>
        <Link href="/account/venue/bookings" className="text-sm underline hover:text-gray-900 shrink-0">
          К бронированиям
        </Link>
      </div>

      <Select
        label="Сортировка"
        value={sortBy}
        onChange={(event) => setSortBy(event.target.value as InquirySort)}
        options={[
          { value: "sent", label: "По дате запроса" },
          { value: "start", label: "По дате начала" },
          { value: "status", label: "По статусу" },
        ]}
        className="max-w-xs"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {inquiries.map((inquiry) => (
          <Card key={inquiry.id} className="cabinet-card h-full">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="muted">Запрос площадки</Badge>
              <Badge variant="solid">{getInquiryStatus(inquiry, user).label}</Badge>
            </div>
            <CardTitle className="text-sm leading-snug">{inquiry.venueName}</CardTitle>
            <CardDescription className="mt-2 space-y-1.5">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                {formatShortDate(inquiry.dateFrom)} — {formatShortDate(inquiry.dateTo)}
              </span>
              {inquiry.minArea ? (
                <span className="block">Мин. площадь: {inquiry.minArea} кв.м</span>
              ) : null}
              {inquiry.proposalSummary ? (
                <span className="block text-gray-900">{inquiry.proposalSummary}</span>
              ) : null}
              {inquiry.proposalPrice ? (
                <span className="block font-medium text-gray-900">{inquiry.proposalPrice}</span>
              ) : null}
              <span className="block text-xs text-gray-500">
                Запрос от {formatShortDate(inquiry.sentAt)}
              </span>
            </CardDescription>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button
                size="sm"
                onClick={() => {
                  updateVenueInquiry(inquiry.id, { status: "selected" });
                  const hall = SEED_HALLS.find((item) => item.venueId === venueId);
                  addBooking({
                    id: `book-inquiry-${inquiry.id}`,
                    eventId: inquiry.eventDraftId.startsWith("evt-")
                      ? inquiry.eventDraftId
                      : "evt-1",
                    venueId,
                    hallId: hall?.id,
                    organizerName: "Организатор",
                    status: "pending",
                    date: inquiry.sentAt,
                    periodType: "event",
                    periodStart: inquiry.dateFrom,
                    periodEnd: inquiry.dateTo,
                  });
                  showToast("Запрос принят — создано бронирование", "success");
                }}
              >
                Принять
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  updateVenueInquiry(inquiry.id, { status: "declined" });
                  showToast("Запрос отклонён", "success");
                }}
              >
                Отклонить
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}