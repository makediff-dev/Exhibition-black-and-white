"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { Tabs } from "@/components/ui/tabs";
import { RequestOrderCard } from "@/components/requests/request-order-card";
import { RequestRecommendationsSection } from "@/components/requests/request-recommendations-section";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { requestListTab } from "@/lib/state/lifecycle-metrics";
import { isRequestVisibleToContractor } from "@/lib/utils/cabinet-scope";

const TAB_STATUSES: { id: string; label: string }[] = [
  { id: "draft", label: "Черновики" },
  { id: "published", label: "Опубликованные" },
  { id: "expired", label: "Просроченные" },
  { id: "in_progress", label: "В работе" },
  { id: "completed", label: "Завершённые" },
];

function RequestsContent() {
  const { user, isAuthenticated } = useAuthStore();
  const { requests, deals, responses } = usePrototypeStore();
  const [activeTab, setActiveTab] = useState<string>("published");

  const filtered = useMemo(() => {
    let list = requests.filter((request) => requestListTab(request, responses, deals) === activeTab);
    if (isAuthenticated && user?.role === "customer") {
      list = list.filter((request) => request.customerId === user.id);
    }
    if (isAuthenticated && user?.role === "contractor") {
      list = requests.filter((request) => {
        if (activeTab === "published") {
          return isRequestVisibleToContractor(request, user, responses, deals);
        }
        return false;
      });
    }
    return list.sort((a, b) => (b.publishedAt ?? b.deadline).localeCompare(a.publishedAt ?? a.deadline));
  }, [requests, responses, deals, activeTab, isAuthenticated, user]);

  const tabCounts = useMemo(() => {
    const base =
      isAuthenticated && user?.role === "customer"
        ? requests.filter((request) => request.customerId === user.id)
        : requests;
    return Object.fromEntries(
      TAB_STATUSES.map((tab) => [
        tab.id,
        base.filter((request) => requestListTab(request, responses, deals) === tab.id).length,
      ]),
    ) as Record<string, number>;
  }, [requests, responses, deals, isAuthenticated, user]);

  const tabs = TAB_STATUSES.map((tab) => ({
    id: tab.id,
    label: `${tab.label} (${tabCounts[tab.id]})`,
  }));

  const isCustomer = isAuthenticated && user?.role === "customer";

  return (
    <>
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />

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
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {filtered.map((request) => (
              <RequestOrderCard
                key={request.id}
                request={request}
                deal={deals.find((deal) => deal.requestId === request.id)}
              />
            ))}
          </div>
          {isCustomer ? <RequestRecommendationsSection /> : null}
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
      <main className="flex-1 mx-auto max-w-site w-full px-4 py-8">
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