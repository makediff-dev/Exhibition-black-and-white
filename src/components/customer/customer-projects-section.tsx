"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { CardField } from "@/components/ui/card-field";
import { EmptyState } from "@/components/ui/states";
import { Tabs } from "@/components/ui/tabs";
import { DEAL_STATUS_LABELS } from "@/constants/statuses";
import type { Deal } from "@/data/types";
import { getDealStatus } from "@/lib/state/deal-machine";
import { useAuthStore } from "@/lib/store";
import { formatPrice, formatShortDate } from "@/lib/utils/formatters";

interface Props {
  deals: Deal[];
  initialTab?: "active" | "completed";
  basePath?: string;
  partnerName?: (deal: Deal) => string;
  showRepeatOrder?: boolean;
}

export function CustomerProjectsSection({
  deals,
  initialTab = "active",
  basePath = "/account/customer/active-projects",
  partnerName = (deal) => deal.contractorName,
  showRepeatOrder = true,
}: Props) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<"active" | "completed">(initialTab);

  const activeDeals = deals.filter((deal) => deal.status !== "completed");
  const completedDeals = deals.filter((deal) => deal.status === "completed");
  const visibleDeals = activeTab === "completed" ? completedDeals : activeDeals;

  const handleTabChange = (id: string) => {
    const nextTab = id === "completed" ? "completed" : "active";
    setActiveTab(nextTab);
    const href = nextTab === "completed" ? `${basePath}?tab=completed` : basePath;
    router.replace(href, { scroll: false });
  };

  return (
    <div className="space-y-4">
      <Tabs
        tabs={[
          { id: "active", label: "Активные" },
          { id: "completed", label: "Завершённые" },
        ]}
        activeTab={activeTab}
        onChange={handleTabChange}
        className="w-full"
      />

      {visibleDeals.length === 0 ? (
        activeTab === "active" ? (
          <EmptyState title="Нет активных проектов" />
        ) : (
          <EmptyState
            title="Нет завершённых проектов"
            description="Здесь появятся проекты после завершения сделок"
          />
        )
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {visibleDeals.map((deal) => (
            <Card key={deal.id} borderHover className="flex h-full flex-col">
              <Link href={`/deals/${deal.id}`} className="flex-1 block">
                <CardTitle>{deal.title}</CardTitle>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge>{DEAL_STATUS_LABELS[deal.status]}</Badge>
                  <Badge variant="outline">
                    {user?.role === "contractor" ? "Вы продаёте" : "Вы покупаете"}
                  </Badge>
                </div>
                <div className="mt-[10px] space-y-[10px]">
                  <CardField label="Номер">{deal.number}</CardField>
                  <CardField label="Контрагент">{partnerName(deal)}</CardField>
                  {(() => {
                    const lifecycle = getDealStatus(deal, user);
                    return (
                      <>
                        <CardField label="Следующий шаг">{lifecycle.explanation}</CardField>
                        {lifecycle.deadline ? (
                          <CardField label="Срок">{formatShortDate(lifecycle.deadline)}</CardField>
                        ) : null}
                      </>
                    );
                  })()}
                  <p className="pt-1 text-lg font-semibold text-gray-900">{formatPrice(deal.totalPrice)}</p>
                </div>
              </Link>
              {activeTab === "completed" && showRepeatOrder ? (
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => router.push(`/account/customer/repeat-order?dealId=${deal.id}`)}
                >
                  Повторить заказ
                </Button>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
