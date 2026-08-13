"use client";

import Link from "next/link";
import { GitCompare, MessageSquare, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRequestOrderLines } from "@/constants/request-order-details";
import { REQUEST_FORMAT_LABELS, REQUEST_STATUS_LABELS } from "@/constants/statuses";
import { SEED_EVENTS } from "@/data/mocks/seed";
import type { Deal, Request, Response } from "@/data/types";
import { usePrototypeStore } from "@/lib/store";
import { formatShortDate } from "@/lib/utils/formatters";
import { useToast } from "@/components/ui/toast-provider";

interface Props {
  request: Request;
  deal?: Deal;
}

function getContractorSelected(request: Request, deals: Deal[], responses: Response[]) {
  const hasDeal = deals.some((deal) => deal.requestId === request.id);
  const hasAcceptedResponse = responses.some(
    (response) => response.requestId === request.id && response.status === "accepted",
  );
  return (
    hasDeal ||
    hasAcceptedResponse ||
    request.status === "in_progress" ||
    request.status === "completed"
  );
}

export function RequestOrderCard({ request, deal }: Props) {
  const { updateRequest, deals, responses } = usePrototypeStore();
  const { showToast } = useToast();
  const event = request.eventId ? SEED_EVENTS.find((item) => item.id === request.eventId) : undefined;
  const orderLines = getRequestOrderLines(request.id);
  const orderLabel = deal?.number ?? `Заказ ${request.id.toUpperCase()}`;
  const contractorSelected = getContractorSelected(request, deals, responses);

  const deleteDraft = () => {
    updateRequest(request.id, { status: "completed" });
    showToast("Черновик удалён", "info");
  };

  return (
    <article className="flex h-full flex-col border border-gray-300 bg-white">
      <div className="p-4 space-y-2 text-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="font-semibold">{orderLabel}</p>
            <Link href={`/requests/${request.id}`} className="text-base font-bold hover:underline">
              {request.title}
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{REQUEST_FORMAT_LABELS[request.format]}</Badge>
            <Badge variant={request.status === "published" ? "solid" : "outline"}>
              {REQUEST_STATUS_LABELS[request.status]}
            </Badge>
          </div>
        </div>

        <p>
          <span className="text-gray-600">мероприятие:</span>{" "}
          <span className="font-medium">{event?.title ?? "—"}</span>
        </p>
        <p>
          <span className="text-gray-600">Площадка</span>{" "}
          <span className="font-medium">{event ? `"${event.venue}"` : "—"}</span>
        </p>
        <p>
          <span className="text-gray-600">Дата:</span>{" "}
          <span className="font-medium">
            {event ? `${formatShortDate(event.startDate)} — ${formatShortDate(event.endDate)}` : "—"}
          </span>
        </p>

        <p className="font-semibold pt-1">Позиции в корзине по заказу:</p>

        <div className="flex flex-wrap gap-2 pt-2">
          {request.responseCount > 0 && request.status !== "draft" ? (
            <Link href={`/requests/${request.id}/responses`}>
              <Button size="sm" variant="outline">
                <MessageSquare className="h-4 w-4" />
                Отклики ({request.responseCount})
              </Button>
            </Link>
          ) : null}
          {request.status === "published" && request.responseCount >= 2 && !contractorSelected ? (
            <Link href={`/requests/${request.id}/compare`}>
              <Button size="sm" variant="outline">
                <GitCompare className="h-4 w-4" />
                Сравнить
              </Button>
            </Link>
          ) : null}
          {request.status === "draft" ? (
            <Button size="sm" variant="outline" onClick={deleteDraft}>
              <Trash2 className="h-4 w-4" />
              Удалить
            </Button>
          ) : null}
        </div>
      </div>

      {orderLines.length === 0 ? (
        <div className="px-4 py-6 text-sm text-gray-600 text-center">
          Позиции не добавлены
        </div>
      ) : (
        <div>
          {orderLines.map((line, index) => {
            const row = (
              <div
                className={`flex h-full flex-col justify-between gap-2 px-4 py-3 text-sm ${
                  index > 0 ? "border-t border-gray-200" : ""
                }`}
              >
                <span className="font-medium leading-snug">{line.title}</span>
                <span className="text-gray-700">{line.supplierName}</span>
              </div>
            );

            if (line.href) {
              return (
                <Link
                  key={line.id}
                  href={line.href}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  {row}
                </Link>
              );
            }

            return <div key={line.id}>{row}</div>;
          })}
        </div>
      )}
    </article>
  );
}
