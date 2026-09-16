"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/states";
import { useCartStore, usePrototypeStore } from "@/lib/store";
import { resolveCartLine, isExtendedCheckCartItem } from "@/lib/utils/cart-utils";
import { getContractorProfileHref } from "@/lib/utils/contractor-profile-links";
import { formatPrice } from "@/lib/utils/formatters";
import { getCheckoutHref } from "@/lib/utils/cart-routes";
import { withFromParam } from "@/lib/utils/message-related-links";

export function CustomerCartSection() {
  const router = useRouter();
  const { items, updateItem, removeItem } = useCartStore();
  const services = usePrototypeStore((state) => state.services);
  const checkoutHref = getCheckoutHref("customer");

  const grouped = useMemo(() => {
    const map = new Map<
      string,
      {
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
      }
    >();

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

  const total = grouped.reduce((sum, group) => sum + group.subtotal, 0);

  const handleFileUpload = (serviceId: string, fileName: string) => {
    const item = items.find((entry) => entry.serviceId === serviceId);
    if (!item) return;
    updateItem(serviceId, { files: [...item.files, fileName] });
  };

  if (items.length === 0) {
    return (
      <EmptyState
        title="Корзина пуста"
        description="Добавьте услуги из каталога — они появятся здесь и на странице корзины"
        actionLabel="Перейти к услугам"
        onAction={() => router.push("/services")}
      />
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Позиций в корзине: {items.length}. Позиции сгруппированы по исполнителям — для каждого будет
        создан отдельный заказ.
      </p>

      {grouped.map((group) => (
        <Card key={group.contractorId}>
          <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-200">
            <div>
              <CardTitle>{group.contractorName}</CardTitle>
              <Link
                href={getContractorProfileHref(group.contractorId, {
                  role: "customer",
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
                    {isExtendedCheckCartItem(line.serviceId) ? (
                      <p className="text-sm font-medium">{line.title}</p>
                    ) : (
                      <Link
                        href={withFromParam(`/services/${line.serviceId}`, "cart")}
                        className="text-sm font-medium hover:underline"
                      >
                        {line.title}
                      </Link>
                    )}
                    <p className="text-xs text-gray-600 mt-1">
                      {formatPrice(line.price)}
                      {line.priceFormat !== "фиксированная" ? ` / ${line.priceFormat}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={line.quantity}
                      onChange={(event) =>
                        updateItem(line.serviceId, { quantity: Number(event.target.value) })
                      }
                      className="border border-gray-300 px-2 py-1 text-sm rounded-button"
                      aria-label="Количество"
                    >
                      {[1, 2, 3, 4, 5, 10].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
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
                  {isExtendedCheckCartItem(line.serviceId) ? (
                    <p className="text-sm text-gray-700">{line.comment}</p>
                  ) : (
                    <Textarea
                      label="Комментарий"
                      value={line.comment}
                      onChange={(event) => updateItem(line.serviceId, { comment: event.target.value })}
                      placeholder="Пожелания к заказу..."
                      className="min-h-[60px]"
                    />
                  )}
                  {!isExtendedCheckCartItem(line.serviceId) && (
                    <FileUpload
                      label="Прикрепить файл"
                      onUpload={(name) => handleFileUpload(line.serviceId, name)}
                    />
                  )}
                  {line.files.length > 0 && (
                    <ul className="text-xs text-gray-600">
                      {line.files.map((file) => (
                        <li key={file}>📄 {file}</li>
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
          <p className="text-xs text-gray-600 mt-1">Будет создано заказов: {grouped.length}</p>
        </div>
        <Button size="lg" onClick={() => router.push(checkoutHref)}>
          Перейти к оформлению
        </Button>
      </Card>

      <Card className="border-dashed">
        <CardTitle className="text-base">Нужна комплексная услуга?</CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Опишите единый запрос на несколько услуг или полный цикл подготовки стенда — мы поможем
          собрать предложения от исполнителей.
        </p>
        <Link href="/requests/new?format=open_request" className="inline-block mt-3">
          <Button variant="outline" size="sm">
            Создать комплексную заявку
          </Button>
        </Link>
      </Card>
    </div>
  );
}