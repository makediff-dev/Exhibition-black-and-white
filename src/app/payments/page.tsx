"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CreditCard, Shield, Wallet } from "lucide-react";
import { SharedPageShell } from "@/components/layout/shared-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast-provider";
import type { Payment } from "@/data/types";
import { usePrototypeStore } from "@/lib/store";
import { formatDate, formatPrice } from "@/lib/utils/formatters";

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

export default function PaymentsPage() {
  const { payments, deals } = usePrototypeStore();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("pending");
  const [statusOverrides, setStatusOverrides] = useState<Record<string, Payment["status"]>>({});

  const getStatus = (payment: Payment) => statusOverrides[payment.id] ?? payment.status;

  const dealMap = useMemo(
    () => Object.fromEntries(deals.map((d) => [d.id, d])),
    [deals]
  );

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const status = getStatus(p);
      switch (activeTab) {
        case "pending":
          return p.type.includes("Счёт") && status === "pending";
        case "history":
          return status === "paid";
        case "safe":
          return p.type === "Резерв" || p.description.includes("Безопасная");
        case "payouts":
          return p.type === "Выплата";
        case "refunds":
          return status === "refunded";
        default:
          return true;
      }
    });
  }, [payments, activeTab, statusOverrides]);

  const breakdown = useMemo(() => {
    const orderAmount = deals.reduce((sum, d) => sum + d.totalPrice, 0);
    const reserve = payments
      .filter((p) => getStatus(p) === "reserved")
      .reduce((sum, p) => sum + p.amount, 0);
    const paid = payments
      .filter((p) => getStatus(p) === "paid")
      .reduce((sum, p) => sum + p.amount, 0);
    const commission = deals.reduce((sum, d) => sum + d.commission, 0);
    const refunded = payments
      .filter((p) => getStatus(p) === "refunded")
      .reduce((sum, p) => sum + p.amount, 0);
    const available = reserve - paid - commission;

    return { orderAmount, reserve, paid, commission, available: Math.max(0, available), refunded };
  }, [deals, payments, statusOverrides]);

  const handlePay = (payment: Payment) => {
    setStatusOverrides((prev) => ({ ...prev, [payment.id]: "paid" }));
    showToast(`Оплата ${formatPrice(payment.amount)} выполнена (демо)`, "success");
  };

  return (
    <SharedPageShell
      title="Оплаты и финансы"
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Оплаты" },
      ]}
      maxWidth="wide"
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <Card>
          <CardDescription>Сумма заказов</CardDescription>
          <CardTitle className="mt-1">{formatPrice(breakdown.orderAmount)}</CardTitle>
        </Card>
        <Card>
          <CardDescription className="flex items-center gap-1">
            <Shield className="h-3.5 w-3.5" /> Резерв
          </CardDescription>
          <CardTitle className="mt-1">{formatPrice(breakdown.reserve)}</CardTitle>
        </Card>
        <Card>
          <CardDescription>Оплачено</CardDescription>
          <CardTitle className="mt-1">{formatPrice(breakdown.paid)}</CardTitle>
        </Card>
        <Card>
          <CardDescription>Комиссия платформы</CardDescription>
          <CardTitle className="mt-1">{formatPrice(breakdown.commission)}</CardTitle>
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

      {filteredPayments.length === 0 ? (
        <EmptyState
          title="Записи не найдены"
          description="В этой вкладке пока нет финансовых операций"
        />
      ) : (
        <div className="space-y-3">
          {filteredPayments.map((payment) => {
            const status = getStatus(payment);
            const deal = dealMap[payment.dealId];

            return (
              <Card key={payment.id}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge variant="outline">{payment.type}</Badge>
                      <Badge variant={status === "pending" ? "solid" : "outline"}>
                        {PAYMENT_STATUS_LABELS[status]}
                      </Badge>
                    </div>
                    <p className="text-lg font-semibold">{formatPrice(payment.amount)}</p>
                    <p className="text-sm text-gray-600 mt-1">{payment.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(payment.date)}</p>
                    {deal && (
                      <p className="text-sm mt-2">
                        <Link href={`/deals/${deal.id}`} className="underline hover:text-gray-900">
                          {deal.number} — {deal.title}
                        </Link>
                      </p>
                    )}
                  </div>

                  {status === "pending" && (
                    <Button onClick={() => handlePay(payment)}>
                      <CreditCard className="h-4 w-4" />
                      Оплатить
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </SharedPageShell>
  );
}
