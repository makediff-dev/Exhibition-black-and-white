"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import {
  EXTENDED_CHECK_PAYMENT_METHODS,
  EXTENDED_CHECK_PLANS,
} from "@/constants/statuses";
import { formatPrice } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/components/ui/toast-provider";

const CHECK_HISTORY = [
  {
    id: "check-1",
    contractorId: "ctr-1",
    name: "ООО «СтендПро»",
    checkedAt: "10.01.2026",
    result: "Риски не выявлены",
  },
];

export function ChecksPanel() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"history" | "tariffs">("history");
  const [selectedPlanId, setSelectedPlanId] = useState<
    (typeof EXTENDED_CHECK_PLANS)[number]["id"]
  >(EXTENDED_CHECK_PLANS[0].id);
  const [paymentMethod, setPaymentMethod] = useState<
    (typeof EXTENDED_CHECK_PAYMENT_METHODS)[number]["id"]
  >(EXTENDED_CHECK_PAYMENT_METHODS[0].id);

  const handleSubmit = () => {
    const plan = EXTENDED_CHECK_PLANS.find((item) => item.id === selectedPlanId);
    const payment = EXTENDED_CHECK_PAYMENT_METHODS.find((item) => item.id === paymentMethod);
    showToast(
      `Заказ оформлен: ${plan?.label}, оплата — ${payment?.label.toLowerCase()}`,
      "success"
    );
  };

  return (
    <div className="space-y-4">
      <Tabs
        tabs={[
          { id: "history", label: "История проверок" },
          { id: "tariffs", label: "Тарифы и оплата" },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as "history" | "tariffs")}
      />

      {activeTab === "history" && (
        <div className="space-y-4">
          {CHECK_HISTORY.map((check) => (
            <Card key={check.id} className="space-y-2">
              <p className="font-semibold text-gray-900">{check.name}</p>
              <p className="text-sm text-gray-600">Проверено {check.checkedAt}</p>
              <p className="text-sm text-gray-700">
                {check.result}. Для того, чтобы быть более уверенным в надежности исполнителя,
                закажите расширенную проверку по 38 пунктам.
              </p>
            </Card>
          ))}

          <div className="flex flex-wrap gap-2">
            <Link href="/contractors/ctr-1/check">
              <Button size="sm">
                Новая проверка
              </Button>
            </Link>
            <Link href="/contractors/ctr-1/check">
              <Button variant="outline" size="sm">
                Экспресс проверка
              </Button>
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("tariffs")}
            className="text-sm text-gray-900 hover:underline"
          >
            Заказать расширенную проверку
          </button>
        </div>
      )}

      {activeTab === "tariffs" && (
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            Выберите тариф расширенной проверки и способ оплаты
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {EXTENDED_CHECK_PLANS.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              const priceLabel =
                "period" in plan && plan.period
                  ? `${formatPrice(plan.price)} / ${plan.period}`
                  : formatPrice(plan.price);

              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={cn(
                    "text-left border p-4 transition-colors",
                    isSelected
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-300 hover:border-gray-500"
                  )}
                >
                  <p className="text-sm font-medium text-gray-900">{plan.label}</p>
                  <p className="text-lg font-bold mt-1">{priceLabel}</p>
                  {"note" in plan && plan.note && (
                    <p className="text-xs text-gray-500 mt-1">{plan.note}</p>
                  )}
                </button>
              );
            })}
          </div>

          <Card>
            <p className="text-sm font-medium text-gray-900 mb-3">Варианты оплаты</p>
            <ul className="space-y-2">
              {EXTENDED_CHECK_PAYMENT_METHODS.map((method) => (
                <li key={method.id}>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="check-payment"
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                      className="border-gray-900"
                    />
                    {method.label}
                  </label>
                </li>
              ))}
            </ul>
          </Card>

          <Button onClick={handleSubmit}>Оформить заказ</Button>
        </div>
      )}
    </div>
  );
}
