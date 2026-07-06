"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, GitCompare, MessageSquare, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { Tabs } from "@/components/ui/tabs";
import { REQUEST_FORMAT_LABELS, REQUEST_STATUS_LABELS } from "@/constants/statuses";
import { SEED_EVENTS } from "@/data/mocks/seed";
import type { Request, RequestStatus } from "@/data/types";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { formatPrice, formatShortDate } from "@/lib/utils/formatters";
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

function RequestActions({ request }: { request: Request }) {
  const { updateRequest } = usePrototypeStore();
  const { showToast } = useToast();

  const deleteDraft = () => {
    updateRequest(request.id, { status: "completed" });
    showToast("Черновик удалён", "info");
  };

  return (
    <div className="flex flex-wrap gap-1">
      <Link href={`/requests/${request.id}`}>
        <Button variant="ghost" size="sm">
          <Eye className="h-3.5 w-3.5" />
          Открыть
        </Button>
      </Link>
      {request.status === "published" && request.responseCount > 0 && (
        <>
          <Link href={`/requests/${request.id}/responses`}>
            <Button variant="ghost" size="sm">
              <MessageSquare className="h-3.5 w-3.5" />
              Отклики ({request.responseCount})
            </Button>
          </Link>
          {request.responseCount >= 2 && (
            <Link href={`/requests/${request.id}/compare`}>
              <Button variant="ghost" size="sm">
                <GitCompare className="h-3.5 w-3.5" />
                Сравнить
              </Button>
            </Link>
          )}
        </>
      )}
      {request.status === "draft" && (
        <Button variant="ghost" size="sm" onClick={deleteDraft}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
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
      <td className="px-3 py-3 text-sm">{formatShortDate(request.deadline)}</td>
      <td className="px-3 py-3 text-sm">{request.responseCount}</td>
      <td className="px-3 py-3">
        <Badge variant={request.status === "published" ? "solid" : "outline"}>
          {REQUEST_STATUS_LABELS[request.status]}
        </Badge>
      </td>
      <td className="px-3 py-3 text-xs text-gray-600">{event?.title ?? "—"}</td>
      <td className="px-3 py-3">
        <RequestActions request={request} />
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
        <p>Дедлайн: {formatShortDate(request.deadline)}</p>
        <p>Откликов: {request.responseCount}</p>
        <p>Мероприятие: {event?.title ?? "—"}</p>
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
                  <th className="px-3 py-2 font-medium">Дедлайн</th>
                  <th className="px-3 py-2 font-medium">Отклики</th>
                  <th className="px-3 py-2 font-medium">Статус</th>
                  <th className="px-3 py-2 font-medium">Мероприятие</th>
                  <th className="px-3 py-2 font-medium">Действия</th>
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

  if (isAuthenticated && user) {
    return (
      <AppShell
        title="Заявки"
        breadcrumbs={[{ label: "Главная", href: "/" }, { label: "Заявки" }]}
        actions={
          <Link href="/requests/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Новая заявка
            </Button>
          </Link>
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
