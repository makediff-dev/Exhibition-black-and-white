"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { Tabs } from "@/components/ui/tabs";
import { DEAL_STATUS_LABELS } from "@/constants/statuses";
import type { Deal } from "@/data/types";
import { formatPrice } from "@/lib/utils/formatters";

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
                <Badge className="mt-2">{DEAL_STATUS_LABELS[deal.status]}</Badge>
                <CardDescription className="mt-2">
                  {deal.number} · {partnerName(deal)} · {formatPrice(deal.totalPrice)}
                </CardDescription>
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
