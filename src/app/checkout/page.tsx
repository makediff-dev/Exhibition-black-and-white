"use client";

import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast-provider";
import type { Deal } from "@/data/types";
import { useAuthStore, useCartStore, usePrototypeStore } from "@/lib/store";
import { resolveCartLine } from "@/lib/utils/cart-utils";
import { formatPrice } from "@/lib/utils/formatters";

export default function CheckoutPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { items, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const { addDeal, addNotification, services } = usePrototypeStore();
  const [submitting, setSubmitting] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<string, {
      contractorId: string;
      contractorName: string;
      lines: { title: string; quantity: number; price: number; comment: string }[];
      subtotal: number;
    }>();

    for (const item of items) {
      const resolved = resolveCartLine(item, services);
      if (!resolved) continue;

      const { service, unitPrice, lineTitle } = resolved;
      const line = {
        title: lineTitle,
        quantity: item.quantity,
        price: unitPrice,
        comment: item.comment,
      };

      const existing = map.get(service.contractorId);
      if (existing) {
        existing.lines.push(line);
        existing.subtotal += unitPrice * item.quantity;
      } else {
        map.set(service.contractorId, {
          contractorId: service.contractorId,
          contractorName: service.contractorName,
          lines: [line],
          subtotal: unitPrice * item.quantity,
        });
      }
    }

    return Array.from(map.values());
  }, [items, services]);

  const total = grouped.reduce((sum, g) => sum + g.subtotal, 0);

  const handleSubmit = async () => {
    if (!isAuthenticated || !user) {
      showToast("Войдите в систему для оформления заказа", "info");
      router.push("/login");
      return;
    }

    if (grouped.length === 0) return;

    setSubmitting(true);

    await new Promise((r) => setTimeout(r, 800));

    const createdDealIds: string[] = [];

    grouped.forEach((group, index) => {
      const dealId = `deal-cart-${Date.now()}-${index}`;
      const dealNumber = `СД-2026-${String(100 + index).padStart(3, "0")}`;
      const title = group.lines.map((l) => l.title).join(", ").slice(0, 80);

      const deal: Deal = {
        id: dealId,
        number: dealNumber,
        title: title || `Заказ у ${group.contractorName}`,
        format: "safe_deal",
        customerId: user.id,
        customerName: user.name,
        contractorId: group.contractorId,
        contractorName: group.contractorName,
        totalPrice: group.subtotal,
        status: "negotiation",
        commission: Math.round(group.subtotal * 0.05),
        documents: [],
        stages: group.lines.map((line, si) => ({
          id: `st-${dealId}-${si}`,
          title: line.title,
          description: line.comment || "Услуга из корзины",
          price: line.price * line.quantity,
          deadline: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
          status: "pending" as const,
          files: [],
          comments: [],
        })),
        history: [{
          date: new Date().toISOString().split("T")[0],
          action: "Сделка создана из корзины",
          actor: "Система",
        }],
      };

      addDeal(deal);
      createdDealIds.push(dealId);

      addNotification({
        id: `notif-deal-${dealId}`,
        title: "Новая сделка",
        message: `Создан заказ ${dealNumber} с ${group.contractorName}`,
        priority: "action_required",
        read: false,
        date: new Date().toISOString().split("T")[0],
        link: `/deals/${dealId}`,
        category: "deals",
      });
    });

    clearCart();
    setSubmitting(false);
    showToast(`Создано сделок: ${createdDealIds.length}`, "success");
    if (createdDealIds.length === 1) {
      router.push(`/deals/${createdDealIds[0]}`);
      return;
    }
    router.push("/account/customer/active-projects");
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <PublicHeader />
        <main className="flex-1 mx-auto max-w-site w-full px-4 py-12">
          <EmptyState
            title="Нечего оформлять"
            description="Корзина пуста — добавьте услуги"
            actionLabel="В каталог услуг"
            onAction={() => router.push("/services")}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />

      <main className="flex-1 mx-auto max-w-site w-full px-4 py-8">
        <BackButton fallbackHref="/cart" className="mb-4" />

        <h1 className="text-2xl font-bold mb-2">Оформление заказа</h1>
        <p className="text-sm text-gray-600 mb-6">
          Каждый исполнитель получит отдельный заказ (безопасная сделка). Это позволяет независимо согласовывать условия и оплату с каждым подрядчиком.
        </p>

        <div className="border border-gray-900 bg-gray-50 p-4 mb-6 text-sm">
          <p className="font-medium mb-1">Как это работает</p>
          <ol className="list-decimal pl-5 space-y-1 text-gray-700">
            <li>Для каждого исполнителя создаётся отдельная сделка</li>
            <li>Вы согласовываете этапы и условия с каждым подрядчиком</li>
            <li>Оплата резервируется отдельно по каждой сделке</li>
            <li>Документы и коммуникация ведутся в рамках каждого заказа</li>
          </ol>
        </div>

        <div className="space-y-4 mb-6">
          {grouped.map((group) => (
            <Card key={group.contractorId}>
              <CardTitle className="mb-2">{group.contractorName}</CardTitle>
              <p className="text-xs text-gray-600 mb-3">Отдельный заказ · {group.lines.length} поз.</p>
              <ul className="text-sm space-y-1 border-t border-gray-200 pt-3">
                {group.lines.map((line) => (
                  <li key={line.title} className="flex justify-between">
                    <span>{line.title} × {line.quantity}</span>
                    <span>{formatPrice(line.price * line.quantity)}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm font-semibold text-right mt-2">{formatPrice(group.subtotal)}</p>
            </Card>
          ))}
        </div>

        <div className="border border-gray-300 p-4 mb-6">
          <div className="flex justify-between text-sm mb-1">
            <span>Количество заказов</span>
            <span>{grouped.length}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Итого</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        {!isAuthenticated && (
          <p className="text-sm text-gray-700 border border-dashed border-gray-400 p-3 mb-4">
            Для оформления необходимо{" "}
            <Link href="/login" className="underline font-medium">войти</Link>
            {" "}или{" "}
            <Link href="/register" className="underline font-medium">зарегистрироваться</Link>.
          </p>
        )}

        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Создание сделок..." : `Создать ${grouped.length} заказ(ов)`}
          </Button>
          <Link href="/cart">
            <Button variant="outline">Назад в корзину</Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
