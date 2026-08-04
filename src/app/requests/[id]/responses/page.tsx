"use client";

import { useParams } from "next/navigation";
import { GitCompare } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { ResponseCard } from "@/components/responses/response-card";
import { SEED_EVENTS } from "@/data/mocks/seed";
import { useAuthStore, usePrototypeStore } from "@/lib/store";

export default function RequestResponsesPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuthStore();
  const { requests, responses } = usePrototypeStore();

  const request = requests.find((item) => item.id === id);
  const requestResponses = responses.filter((item) => item.requestId === id);

  if (!request) {
    return (
      <AppShell showBack backFallbackHref="/requests">
        <EmptyState
          title="Заявка не найдена"
          actionLabel="К заявкам"
          onAction={() => (window.location.href = "/requests")}
        />
      </AppShell>
    );
  }

  const isOwner = user?.id === request.customerId;
  const eventTitle = request.eventId
    ? SEED_EVENTS.find((event) => event.id === request.eventId)?.title
    : undefined;

  return (
    <AppShell showBack backFallbackHref={`/requests/${id}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h1 className="text-xl font-bold text-gray-900">Отклики: {request.title}</h1>
        {isOwner && requestResponses.length >= 2 && (
          <Link href={`/requests/${id}/compare`}>
            <Button size="sm" variant="outline">
              <GitCompare className="h-4 w-4" />
              Сравнить ({requestResponses.length})
            </Button>
          </Link>
        )}
      </div>

      {requestResponses.length === 0 ? (
        <EmptyState title="Откликов пока нет" description="Исполнители ещё не откликнулись на заявку" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {requestResponses.map((response) => (
            <ResponseCard
              key={response.id}
              response={response}
              requestId={id}
              isOwner={isOwner}
              category={request.category}
              city={request.city}
              eventTitle={eventTitle}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}
