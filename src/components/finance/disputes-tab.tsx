"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Clock, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { STAGE_STATUS_LABELS } from "@/constants/statuses";
import type { Deal } from "@/data/types";
import { formatDate, formatPrice } from "@/lib/utils/formatters";

function getDisputedStage(deal: Deal) {
  return (
    deal.stages.find((stage) => stage.status === "review" || stage.status === "revision") ??
    deal.stages[deal.stages.length - 1]
  );
}

function DisputeCard({ deal }: { deal: Deal }) {
  const disputedStage = getDisputedStage(deal);
  const frozenAmount = disputedStage?.price ?? deal.totalPrice;
  const openedEvent =
    [...deal.history].reverse().find((event) => event.action.toLowerCase().includes("спор")) ??
    deal.history[deal.history.length - 1];
  const recentEvents = deal.history.slice(-2);

  return (
    <Card className="p-[10px] border-gray-900">
      <div className="flex flex-col gap-[10px]">
        <div className="flex flex-wrap items-start justify-between gap-[10px]">
          <div className="space-y-[10px]">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="solid" icon={AlertTriangle}>
                Спор
              </Badge>
              <Badge variant="outline">На рассмотрении</Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500">{deal.number}</p>
              <Link href={`/deals/${deal.id}`} className="text-base font-semibold hover:underline">
                {deal.title}
              </Link>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Заморожено</p>
            <p className="text-lg font-bold">{formatPrice(frozenAmount)}</p>
            {openedEvent && (
              <p className="text-xs text-gray-500 mt-[10px]">{formatDate(openedEvent.date)}</p>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-[10px] text-sm border-t border-gray-200 pt-[10px]">
          <div>
            <p className="text-xs text-gray-500 mb-1">Оспариваемый этап</p>
            <p className="font-medium">{disputedStage?.title ?? "—"}</p>
            {disputedStage && (
              <p className="text-xs text-gray-600 mt-1">
                {STAGE_STATUS_LABELS[disputedStage.status]}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Стороны</p>
            <p className="text-sm">{deal.customerName}</p>
            <p className="text-sm text-gray-600">{deal.contractorName}</p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-[10px] space-y-[10px]">
          <p className="text-sm text-gray-700">
            {openedEvent?.action ?? "Оспаривание услуг по сделке"}
          </p>
          <p className="text-xs text-gray-500">
            Средства по этапу заморожены до решения платформы. Процесс оспаривания открыт и ещё
            не завершён.
          </p>
        </div>

        {recentEvents.length > 0 && (
          <div className="border border-gray-200 divide-y divide-gray-100">
            {recentEvents.map((event, index) => (
              <div
                key={`${deal.id}-${event.date}-${index}`}
                className="flex flex-wrap items-center justify-between gap-2 px-[10px] py-[10px] text-xs"
              >
                <span className="text-gray-700">{event.action}</span>
                <span className="text-gray-500">
                  {formatDate(event.date)} · {event.actor}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-[10px] border-t border-gray-200">
          <Link href={`/deals/${deal.id}`}>
            <Button size="sm">
              Открыть спор
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/deals/${deal.id}`}>
            <Button size="sm" variant="outline">
              Перейти к сделке
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

export function DisputesTab({ deals }: { deals: Deal[] }) {
  const disputeDeals = deals.filter((deal) => deal.status === "dispute");
  const frozenTotal = disputeDeals.reduce((sum, deal) => {
    const stage = getDisputedStage(deal);
    return sum + (stage?.price ?? deal.totalPrice);
  }, 0);

  if (disputeDeals.length === 0) {
    return (
      <EmptyState
        title="Нет открытых споров"
        description="Здесь отображаются сделки, по которым процесс оспаривания услуг открыт и ещё не завершён"
      />
    );
  }

  return (
    <div className="space-y-[10px]">
      <p className="text-sm text-gray-600 max-w-2xl">
        Раздел «Споры» показывает сделки с открытым процессом оспаривания услуг. До решения
        платформы выплаты и возвраты по таким сделкам приостановлены.
      </p>

      <div className="grid sm:grid-cols-3 gap-[10px]">
        <Card className="p-[10px]">
          <CardDescription className="flex items-center gap-1">
            <Scale className="h-3.5 w-3.5" />
            Открытых споров
          </CardDescription>
          <CardTitle className="mt-[10px]">{disputeDeals.length}</CardTitle>
        </Card>
        <Card className="p-[10px]">
          <CardDescription>Заморожено средств</CardDescription>
          <CardTitle className="mt-[10px]">{formatPrice(frozenTotal)}</CardTitle>
        </Card>
        <Card className="p-[10px]">
          <CardDescription className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            На рассмотрении
          </CardDescription>
          <CardTitle className="mt-[10px]">{disputeDeals.length}</CardTitle>
        </Card>
      </div>

      <div className="space-y-[10px] max-w-3xl">
        {disputeDeals.map((deal) => (
          <DisputeCard key={deal.id} deal={deal} />
        ))}
      </div>
    </div>
  );
}
