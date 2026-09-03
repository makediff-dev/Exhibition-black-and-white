"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  EXTENDED_CHECK_PAYMENT_METHODS,
  EXTENDED_CHECK_PLANS,
} from "@/constants/statuses";
import { SEED_CONTRACTORS } from "@/data/mocks/seed";
import type { UserRole } from "@/data/types";
import { useCartStore } from "@/lib/store";
import { EXTENDED_CHECK_CART_PREFIX } from "@/lib/utils/cart-utils";
import { formatPrice } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/components/ui/toast-provider";

interface Props {
  contractorId: string;
  backFallbackHref: string;
  accountRole?: UserRole | null;
}

export function ContractorCheckSubscribeSection({
  contractorId,
  backFallbackHref,
  accountRole = null,
}: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const addItem = useCartStore((state) => state.addItem);

  const contractor = SEED_CONTRACTORS.find((entry) => entry.id === contractorId);
  const [selectedPlanId, setSelectedPlanId] = useState<
    (typeof EXTENDED_CHECK_PLANS)[number]["id"]
  >(EXTENDED_CHECK_PLANS[0].id);
  const [paymentMethod, setPaymentMethod] = useState<
    (typeof EXTENDED_CHECK_PAYMENT_METHODS)[number]["id"]
  >(EXTENDED_CHECK_PAYMENT_METHODS[0].id);
  const [cartAdded, setCartAdded] = useState(false);

  if (!contractor) return null;

  const handleSubmit = () => {
    const plan = EXTENDED_CHECK_PLANS.find((item) => item.id === selectedPlanId);
    const payment = EXTENDED_CHECK_PAYMENT_METHODS.find((item) => item.id === paymentMethod);
    if (!plan || !payment) return;

    addItem({
      serviceId: `${EXTENDED_CHECK_CART_PREFIX}${Date.now()}`,
      quantity: 1,
      comment: `Контрагент: ${contractor.name}. Способ оплаты: ${payment.label}.`,
      files: [],
      variantName: `${plan.label} — ${contractor.name}`,
      unitPrice: plan.price,
    });

    setCartAdded(true);
    showToast("Тариф добавлен в корзину", "success");
  };

  const cartHref =
    accountRole === "customer" ? "/account/customer/cart" : "/cart";

  return (
    <>
      <BackButton fallbackHref={backFallbackHref} className="mb-4" />
      <h1 className="text-xl font-bold text-gray-900 mb-1">Расширенная проверка</h1>
      <p className="text-sm text-gray-600 mb-6">
        {contractor.name} — выберите вариант подписки
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
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

      <Card className="mb-6">
        <p className="text-sm font-medium text-gray-900 mb-3">Варианты оплаты</p>
        <ul className="space-y-2">
          {EXTENDED_CHECK_PAYMENT_METHODS.map((method) => (
            <li key={method.id}>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="payment"
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
      <p className="text-sm text-gray-600 mt-3">
        Заказ попадёт в корзину. Оплатите его в разделе «Корзина / заказы из каталога».
      </p>
      {cartAdded && (
        <Card className="mt-4 bg-gray-50 space-y-3">
          <p className="text-sm text-gray-900">
            Тариф добавлен в корзину. Перейдите в корзину, чтобы оформить оплату.
          </p>
          <Button size="sm" onClick={() => router.push(cartHref)}>
            Перейти в корзину
          </Button>
        </Card>
      )}
    </>
  );
}