"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { CardField } from "@/components/ui/card-field";
import { EmptyState } from "@/components/ui/states";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import { VENUE_PAYMENT_ROLE_LABELS } from "@/constants/statuses";
import { SEED_EVENTS, SEED_PAYMENTS } from "@/data/mocks/seed";
import type { Payment } from "@/data/types";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { formatDate, formatPrice, formatShortDate } from "@/lib/utils/formatters";
import { getPaymentStatus, isOpenInvoice } from "@/lib/state/payment-machine";
import { getEscrowLinkNote, isFinanceEscrow } from "@/lib/domain/finance";
import {
  getPaymentOperationLabel,
  getPaymentTradeSideLabel,
  isViewerPayer,
  isViewerPayee,
  keepOwnLedgerCopy,
} from "@/lib/utils/payment-presentation";

const PAYMENT_TABS = [
  { id: "payable", label: "К оплате" },
  { id: "receivable", label: "К получению" },
  { id: "history", label: "История платежей" },
  { id: "safe", label: "Безопасные сделки" },
  { id: "payouts", label: "Выплаты" },
  { id: "refunds", label: "Возвраты" },
];

const ROLE_FILTERS = [
  { id: "all", label: "Все" },
  { id: "organizer", label: "Организаторы" },
  { id: "exhibitor", label: "Экспоненты" },
  { id: "contractor", label: "Застройщики" },
] as const;

const DIRECTION_FILTERS = [
  { id: "all", label: "Все" },
  { id: "incoming", label: "Входящие" },
  { id: "outgoing", label: "Исходящие" },
] as const;

function mergePayments(storedPayments: Payment[]): Payment[] {
  const ids = new Set(storedPayments.map((payment) => payment.id));
  const missing = SEED_PAYMENTS.filter((payment) => !ids.has(payment.id));
  return missing.length ? [...storedPayments, ...missing] : storedPayments;
}

interface Props {
  venueId?: string;
}

export function VenuePaymentsPanel({ venueId = "venue-1" }: Props) {
  const user = useAuthStore((state) => state.user);
  const storePayments = usePrototypeStore((state) => state.payments);
  const deals = usePrototypeStore((state) => state.deals);
  const payments = useMemo(() => mergePayments(storePayments), [storePayments]);

  const [activeTab, setActiveTab] = useState("receivable");
  const [directionFilter, setDirectionFilter] =
    useState<(typeof DIRECTION_FILTERS)[number]["id"]>("all");
  const [roleFilter, setRoleFilter] = useState<(typeof ROLE_FILTERS)[number]["id"]>("all");

  const venuePayments = useMemo(
    () =>
      keepOwnLedgerCopy(
        payments.filter((payment) => payment.venueId === venueId && !payment.id.startsWith("opay")),
        "venue"
      ),
    [payments, venueId]
  );

  const eventMap = useMemo(
    () => Object.fromEntries(SEED_EVENTS.map((event) => [event.id, event])),
    []
  );

  const dealMap = useMemo(
    () => Object.fromEntries(deals.map((deal) => [deal.id, deal])),
    [deals]
  );

  const getStatus = (payment: Payment) => getPaymentStatus(payment, user).code;

  const filteredPayments = useMemo(() => {
    return venuePayments
      .filter((payment) => {
        const status = getStatus(payment);
        const matchesTab = (() => {
          switch (activeTab) {
            case "payable":
              return isOpenInvoice(payment) && isViewerPayer(payment, user);
            case "receivable":
              return isOpenInvoice(payment) && isViewerPayee(payment, user);
            case "history":
              return status === "paid";
            case "safe":
              return isFinanceEscrow(payment);
            case "payouts":
              return payment.type === "Выплата";
            case "refunds":
              return status === "refunded";
            default:
              return true;
          }
        })();

        if (!matchesTab) return false;

        if (activeTab !== "payable" && activeTab !== "receivable") return true;

        const direction = payment.direction ?? "incoming";
        if (directionFilter !== "all" && direction !== directionFilter) return false;
        if (roleFilter !== "all" && payment.participantRole !== roleFilter) return false;

        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [venuePayments, activeTab, directionFilter, roleFilter, user]);

  const summary = useMemo(() => {
    const pendingIncoming = venuePayments.filter(
      (payment) =>
        payment.type.includes("Счёт") &&
        isOpenInvoice(payment) &&
        (payment.direction ?? "incoming") === "incoming"
    );
    const pendingOutgoing = venuePayments.filter(
      (payment) =>
        payment.type.includes("Счёт") &&
        isOpenInvoice(payment) &&
        payment.direction === "outgoing"
    );
    const paid = venuePayments.filter((payment) => getStatus(payment) === "paid");
    const refunded = venuePayments.filter((payment) => getStatus(payment) === "refunded");

    return {
      incomingAmount: pendingIncoming.reduce((sum, payment) => sum + payment.amount, 0),
      outgoingAmount: pendingOutgoing.reduce((sum, payment) => sum + payment.amount, 0),
      paidAmount: paid.reduce((sum, payment) => sum + payment.amount, 0),
      refundedAmount: refunded.reduce((sum, payment) => sum + payment.amount, 0),
      incomingCount: pendingIncoming.length,
      outgoingCount: pendingOutgoing.length,
    };
  }, [venuePayments]);

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card>
          <CardDescription>Входящие счета</CardDescription>
          <CardTitle className="mt-1">{formatPrice(summary.incomingAmount)}</CardTitle>
          <p className="text-xs text-gray-500 mt-1">{summary.incomingCount} ожидают оплаты</p>
        </Card>
        <Card>
          <CardDescription>Исходящие счета</CardDescription>
          <CardTitle className="mt-1">{formatPrice(summary.outgoingAmount)}</CardTitle>
          <p className="text-xs text-gray-500 mt-1">{summary.outgoingCount} к оплате</p>
        </Card>
        <Card>
          <CardDescription>Оплачено</CardDescription>
          <CardTitle className="mt-1">{formatPrice(summary.paidAmount)}</CardTitle>
        </Card>
        <Card>
          <CardDescription>Возвращено</CardDescription>
          <CardTitle className="mt-1">{formatPrice(summary.refundedAmount)}</CardTitle>
        </Card>
      </div>

      <Tabs tabs={PAYMENT_TABS} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />
      <p className="text-xs text-gray-500 mb-6">
        Зеркальные записи контрагента скрыты: в списке один счёт, а не два начисления.
      </p>

      {(activeTab === "payable" || activeTab === "receivable") && (
        <div className="grid sm:grid-cols-2 gap-4 mb-6 max-w-2xl">
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
          <Select
            label="Участники"
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value as (typeof ROLE_FILTERS)[number]["id"])
            }
            options={ROLE_FILTERS.map((filter) => ({
              value: filter.id,
              label: filter.label,
            }))}
          />
        </div>
      )}

      {filteredPayments.length === 0 ? (
        <EmptyState
          title="Записи не найдены"
          description="В этой вкладке пока нет финансовых операций по выбранным фильтрам"
        />
      ) : (
        <div className="catalog-cards-grid">
          {filteredPayments.map((payment) => {
            const status = getStatus(payment);
            const event = payment.eventId ? eventMap[payment.eventId] : undefined;
            const deal = payment.dealId ? dealMap[payment.dealId] : undefined;

            const cardHref = deal
              ? `/deals/${deal.id}`
              : payment.orderId
                ? `/orders/${payment.orderId}`
                : "/account/venue/payments";

            return (
              <Link key={payment.id} href={cardHref} className="block h-full cursor-pointer">
              <Card hoverable className="h-full flex flex-col cursor-pointer">
                <div className="flex flex-wrap items-center gap-2 mb-[10px]">
                  <Badge variant="muted">{getPaymentOperationLabel(payment.type, payment)}</Badge>
                  <Badge variant="outline">{getPaymentTradeSideLabel(payment, user)}</Badge>
                  <Badge variant={isOpenInvoice(payment) ? "solid" : "muted"}>
                    {getPaymentStatus(payment, user).label}
                  </Badge>
                  {payment.participantRole &&
                    payment.participantRole in VENUE_PAYMENT_ROLE_LABELS && (
                    <Badge variant="muted">
                      {
                        VENUE_PAYMENT_ROLE_LABELS[
                          payment.participantRole as keyof typeof VENUE_PAYMENT_ROLE_LABELS
                        ]
                      }
                    </Badge>
                  )}
                </div>

                <p className="text-lg font-semibold mb-[10px]">{formatPrice(payment.amount)}</p>
                <div className="space-y-[10px] flex-1">
                  <CardField label="Счёт">
                    {payment.number ?? "будет присвоен после выставления"}
                  </CardField>
                  <CardField label="Описание">{payment.description}</CardField>
                  <CardField label="Плательщик">{payment.payerName ?? "не указан"}</CardField>
                  <CardField label="Получатель">{payment.payeeName ?? "не указан"}</CardField>
                  {(!payment.payerName || !payment.payeeName) && (
                    <CardField label="Реквизиты">
                      <span>Открыть профиль и реквизиты в меню «Профиль площадки»</span>
                    </CardField>
                  )}
                  {getEscrowLinkNote(payment, venuePayments) && (
                    <CardField label="Резерв">{getEscrowLinkNote(payment, venuePayments)}</CardField>
                  )}
                  <CardField label="Дата">{formatDate(payment.date)}</CardField>
                  {payment.counterpartyName && (
                    <CardField label="Контрагент">{payment.counterpartyName}</CardField>
                  )}
                  {payment.organizerName && (
                    <CardField label="Организатор">{payment.organizerName}</CardField>
                  )}
                  {event && (
                    <CardField label="Мероприятие">
                      <span>{event.title}</span>
                      {` · ${formatShortDate(event.startDate)} — ${formatShortDate(event.endDate)}`}
                    </CardField>
                  )}
                  {deal && (
                    <CardField label="Сделка">
                      <span>
                        {deal.number} — {deal.title}
                      </span>
                    </CardField>
                  )}
                  {payment.orderId && !deal ? <CardField label="Заказ">Связанный заказ</CardField> : null}
                </div>
              </Card>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}