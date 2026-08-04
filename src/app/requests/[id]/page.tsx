"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import {
  GitCompare,
  MessageSquare,
  Pencil,
  Send,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { BackButton } from "@/components/ui/back-button";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { REQUEST_FORMAT_LABELS, REQUEST_STATUS_LABELS } from "@/constants/statuses";
import {
  formatSectionContentForDisplay,
  isDescriptionSectionFilled,
} from "@/constants/request-description-sections";
import { SEED_CONTRACTORS, SEED_EVENTS } from "@/data/mocks/seed";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { formatPrice, formatDate, formatRequestDeadline, formatShortDate } from "@/lib/utils/formatters";

function formatBudget(budget: { type: string; min?: number; max?: number }) {
  if (budget.type === "hidden") return "Скрытый";
  if (budget.type === "request_quote") return "По запросу КП";
  if (budget.min && budget.max) return `${formatPrice(budget.min)} — ${formatPrice(budget.max)}`;
  if (budget.min) return formatPrice(budget.min);
  return "—";
}

function RequestDetailContent() {
  const params = useParams();
  const id = params.id as string;
  const { user, isAuthenticated } = useAuthStore();
  const { requests, responses, deals, updateRequest } = usePrototypeStore();

  const request = requests.find((r) => r.id === id);
  const requestResponses = responses.filter((r) => r.requestId === id);
  const relatedDeal = deals.find((d) => d.requestId === id);
  const event = SEED_EVENTS.find((e) => e.id === request?.eventId);

  const invitedContractors = useMemo(
    () =>
      (request?.invitedContractorIds ?? [])
        .map((cid) => SEED_CONTRACTORS.find((c) => c.id === cid))
        .filter(Boolean),
    [request]
  );

  const respondingContractors = useMemo(
    () =>
      requestResponses.map((r) => ({
        response: r,
        contractor: SEED_CONTRACTORS.find((c) => c.id === r.contractorId),
      })),
    [requestResponses]
  );

  if (!request) {
    return (
      <EmptyState
        title="Заявка не найдена"
        description="Возможно, она была удалена"
        actionLabel="К списку заявок"
        onAction={() => (window.location.href = "/requests")}
      />
    );
  }

  const isOwner = user?.id === request.customerId;
  const isContractor = user?.role === "contractor";
  const canRespond = isContractor && request.status === "published";
  const hasResponded = requestResponses.some(
    (r) => r.contractorId === "ctr-1" || r.contractorName === user?.name
  );

  const publishDraft = () => {
    updateRequest(request.id, {
      status: "published",
      publishedAt: new Date().toISOString().split("T")[0],
      history: [
        ...request.history,
        { date: new Date().toISOString().split("T")[0], action: "Опубликована" },
      ],
    });
  };

  const actions = (
    <>
      {isOwner && request.status === "draft" && (
        <Button size="sm" onClick={publishDraft}>
          Опубликовать
        </Button>
      )}
      {isOwner && request.status === "published" && requestResponses.length > 0 && (
        <Link href={`/requests/${id}/responses`}>
          <Button size="sm" variant="outline">
            <MessageSquare className="h-4 w-4" />
            Отклики ({requestResponses.length})
          </Button>
        </Link>
      )}
      {isOwner && requestResponses.length >= 2 && (
        <Link href={`/requests/${id}/compare`}>
          <Button size="sm" variant="outline">
            <GitCompare className="h-4 w-4" />
            Сравнить
          </Button>
        </Link>
      )}
      {canRespond && !hasResponded && (
        <Link href={`/requests/${id}/respond`}>
          <Button size="sm">
            <Send className="h-4 w-4" />
            Откликнуться
          </Button>
        </Link>
      )}
      {canRespond && hasResponded && (
        <Link href={`/requests/${id}/respond`}>
          <Button size="sm" variant="outline">
            <Send className="h-4 w-4" />
            Ваш отклик отправлен
          </Button>
        </Link>
      )}
      {relatedDeal && (
        <Link href={`/deals/${relatedDeal.id}`}>
          <Button size="sm">
            Открыть сделку
          </Button>
        </Link>
      )}
      {isOwner && request.status === "draft" && (
        <Link href={`/requests/new`}>
          <Button size="sm" variant="ghost">
            <Pencil className="h-4 w-4" />
            Редактировать
          </Button>
        </Link>
      )}
    </>
  );

  const detail = (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Badge>{REQUEST_FORMAT_LABELS[request.format]}</Badge>
        <Badge variant="outline">{REQUEST_STATUS_LABELS[request.status]}</Badge>
        <Badge variant="dashed">{request.category}</Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardTitle className="text-sm mb-3">Основная информация</CardTitle>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-600">Город</dt>
              <dd>{request.city}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-600">География</dt>
              <dd>{request.cities.join(", ")}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-600">Диапазон выполнения</dt>
              <dd>{formatRequestDeadline(request.deadline)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-600">Бюджет</dt>
              <dd>{formatBudget(request.budget)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-600">Откликов</dt>
              <dd>{request.responseCount}</dd>
            </div>
            {request.publishedAt && (
              <div className="flex justify-between gap-4">
                <dt className="text-gray-600">Опубликована</dt>
                <dd>{formatShortDate(request.publishedAt)}</dd>
              </div>
            )}
          </dl>
        </Card>

        <Card>
          <CardTitle className="text-sm mb-3">Мероприятие</CardTitle>
          {event ? (
            <>
              <Link href={`/events/${event.id}`} className="font-medium text-sm hover:underline">
                {event.title}
              </Link>
              <CardDescription className="mt-1">
                {event.venue}, {event.city} · {formatShortDate(event.startDate)}
              </CardDescription>
            </>
          ) : (
            <p className="text-sm text-gray-500">Не привязано</p>
          )}
        </Card>
      </div>

      <Card>
        <CardTitle className="text-sm mb-3">Описание</CardTitle>
        <p className="text-sm whitespace-pre-wrap">{request.description}</p>
        {request.torSections.some((section) => isDescriptionSectionFilled(section.title, section.content)) && (
          <div className="mt-4 space-y-4">
            {request.torSections
              .filter((section) => isDescriptionSectionFilled(section.title, section.content))
              .map((section, index) => (
                <div key={section.id} className="border-t border-gray-200 pt-4 first:border-0 first:pt-0">
                  <p className="text-sm font-medium">
                    {index + 1}. {section.title}
                  </p>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                    {formatSectionContentForDisplay(section.title, section.content)}
                  </p>
                </div>
              ))}
          </div>
        )}
        {request.requirements && (
          <>
            <p className="text-sm font-medium mt-4">Требования</p>
            <p className="text-sm text-gray-700 mt-1">{request.requirements}</p>
          </>
        )}
        {request.expectedResult && (
          <>
            <p className="text-sm font-medium mt-4">Ожидаемый результат</p>
            <p className="text-sm text-gray-700 mt-1">{request.expectedResult}</p>
          </>
        )}
      </Card>

      {request.files.length > 0 && (
        <Card>
          <CardTitle className="text-sm mb-3">Файлы</CardTitle>
          <ul className="text-sm space-y-1">
            {request.files.map((f) => (
              <li key={f}>📄 {f}</li>
            ))}
          </ul>
        </Card>
      )}

      {(invitedContractors.length > 0 || respondingContractors.length > 0) && (
        <Card>
          <CardTitle className="text-sm mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Исполнители
          </CardTitle>
          {invitedContractors.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-600 mb-2">Приглашённые</p>
              <div className="space-y-2">
                {invitedContractors.map((c) =>
                  c ? (
                    <Link
                      key={c.id}
                      href={`/contractors/${c.id}`}
                      className="block text-sm hover:underline"
                    >
                      {c.name} · {c.city}
                    </Link>
                  ) : null
                )}
              </div>
            </div>
          )}
          {respondingContractors.length > 0 && (
            <div>
              <p className="text-xs text-gray-600 mb-2">Откликнувшиеся</p>
              <div className="space-y-2">
                {respondingContractors.map(({ response, contractor }) => (
                  <div key={response.id} className="flex justify-between items-center text-sm border border-gray-200 p-2">
                    <Link href={`/contractors/${contractor?.id}`} className="hover:underline">
                      {response.contractorName}
                    </Link>
                    <span className="font-medium">{formatPrice(response.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {request.history.length > 0 && (
        <Card>
          <CardTitle className="text-sm mb-3">История</CardTitle>
          <ul className="space-y-2">
            {request.history.map((h, i) => (
              <li key={i} className="text-sm flex gap-3">
                <span className="text-gray-500 shrink-0">{formatShortDate(h.date)}</span>
                <span>{h.action}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );

  if (isAuthenticated && user) {
    return (
      <AppShell
        title={request.title}
        showBack
        backFallbackHref="/requests"
        actions={actions}
      >
        {detail}
      </AppShell>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-8">
        <BackButton fallbackHref="/requests" className="mb-4" />
        <div className="flex flex-wrap justify-between gap-3 mb-6">
          <h1 className="text-2xl font-bold">{request.title}</h1>
          <div className="flex gap-2 flex-wrap">{actions}</div>
        </div>
        {detail}
      </main>
      <Footer />
    </div>
  );
}

export default function RequestDetailPage() {
  return <RequestDetailContent />;
}
