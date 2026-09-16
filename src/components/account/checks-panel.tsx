"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import {
  EXTENDED_CHECK_PAYMENT_METHODS,
  EXTENDED_CHECK_PLANS,
} from "@/constants/statuses";
import { SEED_CONTRACTORS } from "@/data/mocks/seed";
import { useCartStore } from "@/lib/store";
import { EXTENDED_CHECK_CART_PREFIX } from "@/lib/utils/cart-utils";
import { formatPrice } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/components/ui/toast-provider";
import type { UserRole } from "@/data/types";
import { getContractorCheckHref } from "@/lib/utils/contractor-profile-links";

interface ExpressCheckRecord {
  id: string;
  type: "express";
  contractorId: string;
  name: string;
  checkedAt: string;
  result: string;
  summary: string;
  checks: { label: string; result: string; ok: boolean }[];
}

interface ExtendedCheckRecord {
  id: string;
  type: "extended";
  contractorId: string;
  name: string;
  checkedAt: string;
  result: string;
  reportFile: string;
  planLabel: string;
}

type CheckRecord = ExpressCheckRecord | ExtendedCheckRecord;

const INITIAL_CHECK_HISTORY: CheckRecord[] = [
  {
    id: "check-1",
    type: "express",
    contractorId: "ctr-1",
    name: "ООО «СтендПро»",
    checkedAt: "10.01.2026",
    result: "Риски не выявлены",
    summary:
      "Экспресс-проверка по открытым данным: регистрация действующая, блокировок счетов нет, арбитражных дел за 12 мес. — 0.",
    checks: [
      { label: "Регистрация в ЕГРЮЛ", result: "Действующая", ok: true },
      { label: "Блокировка счетов", result: "Не обнаружено", ok: true },
      { label: "Арбитражные дела", result: "0 дел за 12 мес.", ok: true },
      { label: "Верификация на платформе", result: "Подтверждена", ok: true },
    ],
  },
  {
    id: "check-2",
    type: "extended",
    contractorId: "ctr-2",
    name: "ООО «ДизайнСтенд»",
    checkedAt: "22.12.2025",
    result: "Расширенная проверка пройдена, существенных рисков не выявлено",
    reportFile: "Отчёт_ООО_ДизайнСтенд_22.12.2025.pdf",
    planLabel: "Расширенная проверка по 38 пунктам",
  },
];

function buildReportFileName(name: string, checkedAt: string) {
  const safeName = name.replace(/[«»]/g, "").replace(/\s+/g, "_");
  return `Отчёт_${safeName}_${checkedAt.replace(/\./g, "-")}.pdf`;
}

function downloadReportFile(record: ExtendedCheckRecord) {
  const body = [
    "Отчёт о расширенной проверке контрагента",
    "",
    `Организация: ${record.name}`,
    `Дата проверки: ${record.checkedAt}`,
    `Тариф: ${record.planLabel}`,
    "",
    record.result,
    "",
    "Документ сформирован автоматически и доступен для скачивания без ограничения срока.",
  ].join("\n");

  const blob = new Blob([body], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = record.reportFile;
  link.click();
  URL.revokeObjectURL(url);
}

interface ChecksPanelProps {
  role?: UserRole;
}

export function ChecksPanel({ role = "customer" }: ChecksPanelProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const addItem = useCartStore((state) => state.addItem);
  const [activeTab, setActiveTab] = useState<"history" | "tariffs">("history");
  const [history] = useState<CheckRecord[]>(INITIAL_CHECK_HISTORY);
  const [cartAdded, setCartAdded] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<
    (typeof EXTENDED_CHECK_PLANS)[number]["id"]
  >(EXTENDED_CHECK_PLANS[0].id);
  const [paymentMethod, setPaymentMethod] = useState<
    (typeof EXTENDED_CHECK_PAYMENT_METHODS)[number]["id"]
  >(EXTENDED_CHECK_PAYMENT_METHODS[0].id);
  const [orderContractorId, setOrderContractorId] = useState("ctr-1");
  const [orderContractorName, setOrderContractorName] = useState("ООО «СтендПро»");

  const sortedHistory = useMemo(
    () =>
      [...history].sort((a, b) => {
        const toKey = (value: string) => {
          const [day, month, year] = value.split(".");
          return `${year}-${month}-${day}`;
        };
        return toKey(b.checkedAt).localeCompare(toKey(a.checkedAt));
      }),
    [history]
  );

  const handleSubmit = () => {
    const plan = EXTENDED_CHECK_PLANS.find((item) => item.id === selectedPlanId);
    const payment = EXTENDED_CHECK_PAYMENT_METHODS.find((item) => item.id === paymentMethod);
    if (!plan || !payment) return;

    addItem({
      serviceId: `${EXTENDED_CHECK_CART_PREFIX}${Date.now()}`,
      quantity: 1,
      comment: `Контрагент: ${orderContractorName}. Способ оплаты: ${payment.label}.`,
      files: [],
      variantName: `${plan.label} — ${orderContractorName}`,
      unitPrice: plan.price,
    });

    setCartAdded(true);
    showToast("Тариф добавлен в корзину", "success");
    router.push("/account/customer/cart");
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
          {sortedHistory.map((check) => (
            <Card key={check.id} className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{check.name}</p>
                  <p className="text-sm text-gray-600 mt-1">Проверено {check.checkedAt}</p>
                </div>
                <Badge variant={check.type === "extended" ? "solid" : "outline"}>
                  {check.type === "extended" ? "Расширенная" : "Экспресс"}
                </Badge>
              </div>

              <p className="text-sm text-gray-700">{check.result}</p>

              {check.type === "express" ? (
                <div className="overflow-hidden rounded-card border border-gray-200 divide-y divide-gray-200">
                  <p className="px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50">
                    {check.summary}
                  </p>
                  {check.checks.map((item) => (
                    <div
                      key={item.label}
                      className="flex justify-between gap-4 px-3 py-2 text-sm"
                    >
                      <span className="text-gray-600">{item.label}</span>
                      <span className={item.ok ? "text-gray-900" : "text-gray-600"}>
                        {item.ok ? "✓" : "!"} {item.result}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-gray-200 p-3">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <FileText className="h-4 w-4 shrink-0" />
                    <span>{check.reportFile}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadReportFile(check)}
                  >
                    <Download className="h-4 w-4" />
                    Скачать отчёт
                  </Button>
                </div>
              )}
            </Card>
          ))}

          <div className="flex flex-wrap gap-2">
            <Link href={getContractorCheckHref("ctr-1", { role })}>
              <Button size="sm">Новая проверка</Button>
            </Link>
            <Button size="sm" variant="outline" onClick={() => setActiveTab("tariffs")}>
              Расширенная проверка
            </Button>
          </div>
        </div>
      )}

      {activeTab === "tariffs" && (
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            Расширенная дистанционная проверка выполняется партнёрами сервиса. Заказ добавляется в
            корзину — после оплаты отчёт автоматически появится в истории проверок.
          </p>

          <Card className="space-y-3">
            <p className="text-sm font-medium text-gray-900">Контрагент для проверки</p>
            <Select
              label="Исполнитель"
              value={orderContractorId}
              onChange={(event) => {
                const contractor = SEED_CONTRACTORS.find((item) => item.id === event.target.value);
                setOrderContractorId(event.target.value);
                if (contractor) setOrderContractorName(contractor.name);
              }}
              options={SEED_CONTRACTORS.map((contractor) => ({
                value: contractor.id,
                label: contractor.name,
              }))}
            />
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                    "check-plan-card text-left border p-4 transition-colors",
                    isSelected
                      ? "border-[var(--account-accent,#2939eb)] bg-[var(--account-accent-soft,#eef0fe)]"
                      : "border-gray-300 hover:border-[var(--account-accent,#2939eb)] hover:bg-[var(--account-accent-soft,#eef0fe)]",
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

          <Button onClick={handleSubmit}>Добавить в корзину</Button>
          <p className="text-sm text-gray-600">
            Заказ попадёт в корзину. Оплатите его в разделе «Корзина / заказы из каталога».
          </p>
          {cartAdded && (
            <Card className="bg-gray-50 space-y-3">
              <p className="text-sm text-gray-900">
                Тариф добавлен в корзину. Перейдите в корзину, чтобы оформить оплату.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => router.push("/account/customer/cart")}>
                  Перейти в корзину
                </Button>
                <Button size="sm" variant="outline" onClick={() => setCartAdded(false)}>
                  Продолжить выбор
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}