"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Building2, CalendarDays, CreditCard, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast-provider";
import { ORGANIZER_PAYMENT_ROLE_LABELS } from "@/constants/statuses";
import { SEED_EVENTS, SEED_PAYMENTS } from "@/data/mocks/seed";
import type { Payment } from "@/data/types";
import { usePrototypeStore } from "@/lib/store";
import { formatDate, formatPrice, formatShortDate } from "@/lib/utils/formatters";

const PAYMENT_TABS = [
  { id: "pending", label: "Счета к оплате" },
  { id: "history", label: "История платежей" },
  { id: "safe", label: "Безопасные сделки" },
  { id: "payouts", label: "Выплаты" },
  { id: "refunds", label: "Возвраты" },
];

const PAYMENT_STATUS_LABELS: Record<Payment["status"], string> = {
  pending: "Ожидает оплаты",
  paid: "Оплачено",
  reserved: "Зарезервировано",
  refunded: "Возвращено",
};

const DIRECTION_FILTERS = [
  { id: "all", label: "Все" },
  { id: "incoming", label: "Входящие" },
  { id: "outgoing", label: "Исходящие" },
] as const;

const ROLE_FILTERS = [
  { id: "all", label: "Все" },
  { id: "exhibitor", label: "Экспоненты" },
  { id: "contractor", label: "Подрядчики" },
  { id: "venue", label: "Площадки" },
] as const;

function mergePayments(storedPayments: Payment[]): Payment[] {
  const ids = new Set(storedPayments.map((payment) => payment.id));
  const missing = SEED_PAYMENTS.filter((payment) => !ids.has(payment.id));
  return missing.length ? [...storedPayments, ...missing] : storedPayments;
}

interface Props {
  organizerId?: string;
}

export function OrganizerPaymentsPanel({ organizerId = "user-organizer" }: Props) {
  const storePayments = usePrototypeStore((state) => state.payments);
  const deals = usePrototypeStore((state) => state.deals);
  const payments = useMemo(() => mergePayments(storePayments), [storePayments]);
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("pending");
  const [directionFilter, setDirectionFilter] =
    useState<(typeof DIRECTION_FILTERS)[number]["id"]>("all");
  const [roleFilter, setRoleFilter] = useState<(typeof ROLE_FILTERS)[number]["id"]>("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [statusOverrides, setStatusOverrides] = useState<Record<string, Payment["status"]>>({});

  const organizerPayments = useMemo(
    () => payments.filter((payment) => payment.organizerId === organizerId),
    [payments, organizerId]
  );

  const eventMap = useMemo(
    () => Object.fromEntries(SEED_EVENTS.map((event) => [event.id, event])),
    []
  );

  const organizerEvents = useMemo(() => {
    const eventIds = new Set(
      organizerPayments
        .map((payment) => payment.eventId)
        .filter((eventId): eventId is string => Boolean(eventId))
    );
    return SEED_EVENTS.filter(
      (event) => event.organizerId === organizerId && eventIds.has(event.id)
    );
  }, [organizerPayments, organizerId]);

  const dealMap = useMemo(
    () => Object.fromEntries(deals.map((deal) => [deal.id, deal])),
    [deals]
  );

  const getStatus = (payment: Payment) => statusOverrides[payment.id] ?? payment.status;

  const filteredPayments = useMemo(() => {
    return organizerPayments
      .filter((payment) => {
        const status = getStatus(payment);
        const matchesTab = (() => {
          switch (activeTab) {
            case "pending":
              return payment.type.includes("Счёт") && status === "pending";
            case "history":
              return status === "paid";
            case "safe":
              return payment.type === "Резерв" || payment.description.includes("Безопасная");
            case "payouts":
              return payment.type === "Выплата";
            case "refunds":
              return status === "refunded";
            default:
              return true;
          }
        })();

        if (!matchesTab) return false;
        if (eventFilter !== "all" && payment.eventId !== eventFilter) return false;
        if (activeTab !== "pending") return true;

        const direction = payment.direction ?? "incoming";
        if (directionFilter !== "all" && direction !== directionFilter) return false;
        if (roleFilter !== "all" && payment.participantRole !== roleFilter) return false;

        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [organizerPayments, activeTab, directionFilter, roleFilter, eventFilter, statusOverrides]);

  const summary = useMemo(() => {
    const pendingIncoming = organizerPayments.filter(
      (payment) =>
        payment.type.includes("Счёт") &&
        getStatus(payment) === "pending" &&
        (payment.direction ?? "incoming") === "incoming"
    );
    const pendingOutgoing = organizerPayments.filter(
      (payment) =>
        payment.type.includes("Счёт") &&
        getStatus(payment) === "pending" &&
        payment.direction === "outgoing"
    );
    const paid = organizerPayments.filter((payment) => getStatus(payment) === "paid");
    const refunded = organizerPayments.filter((payment) => getStatus(payment) === "refunded");

    return {
      incomingAmount: pendingIncoming.reduce((sum, payment) => sum + payment.amount, 0),
      outgoingAmount: pendingOutgoing.reduce((sum, payment) => sum + payment.amount, 0),
      paidAmount: paid.reduce((sum, payment) => sum + payment.amount, 0),
      refundedAmount: refunded.reduce((sum, payment) => sum + payment.amount, 0),
      incomingCount: pendingIncoming.length,
      outgoingCount: pendingOutgoing.length,
    };
  }, [organizerPayments, statusOverrides]);

  const handlePay = (payment: Payment) => {
    setStatusOverrides((prev) => ({ ...prev, [payment.id]: "paid" }));
    const action =
      payment.direction === "outgoing" ? "Оплата выполнена" : "Поступление подтверждено";
    showToast(`${action}: ${formatPrice(payment.amount)} (демо)`, "success");
  };

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

      {activeTab === "pending" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 max-w-3xl">
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
            label="Контрагенты"
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value as (typeof ROLE_FILTERS)[number]["id"])
            }
            options={ROLE_FILTERS.map((filter) => ({
              value: filter.id,
              label: filter.label,
            }))}
          />
          {organizerEvents.length > 0 && (
            <Select
              label="Мероприятие"
              value={eventFilter}
              onChange={(event) => setEventFilter(event.target.value)}
              options={[
                { value: "all", label: "Все мероприятия" },
                ...organizerEvents.map((event) => ({
                  value: event.id,
                  label: event.title,
                })),
              ]}
            />
          )}
        </div>
      )}

      {activeTab !== "pending" && organizerEvents.length > 1 && (
        <div className="mb-6 max-w-xs">
          <Select
            label="Мероприятие"
            value={eventFilter}
            onChange={(event) => setEventFilter(event.target.value)}
            options={[
              { value: "all", label: "Все мероприятия" },
              ...organizerEvents.map((event) => ({
                value: event.id,
                label: event.title,
              })),
            ]}
          />
        </div>
      )}

      {filteredPayments.length === 0 ? (
        <EmptyState
          title="Записи не найдены"
          description="В этой вкладке пока нет финансовых операций по выбранным фильтрам"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredPayments.map((payment) => {
            const status = getStatus(payment);
            const event = payment.eventId ? eventMap[payment.eventId] : undefined;
            const deal = payment.dealId ? dealMap[payment.dealId] : undefined;
            const roleLabel =
              payment.participantRole &&
              payment.participantRole in ORGANIZER_PAYMENT_ROLE_LABELS
                ? ORGANIZER_PAYMENT_ROLE_LABELS[
                    payment.participantRole as keyof typeof ORGANIZER_PAYMENT_ROLE_LABELS
                  ]
                : undefined;

            return (
              <Card key={payment.id} className="cabinet-card h-full flex flex-col">
                <div className="flex flex-wrap items-center gap-2 mb-[10px]">
                  <Badge variant="outline">{payment.type}</Badge>
                  <Badge variant={status === "pending" ? "solid" : "outline"}>
                    {PAYMENT_STATUS_LABELS[status]}
                  </Badge>
                  {roleLabel && <Badge variant="outline">{roleLabel}</Badge>}
                  {payment.direction && (
                    <Badge variant="outline">
                      {payment.direction === "incoming" ? "Входящий" : "Исходящий"}
                    </Badge>
                  )}
                </div>

                <p className="text-lg font-semibold mb-[10px]">{formatPrice(payment.amount)}</p>
                <p className="text-sm text-gray-600 mb-[10px]">{payment.description}</p>

                <div className="space-y-[10px] text-sm flex-1">
                  <p className="flex items-center gap-1 text-xs text-gray-500">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                    {formatDate(payment.date)}
                  </p>

                  {payment.counterpartyName && (
                    <p className="flex items-center gap-1 text-gray-700">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      {payment.counterpartyName}
                    </p>
                  )}

                  {event && (
                    <p className="flex items-start gap-1">
                      <Building2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>
                        <Link
                          href={`/account/organizer/edit-event?id=${event.id}`}
                          className="underline hover:text-gray-900"
                        >
                          {event.title}
                        </Link>
                        <span className="block text-xs text-gray-500 mt-0.5">
                          {formatShortDate(event.startDate)} — {formatShortDate(event.endDate)}
                        </span>
                      </span>
                    </p>
                  )}

                  {deal && (
                    <p>
                      <Link href={`/deals/${deal.id}`} className="underline hover:text-gray-900">
                        {deal.number} — {deal.title}
                      </Link>
                    </p>
                  )}
                </div>

                {status === "pending" && (
                  <div className="mt-[10px] pt-[10px]">
                    <Button className="w-full" onClick={() => handlePay(payment)}>
                      <CreditCard className="h-4 w-4" />
                      {payment.direction === "outgoing" ? "Оплатить" : "Подтвердить поступление"}
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}