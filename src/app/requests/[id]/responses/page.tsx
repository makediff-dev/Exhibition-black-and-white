"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ResponseCard } from "@/components/responses/response-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { SEED_EVENTS } from "@/data/mocks/seed";
import { useAuthStore, usePrototypeStore } from "@/lib/store";

export default function RequestResponsesPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuthStore();
  const { requests, responses } = usePrototypeStore();
  const request = requests.find((item) => item.id === id);
  const requestResponses = responses.filter((item) => item.requestId === id);
  const eventTitle = SEED_EVENTS.find((event) => event.id === request?.eventId)?.title;
  const isOwner = Boolean(user && request && request.customerId === user.id);

  if (!request) {
    return (
      <AppShell title="Отклики" showBack backFallbackHref="/requests">
        <EmptyState title="Заявка не найдена" actionLabel="К заявкам" actionHref="/requests" />
      </AppShell>
    );
  }

  if (!isOwner) {
    return (
      <AppShell title="Отклики" showBack backFallbackHref={`/requests/${id}`}>
        <EmptyState
          title="Сравнение откликов доступно заказчику"
          description="Открыть предложения и выбрать исполнителя может только автор заявки."
          actionLabel="К заявке"
          actionHref={`/requests/${id}`}
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      title={`Отклики: ${request.title}`}
      showBack
      backFallbackHref={`/requests/${id}`}
      actions={
        requestResponses.length >= 2 ? (
          <Link href={`/requests/${id}/compare`}>
            <Button size="sm" variant="outline">
              Сравнить
            </Button>
          </Link>
        ) : undefined
      }
    >
      {requestResponses.length === 0 ? (
        <EmptyState
          title="Откликов пока нет"
          description="Когда исполнители пришлют КП, здесь появятся цена, срок и подход — и можно будет назначить исполнителя."
        />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Следующий шаг: сравните цену, срок и подход, затем назначьте исполнителя. Это создаст сделку.
          </p>
          <div className="flex flex-wrap gap-4">
            {requestResponses.map((response) => (
              <ResponseCard
                key={response.id}
                response={response}
                requestId={request.id}
                isOwner
                category={request.category}
                city={request.city}
                eventTitle={eventTitle}
              />
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
