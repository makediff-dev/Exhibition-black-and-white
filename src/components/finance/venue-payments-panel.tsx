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
import { VENUE_PAYMENT_ROLE_LABELS } from "@/constants/statuses";
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
  const storePayments = usePrototypeStore((state) => state.payments);
  const deals = usePrototypeStore((state) => state.deals);
  const payments = useMemo(() => mergePayments(storePayments), [storePayments]);
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("pending");
  const [directionFilter, setDirectionFilter] =
    useState<(typeof DIRECTION_FILTERS)[number]["id"]>("all");
  const [roleFilter, setRoleFilter] = useState<(typeof ROLE_FILTERS)[number]["id"]>("all");
  const [statusOverrides, setStatusOverrides] = useState<Record<string, Payment["status"]>>({});

  const venuePayments = useMemo(
    () => payments.filter((payment) => payment.venueId === venueId),
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

  const getStatus = (payment: Payment) => statusOverrides[payment.id] ?? payment.status;

  const filteredPayments = useMemo(() => {
    return venuePayments
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

        if (activeTab !== "pending") return true;

        const direction = payment.direction ?? "incoming";
        if (directionFilter !== "all" && direction !== directionFilter) return false;
        if (roleFilter !== "all" && payment.participantRole !== roleFilter) return false;

        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [venuePayments, activeTab, directionFilter, roleFilter, statusOverrides]);

  const summary = useMemo(() => {
    const pendingIncoming = venuePayments.filter(
      (payment) =>
        payment.type.includes("Счёт") &&
        getStatus(payment) === "pending" &&
        (payment.direction ?? "incoming") === "incoming"
    );
    const pendingOutgoing = venuePayments.filter(
      (payment) =>
        payment.type.includes("Счёт") &&
        getStatus(payment) === "pending" &&
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
  }, [venuePayments, statusOverrides]);

  const handlePay = (payment: Payment) => {
    setStatusOverrides((prev) => ({ ...prev, [payment.id]: "paid" }));
    showToast(`Оплата ${formatPrice(payment.amount)} выполнена (демо)`, "success");
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredPayments.map((payment) => {
            const status = getStatus(payment);
            const event = payment.eventId ? eventMap[payment.eventId] : undefined;
            const deal = payment.dealId ? dealMap[payment.dealId] : undefined;

            return (
              <Card key={payment.id} className="h-full flex flex-col">
                <div className="flex flex-wrap items-center gap-2 mb-[10px]">
                  <Badge variant="outline">{payment.type}</Badge>
                  <Badge variant={status === "pending" ? "solid" : "outline"}>
                    {PAYMENT_STATUS_LABELS[status]}
                  </Badge>
                  {payment.participantRole &&
                    payment.participantRole in VENUE_PAYMENT_ROLE_LABELS && (
                    <Badge variant="outline">
                      {
                        VENUE_PAYMENT_ROLE_LABELS[
                          payment.participantRole as keyof typeof VENUE_PAYMENT_ROLE_LABELS
                        ]
                      }
                    </Badge>
                  )}
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

                  {payment.organizerName && (
                    <p>
                      Организатор:{" "}
                      <Link
                        href="/account/organizer/profile"
                        className="underline hover:text-gray-900"
                      >
                        {payment.organizerName}
                      </Link>
                    </p>
                  )}

                  {event && (
                    <p className="flex items-start gap-1">
                      <Building2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>
                        <Link href={`/events/${event.id}`} className="underline hover:text-gray-900">
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
                      Оплата
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