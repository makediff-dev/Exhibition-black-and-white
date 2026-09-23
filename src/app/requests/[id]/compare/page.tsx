"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { RESPONSE_STATUS_LABELS } from "@/constants/statuses";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils/formatters";
import { getContractorProfileHref } from "@/lib/utils/contractor-profile-links";

export default function RequestComparePage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuthStore();
  const { requests, responses } = usePrototypeStore();
  const request = requests.find((item) => item.id === id);
  const requestResponses = responses.filter((item) => item.requestId === id);
  const isOwner = Boolean(user && request && request.customerId === user.id);

  if (!request) {
    return (
      <AppShell title="Сравнение" showBack backFallbackHref="/requests">
        <EmptyState title="Заявка не найдена" actionLabel="К заявкам" actionHref="/requests" />
      </AppShell>
    );
  }

  if (!isOwner) {
    return (
      <AppShell title="Сравнение" showBack backFallbackHref={`/requests/${id}`}>
        <EmptyState
          title="Сравнение доступно заказчику"
          actionLabel="К заявке"
          actionHref={`/requests/${id}`}
        />
      </AppShell>
    );
  }

  if (requestResponses.length < 2) {
    return (
      <AppShell title="Сравнение" showBack backFallbackHref={`/requests/${id}/responses`}>
        <EmptyState
          title="Недостаточно откликов для сравнения"
          description="Сравнение появляется, когда есть минимум два предложения с одинаковой структурой: цена, срок, условия и подход."
          actionLabel="К откликам"
          actionHref={`/requests/${id}/responses`}
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      title={`Сравнение: ${request.title}`}
      showBack
      backFallbackHref={`/requests/${id}/responses`}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Все отклики показаны в одной сетке. Следующий шаг — назначить исполнителя на карточке
          выбранного КП.
        </p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {requestResponses.map((response) => (
            <Card key={response.id} className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold">{response.contractorName}</h2>
                <Badge variant="outline">{RESPONSE_STATUS_LABELS[response.status]}</Badge>
              </div>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-gray-600">Цена</dt>
                  <dd className="font-medium">{formatPrice(response.price)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-gray-600">Срок</dt>
                  <dd>{response.deadline}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-gray-600">Условия</dt>
                  <dd className="text-right">{response.terms || "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-gray-600">Рейтинг</dt>
                  <dd>{response.rating}</dd>
                </div>
              </dl>
              <div>
                <p className="text-xs text-gray-500 mb-1">Подход</p>
                <p className="text-sm whitespace-pre-wrap">{response.approach || "—"}</p>
              </div>
              <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
                <Link href={getContractorProfileHref(response.contractorId, { role: user?.role })}>
                  <Button size="sm" variant="outline" className="w-full">
                    Профиль
                  </Button>
                </Link>
                <Link href={`/requests/${id}/responses`}>
                  <Button size="sm" className="w-full">
                    Назначить на списке откликов
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
