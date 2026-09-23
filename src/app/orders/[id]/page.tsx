"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { CardField } from "@/components/ui/card-field";
import { EmptyState, ForbiddenState } from "@/components/ui/states";
import { EVENT_ORDER_TYPE_LABELS } from "@/constants/statuses";
import { SEED_EVENT_ORDERS, SEED_EVENTS } from "@/data/mocks/seed";
import { canReadDocument, canReadEventOrder, canReadPayment } from "@/lib/auth/authorization";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { getEventOrderHref } from "@/lib/utils/entity-links";
import { formatPrice, formatShortDate } from "@/lib/utils/formatters";
import {
  COMMERCIAL_ORDER_KIND_LABELS,
  getCommercialOrderKind,
  getEventOrderStatusLabel,
  getOrderCounterparty,
  getOrderDeadlineLabel,
  getOrderNextStep,
  getOrderTradeSide,
  getOrderTradeSideLabel,
} from "@/lib/utils/order-presentation";

function EventOrderPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const user = useAuthStore((state) => state.user);
  const deals = usePrototypeStore((state) => state.deals);
  const documents = usePrototypeStore((state) => state.documents);
  const payments = usePrototypeStore((state) => state.payments);
  const bookings = usePrototypeStore((state) => state.bookings);

  const order = SEED_EVENT_ORDERS.find((item) => item.id === id);
  const event = order ? SEED_EVENTS.find((item) => item.id === order.eventId) : undefined;
  const access = canReadEventOrder(user, order, deals, SEED_EVENTS);

  useEffect(() => {
    if (order?.type === "stand_build" && order.dealId && access.allowed) {
      router.replace(getEventOrderHref(order));
    }
  }, [order, access.allowed, router]);

  if (!order) {
    return (
      <AppShell title="Заказ" showBack backFallbackHref="/">
        <EmptyState title="Заказ не найден" actionLabel="На главную" actionHref="/" />
      </AppShell>
    );
  }

  if (!access.allowed) {
    return (
      <AppShell
        title="Нет доступа"
        showBack
        backFallbackHref={user?.role ? `/account/${user.role}` : "/login"}
      >
        <ForbiddenState
          title="Заказ недоступен"
          description={access.reason}
          actionLabel={user?.role ? "В свой кабинет" : "Войти"}
          actionHref={user?.role ? `/account/${user.role}` : "/login"}
        />
      </AppShell>
    );
  }

  if (order.type === "stand_build" && order.dealId) {
    return (
      <AppShell title={order.title} showBack backFallbackHref={`/deals/${order.dealId}`}>
        <EmptyState
          title="Это заказ на строительство стенда"
          description="Открываем связанную сделку — у этого заказа нет отдельной карточки."
          actionLabel="К сделке"
          actionHref={`/deals/${order.dealId}`}
        />
      </AppShell>
    );
  }

  const relatedDocuments = documents.filter(
    (doc) => doc.orderId === order.id && canReadDocument(doc, user, deals)
  );
  const relatedPayments = payments.filter(
    (payment) => payment.orderId === order.id && canReadPayment(payment, user, deals)
  );
  const booking = order.bookingId
    ? bookings.find((item) => item.id === order.bookingId)
    : undefined;
  const deal = order.dealId ? deals.find((item) => item.id === order.dealId) : undefined;

  return (
    <AppShell
      title={order.title}
      showBack
      backFallbackHref={
        user?.role === "venue" || user?.role === "organizer"
          ? `/account/${user.role}/orders`
          : user?.role
            ? `/account/${user.role}`
            : "/"
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="muted">{COMMERCIAL_ORDER_KIND_LABELS[getCommercialOrderKind(order.type)]}</Badge>
          <Badge variant="outline">{EVENT_ORDER_TYPE_LABELS[order.type]}</Badge>
          <Badge variant="solid">{getEventOrderStatusLabel(order.status)}</Badge>
          <Badge variant="outline">{getOrderTradeSideLabel(getOrderTradeSide(order, user?.role))}</Badge>
        </div>

        <Card className="space-y-3">
          <CardTitle className="text-base">{order.title}</CardTitle>
          <div className="space-y-[10px]">
            <CardField label="Контрагент">{getOrderCounterparty(order, event?.venue)}</CardField>
            <CardField label="Следующий шаг">{getOrderNextStep(order, user?.role)}</CardField>
            {getOrderDeadlineLabel(event) && (
              <CardField label="Срок">{getOrderDeadlineLabel(event)?.replace(/^Срок:\s*/, "")}</CardField>
            )}
            {order.amount != null && (
              <p className="pt-1 text-lg font-semibold text-gray-900">{formatPrice(order.amount)}</p>
            )}
            {event && (
              <CardField label="Мероприятие">
                <Link href={`/events/${event.id}`} className="underline hover:text-gray-700">
                  {event.title}
                </Link>
                {` · ${formatShortDate(event.startDate)} — ${formatShortDate(event.endDate)}`}
              </CardField>
            )}
            {booking && (
              <CardField label="Бронирование">
                {`${booking.periodStart} — ${booking.periodEnd} (${
                  booking.status === "confirmed"
                    ? "подтверждено"
                    : booking.status === "pending"
                      ? "ожидает"
                      : "отклонено"
                })`}
              </CardField>
            )}
            {deal && (
              <CardField label="Связанная сделка">
                <Link href={`/deals/${deal.id}`} className="underline hover:text-gray-700">
                  {deal.number} — {deal.title}
                </Link>
              </CardField>
            )}
          </div>
        </Card>

        {relatedPayments.length > 0 && (
          <Card className="space-y-3">
            <CardTitle className="text-sm">Счета и платежи</CardTitle>
            <ul className="space-y-2 text-sm">
              {relatedPayments.map((payment) => (
                <li key={payment.id}>
                  {payment.number ? `${payment.number} · ` : ""}
                  {payment.description} — {formatPrice(payment.amount)}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {relatedDocuments.length > 0 && (
          <Card className="space-y-3">
            <CardTitle className="text-sm">Документы</CardTitle>
            <ul className="space-y-2 text-sm">
              {relatedDocuments.map((doc) => (
                <li key={doc.id}>
                  {doc.type} {doc.number}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

export default function EventOrderPageRoute() {
  return (
    <RequireAuth>
      <EventOrderPage />
    </RequireAuth>
  );
}
