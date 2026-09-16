"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { HelpCircle, Shield, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { Tabs } from "@/components/ui/tabs";
import { Tooltip } from "@/components/ui/tooltip";
import type { Payment } from "@/data/types";
import { SEED_PAYMENTS } from "@/data/mocks/seed";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { isDealForUser } from "@/lib/utils/user-entity-map";
import { isPaymentForUser } from "@/lib/utils/cabinet-scope";
import { DisputesTab } from "@/components/finance/disputes-tab";
import { formatDate, formatPrice } from "@/lib/utils/formatters";

const PENDING_PAYMENT_ORDER = ["pay-4", "pay-8", "pay-9"];

function mergePayments(storedPayments: Payment[]): Payment[] {
  const ids = new Set(storedPayments.map((payment) => payment.id));
  const missing = SEED_PAYMENTS.filter((payment) => !ids.has(payment.id));
  return missing.length ? [...storedPayments, ...missing] : storedPayments;
}

const PAYMENT_TABS = [
  { id: "pending", label: "Счета к оплате" },
  { id: "history", label: "История платежей" },
  { id: "safe", label: "Безопасные сделки" },
  { id: "payouts", label: "Выплаты" },
  { id: "refunds", label: "Возвраты" },
  { id: "disputes", label: "Споры" },
];

const PAYMENT_STATUS_LABELS: Record<Payment["status"], string> = {
  pending: "Ожидает оплаты",
  paid: "Оплачено",
  reserved: "Зарезервировано",
  refunded: "Возвращено",
};

export function PaymentsPanel({ defaultTab = "pending" }: { defaultTab?: string }) {
  const user = useAuthStore((s) => s.user);
  const storePayments = usePrototypeStore((state) => state.payments);
  const deals = usePrototypeStore((state) => state.deals);
  const payments = useMemo(() => mergePayments(storePayments), [storePayments]);

  const [activeTab, setActiveTab] = useState(defaultTab);

  const dealMap = useMemo(
    () => Object.fromEntries(deals.map((d) => [d.id, d])),
    [deals]
  );

  const scopedPayments = useMemo(
    () => payments.filter((payment) => isPaymentForUser(payment, user, deals)),
    [payments, user, deals]
  );

  const filteredPayments = useMemo(() => {
    const filtered = scopedPayments.filter((p) => {
      switch (activeTab) {
        case "pending":
          return p.type.includes("Счёт") && p.status === "pending";
        case "history":
          return p.status === "paid";
        case "safe":
          return p.type === "Резерв" || p.description.includes("Безопасная");
        case "payouts":
          return p.type === "Выплата";
        case "refunds":
          return p.status === "refunded";
        default:
          return true;
      }
    });

    if (activeTab !== "pending") return filtered;

    return [...filtered].sort((a, b) => {
      const aIndex = PENDING_PAYMENT_ORDER.indexOf(a.id);
      const bIndex = PENDING_PAYMENT_ORDER.indexOf(b.id);
      if (aIndex !== -1 || bIndex !== -1) {
        return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
      }
      return a.date.localeCompare(b.date);
    });
  }, [scopedPayments, activeTab]);

  const breakdown = useMemo(() => {
    const myDeals = deals.filter((deal) => isDealForUser(deal, user));
    const orderAmount = myDeals.reduce((sum, d) => sum + d.totalPrice, 0);
    const reserve = scopedPayments
      .filter((p) => p.status === "reserved")
      .reduce((sum, p) => sum + p.amount, 0);
    const paid = scopedPayments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0);
    const refunded = scopedPayments
      .filter((p) => p.status === "refunded")
      .reduce((sum, p) => sum + p.amount, 0);
    const available = reserve - paid;

    return { orderAmount, reserve, paid, available: Math.max(0, available), refunded };
  }, [deals, scopedPayments, user]);

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          <Card>
            <CardDescription>Сумма заказов</CardDescription>
            <CardTitle className="mt-1">{formatPrice(breakdown.orderAmount)}</CardTitle>
          </Card>
          <Card>
            <CardDescription className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 shrink-0" />
              <span>В резерве</span>
              <Tooltip
                persistent
                placement="bottom"
                content="Замороженные на платформе средства по безопасным сделкам. Оплата зарезервирована до приёмки работ и переводится исполнителям после подтверждения этапов."
              >
                <button
                  type="button"
                  className="shrink-0 text-gray-500 hover:text-gray-900"
                  aria-label="Что такое резерв"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
            </CardDescription>
            <CardTitle className="mt-1">{formatPrice(breakdown.reserve)}</CardTitle>
          </Card>
          <Card>
            <CardDescription>Оплачено</CardDescription>
            <CardTitle className="mt-1">{formatPrice(breakdown.paid)}</CardTitle>
          </Card>
          <Card>
            <CardDescription className="flex items-center gap-1">
              <Wallet className="h-3.5 w-3.5" /> Доступно
            </CardDescription>
            <CardTitle className="mt-1">{formatPrice(breakdown.available)}</CardTitle>
          </Card>
          <Card>
            <CardDescription>Возвращено</CardDescription>
            <CardTitle className="mt-1">{formatPrice(breakdown.refunded)}</CardTitle>
        </Card>
      </div>

      <Tabs tabs={PAYMENT_TABS} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />

      {activeTab === "disputes" ? (
        <DisputesTab deals={deals} />
      ) : filteredPayments.length === 0 ? (
        <EmptyState
          title="Записи не найдены"
          description="В этой вкладке пока нет финансовых операций"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPayments.map((payment) => {
            const deal = payment.dealId ? dealMap[payment.dealId] : undefined;

            return (
              <Card key={payment.id} className="flex flex-col h-full">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {activeTab !== "history" && activeTab !== "payouts" && (
                    <Badge variant="muted">{payment.type}</Badge>
                  )}
                  <Badge variant={payment.status === "pending" ? "solid" : "muted"}>
                    {PAYMENT_STATUS_LABELS[payment.status]}
                  </Badge>
                </div>
                <p className="text-lg font-semibold">{formatPrice(payment.amount)}</p>
                <p className="text-sm text-gray-600 mt-2 flex-1">{payment.description}</p>
                <p className="text-xs text-gray-500 mt-2">{formatDate(payment.date)}</p>
                {deal && payment.dealId && (
                  <p className="text-sm mt-3">
                    <Link href={`/deals/${deal.id}`} className="underline hover:text-gray-900">
                      {deal.number} — {deal.title}
                    </Link>
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}