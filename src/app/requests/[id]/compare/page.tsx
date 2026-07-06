"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Check, Star } from "lucide-react";
import { EstimateBuilder } from "@/components/forms/estimate-builder";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/modal";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/states";
import { DEMO_USERS } from "@/data/mocks/seed";
import type { Deal, DealStage } from "@/data/types";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { formatPrice, formatShortDate } from "@/lib/utils/formatters";
import { useToast } from "@/components/ui/toast-provider";

function CompareContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useAuthStore();
  const {
    requests,
    responses,
    deals,
    compareResponseIds,
    addDeal,
    updateRequest,
    updateResponse,
    clearCompare,
  } = usePrototypeStore();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(null);

  const request = requests.find((r) => r.id === id);
  const idsParam = searchParams.get("ids");

  const compareIds = useMemo(() => {
    if (idsParam) return idsParam.split(",").filter(Boolean);
    if (compareResponseIds.length >= 2) return compareResponseIds;
    const all = responses.filter((r) => r.requestId === id).map((r) => r.id);
    return all.slice(0, Math.min(3, all.length));
  }, [idsParam, compareResponseIds, responses, id]);

  const compareResponses = useMemo(
    () => compareIds.map((rid) => responses.find((r) => r.id === rid)).filter(Boolean),
    [compareIds, responses]
  );

  const tabs = compareResponses.map((r) => ({
    id: r!.id,
    label: r!.contractorName.split("«")[1]?.replace("»", "") ?? r!.contractorName.slice(0, 12),
  }));

  const activeResponse = compareResponses.find((r) => r!.id === (activeTab || tabs[0]?.id));

  const createDealFromResponse = (responseId: string) => {
    const response = responses.find((r) => r.id === responseId);
    if (!response || !request) return;

    const dealId = `deal-${Date.now()}`;
    const stages: DealStage[] =
      response.estimate.length > 0
        ? response.estimate.map((section, i) => ({
            id: `st-${dealId}-${i}`,
            title: section.title,
            description: section.items.map((item) => item.name).join(", "),
            price: section.items.reduce((s, item) => s + item.quantity * item.price, 0),
            deadline: response.deadline,
            status: i === 0 ? "pending" : "pending",
            files: [],
            comments: [],
          }))
        : [
            {
              id: `st-${dealId}-0`,
              title: "Выполнение работ",
              description: response.approach,
              price: response.price,
              deadline: response.deadline,
              status: "pending" as const,
              files: [],
              comments: [],
            },
          ];

    const deal: Deal = {
      id: dealId,
      number: `СД-${new Date().getFullYear()}-${String(deals.length + 1).padStart(3, "0")}`,
      title: request.title,
      format: request.format,
      customerId: request.customerId,
      customerName: DEMO_USERS.customer.name,
      contractorId: response.contractorId,
      contractorName: response.contractorName,
      totalPrice: response.price,
      status: request.format === "safe_deal" ? "negotiation" : "awaiting_payment",
      stages,
      requestId: request.id,
      history: [
        {
          date: new Date().toISOString().split("T")[0],
          action: "Сделка создана из сравнения откликов",
          actor: user?.name ?? "Заказчик",
        },
      ],
      documents: [],
      commission: Math.round(response.price * 0.05),
    };

    addDeal(deal);
    updateRequest(request.id, { status: "in_progress", responseCount: request.responseCount });
    updateResponse(response.id, { status: "accepted" });
    responses
      .filter((r) => r.requestId === id && r.id !== response.id)
      .forEach((r) => updateResponse(r.id, { status: "rejected" }));
    clearCompare();
    showToast("Исполнитель выбран, сделка создана", "success");
    router.push(`/deals/${dealId}`);
  };

  const handleSelect = (responseId: string) => {
    setSelectedResponseId(responseId);
    setConfirmOpen(true);
  };

  if (!request) {
    return (
      <EmptyState title="Заявка не найдена" actionLabel="К заявкам" onAction={() => router.push("/requests")} />
    );
  }

  if (compareResponses.length < 2) {
    return (
      <EmptyState
        title="Недостаточно откликов для сравнения"
        description="Выберите минимум 2 отклика на странице откликов"
        actionLabel="К откликам"
        onAction={() => router.push(`/requests/${id}/responses`)}
      />
    );
  }

  const fields = [
    { label: "Цена", render: (r: (typeof compareResponses)[0]) => formatPrice(r!.price) },
    { label: "Срок", render: (r: (typeof compareResponses)[0]) => r!.deadline },
    { label: "Условия", render: (r: (typeof compareResponses)[0]) => r!.terms },
    { label: "Подход", render: (r: (typeof compareResponses)[0]) => r!.approach },
    { label: "Рейтинг", render: (r: (typeof compareResponses)[0]) => (
      <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5" />{r!.rating}</span>
    )},
    { label: "Действует до", render: (r: (typeof compareResponses)[0]) => formatShortDate(r!.validUntil) },
  ];

  return (
    <>
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => selectedResponseId && createDealFromResponse(selectedResponseId)}
        title="Выбрать исполнителя"
        message="Будет создана сделка с выбранным исполнителем. Остальные отклики будут отклонены."
      />

      <div className="md:hidden mb-4">
        <Tabs
          tabs={tabs}
          activeTab={activeTab || tabs[0]?.id}
          onChange={setActiveTab}
        />
        {activeResponse && (
          <div className="border border-gray-300 p-4 mt-4 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{activeResponse.contractorName}</p>
                <Badge variant="outline" className="mt-1">{activeResponse.status}</Badge>
              </div>
              <p className="text-lg font-bold">{formatPrice(activeResponse.price)}</p>
            </div>
            {fields.map((f) => (
              <div key={f.label}>
                <p className="text-xs text-gray-500">{f.label}</p>
                <p className="text-sm">{f.render(activeResponse)}</p>
              </div>
            ))}
            {activeResponse.estimate.length > 0 && (
              <EstimateBuilder sections={activeResponse.estimate} onChange={() => {}} readOnly />
            )}
            <Button className="w-full" onClick={() => handleSelect(activeResponse.id)}>
              <Check className="h-4 w-4" />
              Выбрать исполнителя
            </Button>
          </div>
        )}
      </div>

      <div className="hidden md:grid gap-4" style={{ gridTemplateColumns: `repeat(${compareResponses.length}, 1fr)` }}>
        {compareResponses.map((response) => (
          <div key={response!.id} className="border border-gray-300 flex flex-col">
            <div className="border-b border-gray-300 p-4 bg-gray-50">
              <p className="font-semibold text-sm">{response!.contractorName}</p>
              <p className="text-xl font-bold mt-2">{formatPrice(response!.price)}</p>
              <Badge variant="outline" className="mt-2">{response!.status}</Badge>
            </div>
            <div className="p-4 flex-1 space-y-3">
              {fields.map((f) => (
                <div key={f.label}>
                  <p className="text-xs text-gray-500">{f.label}</p>
                  <div className="text-sm">{f.render(response)}</div>
                </div>
              ))}
              {response!.estimate.length > 0 && (
                <EstimateBuilder sections={response!.estimate} onChange={() => {}} readOnly />
              )}
            </div>
            <div className="p-4 border-t border-gray-300">
              <Button className="w-full" onClick={() => handleSelect(response!.id)}>
                <Check className="h-4 w-4" />
                Выбрать
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <Link href={`/requests/${id}/responses`}>
          <Button variant="outline" size="sm">← К списку откликов</Button>
        </Link>
      </div>
    </>
  );
}

function ComparePageInner() {
  const params = useParams();
  const id = params.id as string;
  const { requests } = usePrototypeStore();
  const request = requests.find((r) => r.id === id);

  return (
    <AppShell
      title="Сравнение откликов"
      breadcrumbs={[
        { label: "Заявки", href: "/requests" },
        { label: request?.title ?? "Заявка", href: `/requests/${id}` },
        { label: "Сравнение" },
      ]}
    >
      <Suspense fallback={<p className="text-sm text-gray-600">Загрузка...</p>}>
        <CompareContent />
      </Suspense>
    </AppShell>
  );
}

export default function ComparePage() {
  return <ComparePageInner />;
}
