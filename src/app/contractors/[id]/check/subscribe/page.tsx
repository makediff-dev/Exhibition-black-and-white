"use client";

import Link from "next/link";
import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { BackButton } from "@/components/ui/back-button";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  EXTENDED_CHECK_PAYMENT_METHODS,
  EXTENDED_CHECK_PLANS,
} from "@/constants/statuses";
import { SEED_CONTRACTORS } from "@/data/mocks/seed";
import { useAuthStore, useCartStore } from "@/lib/store";
import { EXTENDED_CHECK_CART_PREFIX } from "@/lib/utils/cart-utils";
import { formatPrice } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/components/ui/toast-provider";

function ExtendedCheckSubscribeContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const addItem = useCartStore((state) => state.addItem);
  const id = params.id as string;

  const requestId = searchParams.get("requestId");
  const responseId = searchParams.get("responseId");
  const fromResponses = searchParams.get("from") === "responses";

  const contractor = SEED_CONTRACTORS.find((item) => item.id === id);
  if (!contractor) notFound();

  const [selectedPlanId, setSelectedPlanId] = useState<
    (typeof EXTENDED_CHECK_PLANS)[number]["id"]
  >(EXTENDED_CHECK_PLANS[0].id);
  const [paymentMethod, setPaymentMethod] = useState<
    (typeof EXTENDED_CHECK_PAYMENT_METHODS)[number]["id"]
  >(EXTENDED_CHECK_PAYMENT_METHODS[0].id);
  const [cartAdded, setCartAdded] = useState(false);

  const backHref =
    fromResponses && requestId
      ? `/contractors/${id}?from=responses&requestId=${requestId}${
          responseId ? `&responseId=${responseId}` : ""
        }`
      : `/contractors/${id}`;

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

  return (
    <>
      <BackButton fallbackHref={backHref} className="mb-4" />
      <h1 className="text-xl font-bold text-gray-900 mb-1">Расширенная проверка</h1>
      <p className="text-sm text-gray-600 mb-6">
        {contractor.name} — выберите вариант подписки
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
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
          <Button size="sm" onClick={() => router.push("/account/customer/cart")}>
            Перейти в корзину
          </Button>
        </Card>
      )}
    </>
  );
}

function ExtendedCheckSubscribePageInner() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1 mx-auto max-w-site w-full px-4 py-8">
        {!isAuthenticated || !user ? (
          <>
            <p className="text-sm text-gray-600">Войдите в систему для заказа проверки.</p>
            <Link href="/login" className="text-sm underline mt-2 inline-block">
              Войти
            </Link>
          </>
        ) : (
          <ExtendedCheckSubscribeContent />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function ExtendedCheckSubscribePage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-gray-500">Загрузка...</p>}>
      <ExtendedCheckSubscribePageInner />
    </Suspense>
  );
}
