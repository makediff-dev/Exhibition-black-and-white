"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  FileText,
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
import { Tabs } from "@/components/ui/tabs";
import { REQUEST_FORMAT_LABELS, REQUEST_STATUS_LABELS, STAGE_STATUS_LABELS } from "@/constants/statuses";
import {
  formatSectionContentForDisplay,
  isDescriptionSectionFilled,
} from "@/constants/request-description-sections";
import { SEED_CONTRACTORS, SEED_EVENTS } from "@/data/mocks/seed";
import { getContractorIdForUser } from "@/lib/utils/user-entity-map";
import { isRequestVisibleToContractor } from "@/lib/utils/cabinet-scope";
import { formatPrice, formatRequestDeadline, formatShortDate } from "@/lib/utils/formatters";
import { getContractorProfileHref } from "@/lib/utils/contractor-profile-links";
import { withFromParam } from "@/lib/utils/message-related-links";

type RequestTab = "overview" | "stages" | "documents" | "payments" | "files" | "history";

const REQUEST_TABS: { id: RequestTab; label: string }[] = [
  { id: "overview", label: "Обзор" },
  { id: "stages", label: "Этапы" },
  { id: "documents", label: "Документы" },
  { id: "payments", label: "Оплаты" },
  { id: "files", label: "Файлы" },
  { id: "history", label: "История" },
];

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
  const { requests, responses, deals, documents, payments, updateRequest } = usePrototypeStore();
  const [activeTab, setActiveTab] = useState<RequestTab>("overview");

  const request = requests.find((r) => r.id === id);
  const requestResponses = responses.filter((r) => r.requestId === id);
  const relatedDeal = deals.find((d) => d.requestId === id);
  const requestDocuments = relatedDeal
    ? documents.filter((doc) => doc.dealId === relatedDeal.id)
    : [];
  const requestPayments = relatedDeal
    ? payments.filter((payment) => payment.dealId === relatedDeal.id)
    : [];
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
  const contractorId = getContractorIdForUser(user);
  const isContractor = user?.role === "contractor";
  const canRespond =
    isContractor && isRequestVisibleToContractor(request, contractorId);
  const hasResponded = requestResponses.some(
    (r) =>
      (contractorId !== null && r.contractorId === contractorId) ||
      r.contractorName === user?.name
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

      <Tabs
        tabs={REQUEST_TABS}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as RequestTab)}
        className="mb-6"
      />

      {activeTab === "overview" && (
        <>
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
                  <Link
                    href={withFromParam(`/events/${event.id}`, "requests")}
                    className="font-medium text-sm hover:underline"
                  >
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
                          href={getContractorProfileHref(c.id, {
                            role: user?.role,
                            from: "requests",
                          })}
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
                      <div key={response.id} className="flex justify-between items-center text-sm border border-gray-200 p-2 rounded-[10px]">
                        <Link
                          href={
                            contractor
                              ? getContractorProfileHref(contractor.id, {
                                  role: user?.role,
                                  from: "requests",
                                })
                              : "#"
                          }
                          className="hover:underline"
                        >
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
        </>
      )}

      {activeTab === "stages" && (
        <div className="space-y-4">
          {!relatedDeal || relatedDeal.stages.length === 0 ? (
            <EmptyState
              title="Этапов пока нет"
              description={
                relatedDeal
                  ? "Этапы появятся после согласования условий сделки"
                  : "Этапы появятся после назначения исполнителя и создания сделки"
              }
              actionLabel={relatedDeal ? "Открыть сделку" : undefined}
              onAction={relatedDeal ? () => (window.location.href = `/deals/${relatedDeal.id}`) : undefined}
            />
          ) : (
            relatedDeal.stages.map((stage, index) => (
              <Card key={stage.id}>
                <div className="flex flex-wrap justify-between gap-2 mb-2">
                  <CardTitle className="text-sm">
                    {index + 1}. {stage.title}
                  </CardTitle>
                  <Badge variant="outline">{STAGE_STATUS_LABELS[stage.status]}</Badge>
                </div>
                <CardDescription>{stage.description}</CardDescription>
                <dl className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-600">Срок</dt>
                    <dd>{formatShortDate(stage.deadline)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-600">Сумма</dt>
                    <dd className="font-medium">{formatPrice(stage.price)}</dd>
                  </div>
                </dl>
                {stage.result && (
                  <p className="mt-3 text-sm border-t border-gray-200 pt-3">{stage.result}</p>
                )}
                {stage.files.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm text-gray-600">
                    {stage.files.map((file) => (
                      <li key={file}>📄 {file}</li>
                    ))}
                  </ul>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "documents" && (
        <div className="space-y-3">
          {requestDocuments.length === 0 ? (
            <EmptyState
              title="Документов пока нет"
              description="Документы появятся после назначения исполнителя и согласования сделки"
            />
          ) : (
            requestDocuments.map((doc) => (
              <Card key={doc.id} className="text-sm">
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">
                      {doc.type} {doc.number}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <span>{formatShortDate(doc.date)}</span>
                    <Badge variant="outline">{doc.status}</Badge>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "payments" && (
        <div className="space-y-3">
          {requestPayments.length === 0 ? (
            <EmptyState title="Оплат пока нет" description="Оплаты появятся после создания сделки" />
          ) : (
            requestPayments.map((payment) => (
              <Card
                key={payment.id}
                className="text-sm"
              >
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <p className="font-medium">{payment.type}</p>
                    <p className="text-gray-600 text-xs">{payment.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatPrice(payment.amount)}</p>
                    <Badge variant="outline" className="mt-1">{payment.status}</Badge>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "files" && (
        <div className="space-y-3">
          {request.files.length === 0 &&
          (!relatedDeal || relatedDeal.stages.flatMap((stage) => stage.files).length === 0) ? (
            <EmptyState title="Файлов пока нет" />
          ) : (
            <>
              {request.files.map((file) => (
                <Card key={file} className="text-sm">
                  📄 {file} <span className="text-gray-500">— заявка</span>
                </Card>
              ))}
              {relatedDeal?.stages.flatMap((stage) =>
                stage.files.map((file) => (
                  <Card key={`${stage.id}-${file}`} className="text-sm">
                    📄 {file} <span className="text-gray-500">— {stage.title}</span>
                  </Card>
                ))
              )}
            </>
          )}
        </div>
      )}

      {activeTab === "history" && (
        request.history.length === 0 ? (
          <EmptyState title="История пуста" />
        ) : (
          <ul className="space-y-2">
            {request.history.map((entry, index) => (
              <li key={index} className="text-sm flex gap-3 border border-gray-300 p-3 rounded-[10px]">
                <span className="text-gray-500 shrink-0">{formatShortDate(entry.date)}</span>
                <span>{entry.action}</span>
              </li>
            ))}
          </ul>
        )
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
      <main className="flex-1 mx-auto max-w-site w-full px-4 py-8">
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