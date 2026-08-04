"use client";

import Link from "next/link";
import { Building2, CalendarClock, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { REQUEST_FORMAT_LABELS } from "@/constants/statuses";
import { DEMO_USERS } from "@/data/mocks/seed";
import type { Event, Request } from "@/data/types";
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
  const venue = getRequestVenue(request, event);
  const customerName = getCustomerName(request);
  const responseDeadline = getResponseDeadlineLabel(request);

  return (
    <Card className="h-full flex flex-col">
      <div className="flex flex-wrap items-center gap-2 mb-[10px]">
        <Badge variant="outline">{REQUEST_FORMAT_LABELS[request.format]}</Badge>
        <span className="text-xs text-gray-500">{request.responseCount} откликов</span>
      </div>

      <CardTitle className="text-base leading-snug mb-[10px]">{request.title}</CardTitle>
      <CardDescription className="mb-[10px]">{request.category}</CardDescription>

      <dl className="space-y-[10px] text-sm flex-1">
        {responseDeadline && (
          <div>
            <dt className="flex items-center gap-1 text-xs text-gray-500 mb-1">
              <CalendarClock className="h-3.5 w-3.5" />
              Окончание приёма откликов
            </dt>
            <dd className="font-medium">{responseDeadline}</dd>
          </div>
        )}

        <div>
          <dt className="flex items-center gap-1 text-xs text-gray-500 mb-1">
            <MapPin className="h-3.5 w-3.5" />
            Площадка
          </dt>
          <dd>{venue}</dd>
        </div>

        <div>
          <dt className="flex items-center gap-1 text-xs text-gray-500 mb-1">
            <Users className="h-3.5 w-3.5" />
            Заказчик
          </dt>
          <dd>{customerName}</dd>
        </div>

        <div>
          <dt className="flex items-center gap-1 text-xs text-gray-500 mb-1">
            <Building2 className="h-3.5 w-3.5" />
            Бюджет
          </dt>
          <dd>{formatBudget(request)}</dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-2 mt-[10px] pt-[10px]">
        <Link href={`/requests/${request.id}`} className="flex-1 min-w-[120px]">
          <Button size="sm" variant="outline" className="w-full">Открыть</Button>
        </Link>
        <Link href={`/requests/${request.id}/respond`} className="flex-1 min-w-[120px]">
          <Button size="sm" className="w-full">Откликнуться</Button>
        </Link>
      </div>
    </Card>
  );
}
