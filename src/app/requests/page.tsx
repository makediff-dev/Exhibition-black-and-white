"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { GitCompare, MessageSquare, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { Tabs } from "@/components/ui/tabs";
import { REQUEST_FORMAT_LABELS, REQUEST_RESULT_LABELS, REQUEST_STATUS_LABELS } from "@/constants/statuses";
import { SEED_EVENTS } from "@/data/mocks/seed";
import type { Deal, Request, RequestStatus, Response } from "@/data/types";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { formatPrice, formatRequestDeadlineShort } from "@/lib/utils/formatters";
import { useToast } from "@/components/ui/toast-provider";

const TAB_STATUSES: { id: RequestStatus; label: string }[] = [
  { id: "draft", label: "Черновики" },
  { id: "published", label: "Опубликованные" },
  { id: "in_progress", label: "В работе" },
  { id: "completed", label: "Завершённые" },
];

function formatBudget(budget: Request["budget"]) {
  if (budget.type === "hidden") return "Скрытый";
  if (budget.type === "request_quote") return "По запросу КП";
  if (budget.min && budget.max) return `${formatPrice(budget.min)} — ${formatPrice(budget.max)}`;
  if (budget.min) return formatPrice(budget.min);
  return "—";
}

function TableRowAction({
  href,
  onClick,
  icon: Icon,
  children,
}: {
  href?: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  const className =
    "inline-flex items-center gap-1.5 text-xs text-gray-900 hover:underline py-0.5 whitespace-nowrap";

  const content = (
    <>
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

function getRequestOutcome(request: Request, deals: Deal[], responses: Response[]) {
  const hasDeal = deals.some((deal) => deal.requestId === request.id);
  const hasAcceptedResponse = responses.some(
    (response) => response.requestId === request.id && response.status === "accepted"
  );
  const contractorSelected =
    hasDeal ||
    hasAcceptedResponse ||
    request.status === "in_progress" ||
    request.status === "completed";

  return { contractorSelected };
}

function RequestResult({ request }: { request: Request }) {
  const { deals, responses } = usePrototypeStore();
  const { contractorSelected } = getRequestOutcome(request, deals, responses);

  if (contractorSelected) {
    const label =
      request.status === "completed"
        ? REQUEST_RESULT_LABELS.deal_completed
        : REQUEST_RESULT_LABELS.contractor_selected;

    return <span className="text-xs text-gray-900 whitespace-nowrap">{label}</span>;
  }

  if (request.status === "published" && request.responseCount === 0) {
    return (
      <span className="text-xs text-gray-500 whitespace-nowrap">
        {REQUEST_RESULT_LABELS.awaiting_responses}
      </span>
    );
  }

  return <span className="text-xs text-gray-400">—</span>;
}

function RequestActions({ request }: { request: Request }) {
  const { updateRequest, deals, responses } = usePrototypeStore();
  const { showToast } = useToast();
  const { contractorSelected } = getRequestOutcome(request, deals, responses);

  const deleteDraft = () => {
    updateRequest(request.id, { status: "completed" });
    showToast("Черновик удалён", "info");
  };

  return (
    <div className="flex flex-col items-center gap-0.5">
      {request.responseCount > 0 && request.status !== "draft" && (
        <TableRowAction href={`/requests/${request.id}/responses`} icon={MessageSquare}>
          Отклики ({request.responseCount})
        </TableRowAction>
      )}
      {request.status === "published" && request.responseCount >= 2 && !contractorSelected && (
        <TableRowAction href={`/requests/${request.id}/compare`} icon={GitCompare}>
          Сравнить
        </TableRowAction>
      )}
      {request.status === "draft" && (
        <TableRowAction icon={Trash2} onClick={deleteDraft}>
          Удалить
        </TableRowAction>
      )}
    </div>
  );
}

function RequestRow({ request }: { request: Request }) {
  const event = SEED_EVENTS.find((e) => e.id === request.eventId);

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-3 py-3">
        <Link href={`/requests/${request.id}`} className="font-medium text-sm hover:underline">
          {request.title}
        </Link>
        <p className="text-xs text-gray-500 mt-0.5">{request.category}</p>
      </td>
      <td className="px-3 py-3 text-sm">{REQUEST_FORMAT_LABELS[request.format]}</td>
      <td className="px-3 py-3 text-sm">{request.city}</td>
      <td className="px-3 py-3 text-sm">{formatBudget(request.budget)}</td>
      <td className="px-3 py-3 text-sm">{formatRequestDeadlineShort(request.deadline)}</td>
      <td className="px-3 py-3">
        <Badge variant={request.status === "published" ? "solid" : "outline"}>
          {REQUEST_STATUS_LABELS[request.status]}
        </Badge>
      </td>
      <td className="px-3 py-3 text-xs text-gray-600">{event?.title ?? "—"}</td>
      <td className="px-3 py-3 align-middle whitespace-nowrap text-center">
        <RequestActions request={request} />
      </td>
      <td className="px-3 py-3 align-top whitespace-nowrap min-w-[9rem]">
        <RequestResult request={request} />
      </td>
    </tr>
  );
}

function RequestCard({ request }: { request: Request }) {
  const event = SEED_EVENTS.find((e) => e.id === request.eventId);

  return (
    <Card>
      <div className="flex flex-wrap gap-2 mb-2">
        <Badge variant="outline">{REQUEST_FORMAT_LABELS[request.format]}</Badge>
        <Badge>{REQUEST_STATUS_LABELS[request.status]}</Badge>
      </div>
      <Link href={`/requests/${request.id}`}>
        <CardTitle className="hover:underline">{request.title}</CardTitle>
      </Link>
      <CardDescription>{request.category} · {request.city}</CardDescription>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
        <p>Бюджет: {formatBudget(request.budget)}</p>
        <p>Диапазон: {formatRequestDeadlineShort(request.deadline)}</p>
        <p>Мероприятие: {event?.title ?? "—"}</p>
      </div>
      <div className="text-xs text-gray-600">
        <span className="font-medium">Результат: </span>
        <RequestResult request={request} />
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200">
        <RequestActions request={request} />
      </div>
    </Card>
  );
}

function RequestsContent() {
  const { user, isAuthenticated } = useAuthStore();
  const { requests } = usePrototypeStore();
  const [activeTab, setActiveTab] = useState<RequestStatus>("published");

  const filtered = useMemo(() => {
    let list = requests.filter((r) => r.status === activeTab);
    if (isAuthenticated && user?.role === "customer") {
      list = list.filter((r) => r.customerId === user.id);
    }
    if (isAuthenticated && user?.role === "contractor") {
      list = requests.filter((r) => {
        if (r.status !== "published" && r.status !== "in_progress") return false;
        if (r.format === "closed_request") {
          return r.invitedContractorIds.some((id) => id.startsWith("ctr"));
        }
        return true;
      });
    }
    return list.sort((a, b) => (b.publishedAt ?? b.deadline).localeCompare(a.publishedAt ?? a.deadline));
  }, [requests, activeTab, isAuthenticated, user]);

  const tabCounts = useMemo(() => {
    const base =
      isAuthenticated && user?.role === "customer"
        ? requests.filter((r) => r.customerId === user.id)
        : requests;
    return Object.fromEntries(
      TAB_STATUSES.map((t) => [t.id, base.filter((r) => r.status === t.id).length])
    ) as Record<RequestStatus, number>;
  }, [requests, isAuthenticated, user]);

  const tabs = TAB_STATUSES.map((t) => ({
    id: t.id,
    label: `${t.label} (${tabCounts[t.id]})`,
  }));

  const title =
    user?.role === "contractor" ? "Доступные заявки" : "Мои заявки";

  return (
    <>
      <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as RequestStatus)} />

      {filtered.length === 0 ? (
        <EmptyState
          title="Заявок нет"
          description={
            activeTab === "draft"
              ? "Создайте новую заявку или продолжите черновик"
              : "В этом разделе пока нет заявок"
          }
          actionLabel="Создать заявку"
          onAction={() => (window.location.href = "/requests/new")}
        />
      ) : (
        <>
          <div className="hidden lg:block mt-4 border border-gray-300 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-300 bg-gray-50 text-xs text-gray-600">
                  <th className="px-3 py-2 font-medium">Название</th>
                  <th className="px-3 py-2 font-medium">Формат</th>
                  <th className="px-3 py-2 font-medium">Город</th>
                  <th className="px-3 py-2 font-medium">Бюджет</th>
                  <th className="px-3 py-2 font-medium">Сроки</th>
                  <th className="px-3 py-2 font-medium">Статус</th>
                  <th className="px-3 py-2 font-medium">Мероприятие</th>
                  <th className="px-3 py-2 font-medium whitespace-nowrap text-center">Действия</th>
                  <th className="px-3 py-2 font-medium whitespace-nowrap min-w-[9rem]">Результат</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((request) => (
                  <RequestRow key={request.id} request={request} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="lg:hidden mt-4 grid gap-4">
            {filtered.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </>
      )}
    </>
  );
}

export default function RequestsPage() {
  const { isAuthenticated, user } = useAuthStore();
  const isContractor = user?.role === "contractor";
  const pageTitle = isContractor ? "Доступные заявки" : "Мои заявки";

  if (isAuthenticated && user) {
    return (
      <AppShell
        title={pageTitle}
        actions={
          isContractor ? undefined : (
            <Link href="/requests/new">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Новая заявка
              </Button>
            </Link>
          )
        }
      >
        <RequestsContent />
      </AppShell>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Заявки</h1>
          <Link href="/requests/new">
            <Button>
              <Plus className="h-4 w-4" />
              Создать заявку
            </Button>
          </Link>
        </div>
        <RequestsContent />
      </main>
      <Footer />
    </div>
  );
}
