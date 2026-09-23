"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Trash2 } from "lucide-react";
import { CabinetAwareLayout } from "@/components/layout/cabinet-aware-layout";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/states";
import { useCartStore, usePrototypeStore, useAuthStore } from "@/lib/store";
import { resolveCartLine } from "@/lib/utils/cart-utils";
import { formatPrice } from "@/lib/utils/formatters";
import { getContractorProfileHref } from "@/lib/utils/contractor-profile-links";
import { withFromParam } from "@/lib/utils/message-related-links";
import { CUSTOMER_CART_HREF, getCheckoutHref } from "@/lib/utils/cart-routes";

export default function CartPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { items, updateItem, removeItem } = useCartStore();
  const services = usePrototypeStore((state) => state.services);

  useEffect(() => {
    if (user?.role === "customer") {
      router.replace(CUSTOMER_CART_HREF);
    }
  }, [user?.role, router]);

  const grouped = useMemo(() => {
    const map = new Map<string, {
      contractorName: string;
      contractorId: string;
      lines: {
        serviceId: string;
        title: string;
        price: number;
        priceFormat: string;
        quantity: number;
        comment: string;
        files: string[];
      }[];
      subtotal: number;
    }>();

    for (const item of items) {
      const resolved = resolveCartLine(item, services);
      if (!resolved) continue;

      const { service, unitPrice, lineTitle } = resolved;
      const existing = map.get(service.contractorId);
      const line = {
        serviceId: item.serviceId,
        title: lineTitle,
        price: unitPrice,
        priceFormat: service.priceFormat,
        quantity: item.quantity,
        comment: item.comment,
        files: item.files,
      };

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

  if (user?.role === "customer") {
    return null;
  }

  const total = grouped.reduce((sum, g) => sum + g.subtotal, 0);

  const handleFileUpload = (serviceId: string, fileName: string) => {
    const item = items.find((i) => i.serviceId === serviceId);
    if (!item) return;
    updateItem(serviceId, { files: [...item.files, fileName] });
  };

  return (
    <CabinetAwareLayout
      title="Корзина"
      description="Позиции сгруппированы по исполнителям — для каждого будет создан отдельный заказ"
    >
        {items.length === 0 ? (
          <EmptyState
            title="Корзина пуста"
            description="Добавьте услуги из каталога"
            actionLabel="Перейти к услугам"
            onAction={() => router.push("/services")}
          />
        ) : (
          <div className="space-y-6">
            {grouped.map((group) => (
              <Card key={group.contractorId}>
                <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-200">
                  <div>
                    <CardTitle>{group.contractorName}</CardTitle>
                    <Link
                      href={getContractorProfileHref(group.contractorId, {
                        role: user?.role,
                        from: "cart",
                      })}
                      className="text-xs underline text-gray-600"
                    >
                      Профиль исполнителя
                    </Link>
                  </div>
                  <p className="text-sm font-semibold">{formatPrice(group.subtotal)}</p>
                </div>

                <div className="space-y-4">
                  {group.lines.map((line) => (
                    <div key={line.serviceId} className="border border-gray-200 p-3 rounded-card">
                      <div className="flex justify-between gap-4">
                        <div className="flex-1">
                          <Link
                            href={withFromParam(`/services/${line.serviceId}`, "cart")}
                            className="text-sm font-medium hover:underline"
                          >
                            {line.title}
                          </Link>
                          <p className="text-xs text-gray-600 mt-1">
                            {formatPrice(line.price)}
                            {line.priceFormat !== "фиксированная" ? ` / ${line.priceFormat}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={line.quantity}
                            onChange={(e) => updateItem(line.serviceId, { quantity: Number(e.target.value) })}
                            className="border border-gray-300 px-2 py-1 text-sm rounded-button"
                            aria-label="Количество"
                          >
                            {[1, 2, 3, 4, 5, 10].map((n) => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => removeItem(line.serviceId)}
                            className="p-2 hover:bg-gray-100"
                            aria-label="Удалить"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 space-y-2">
                        <Textarea
                          label="Комментарий"
                          value={line.comment}
                          onChange={(e) => updateItem(line.serviceId, { comment: e.target.value })}
                          placeholder="Пожелания к заказу..."
                          className="min-h-[60px]"
                        />
                        <FileUpload
                          label="Прикрепить файл"
                          onUpload={(name) => handleFileUpload(line.serviceId, name)}
                        />
                        {line.files.length > 0 && (
                          <ul className="text-xs text-gray-600">
                            {line.files.map((f) => (
                              <li key={f}>📄 {f}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <p className="text-sm font-medium text-right mt-2">
                        {formatPrice(line.price * line.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            ))}

            <Card className="bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-gray-600">Итого по корзине</p>
                <p className="text-2xl font-bold">{formatPrice(total)}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Будет создано заказов: {grouped.length}
                </p>
              </div>
              <Link href={getCheckoutHref(user?.role)}>
                <Button size="lg">Перейти к оформлению</Button>
              </Link>
            </Card>
          </div>
        )}

        <Card className="mt-8 border-dashed">
          <CardTitle className="text-base">Нужна комплексная услуга?</CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Опишите единый запрос на несколько услуг или полный цикл подготовки стенда — мы поможем собрать предложения от исполнителей.
          </p>
          <Link href="/requests/new?format=open_request" className="inline-block mt-3">
            <Button variant="outline" size="sm">Создать комплексную заявку</Button>
          </Link>
        </Card>
    </CabinetAwareLayout>
  );
}