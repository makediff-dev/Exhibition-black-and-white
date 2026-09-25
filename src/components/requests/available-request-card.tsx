"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { CardField } from "@/components/ui/card-field";
import { REQUEST_FORMAT_LABELS } from "@/constants/statuses";
import { DEMO_USERS } from "@/data/mocks/seed";
import type { Event, Request } from "@/data/types";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { getRequestStatus } from "@/lib/state/request-machine";
import { formatDate, formatDateTime, formatPrice } from "@/lib/utils/formatters";

function getRequestVenue(request: Request, event?: Event) {
  if (event) {
    return `${event.venue}, ${event.city}`;
  }
  return request.city;
}

function formatBudget(request: Request) {
  if (request.budget.hidden) return "По запросу";
  if (request.budget.type === "range" && request.budget.min && request.budget.max) {
    return `${formatPrice(request.budget.min)} — ${formatPrice(request.budget.max)}`;
  }
  if (request.budget.min) return formatPrice(request.budget.min);
  return "По запросу";
}

function getCustomerName(request: Request) {
  return request.customerName ?? DEMO_USERS.customer.name;
}

function getResponseDeadlineLabel(request: Request) {
  if (request.responseDeadlineAt) {
    return formatDateTime(request.responseDeadlineAt);
  }
  if (request.deadline.includes("T")) {
    return formatDateTime(request.deadline);
  }
  if (request.deadline.includes("/")) {
    const [, end] = request.deadline.split("/");
    return end ? `${formatDate(end)}, 23:59` : null;
  }
  if (request.deadline) {
    return `${formatDate(request.deadline)}, 23:59`;
  }
  return null;
}

interface Props {
  request: Request;
  event?: Event;
}

export function AvailableRequestCard({ request, event }: Props) {
  const user = useAuthStore((state) => state.user);
  const responses = usePrototypeStore((state) => state.responses);
  const deals = usePrototypeStore((state) => state.deals);
  const lifecycle = getRequestStatus(request, user, responses, deals);
  const canRespond = lifecycle.allowedActions.includes("submit_proposal");
  const venue = getRequestVenue(request, event);
  const customerName = getCustomerName(request);
  const responseDeadline = getResponseDeadlineLabel(request);

  return (
    <Card className="h-full flex flex-col">
      <div className="flex flex-wrap items-center gap-2 mb-[10px]">
        <Badge variant="outline">{REQUEST_FORMAT_LABELS[request.format]}</Badge>
        <Badge variant={lifecycle.code === "expired" ? "solid" : "muted"}>{lifecycle.label}</Badge>
        <span className="text-xs text-gray-500">{request.responseCount} откликов</span>
      </div>

      <CardTitle className="text-base leading-snug mb-[10px]">{request.title}</CardTitle>
      <CardDescription className="mb-[10px]">{request.category}</CardDescription>

      <div className="space-y-[10px] flex-1">
        {responseDeadline && (
          <CardField label="Окончание приёма откликов">{responseDeadline}</CardField>
        )}
        <CardField label="Площадка">{venue}</CardField>
        <CardField label="Заказчик">{customerName}</CardField>
        <CardField label="Бюджет">{formatBudget(request)}</CardField>
      </div>

      <div className="flex flex-wrap gap-2 mt-[10px] pt-[10px]">
        <Link href={`/requests/${request.id}`} className="flex-1 min-w-[120px]">
          <Button size="sm" variant="outline" className="w-full">Открыть</Button>
        </Link>
        {canRespond ? (
          <Link href={`/requests/${request.id}/respond`} className="flex-1 min-w-[120px]">
            <Button size="sm" className="w-full">Откликнуться</Button>
          </Link>
        ) : lifecycle.recoveryActions.includes("expand_specialization") ? (
          <Link href="/account/contractor/profile" className="flex-1 min-w-[120px]">
            <Button size="sm" className="w-full">Расширить специализацию</Button>
          </Link>
        ) : (
          <Button size="sm" className="flex-1 min-w-[120px]" disabled>
            Отклик закрыт
          </Button>
        )}
        {lifecycle.blockedReason && (
          <p className="w-full text-xs text-gray-600">{lifecycle.blockedReason}</p>
        )}
      </div>
    </Card>
  );
}