"use client";

import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EVENT_ORDER_TYPE_LABELS } from "@/constants/statuses";
import type { CompanyProfile, Event, EventOrder } from "@/data/types";
import {
  COMMERCIAL_ORDER_KIND_LABELS,
  getCommercialOrderKind,
  getEventOrderLifecycleCode,
  getEventOrderStatusLabel,
  getOrderTradeSide,
  getOrderTradeSideLabel,
} from "@/lib/utils/order-presentation";

interface EventOrderStatusBadgesProps {
  order: EventOrder;
  event?: Event;
  viewer?: CompanyProfile | null;
  actionRequired?: boolean;
}

export function EventOrderStatusBadges({
  order,
  event,
  viewer,
  actionRequired = false,
}: EventOrderStatusBadgesProps) {
  const statusLabel = getEventOrderStatusLabel(getEventOrderLifecycleCode(order, event));
  const sideLabel = getOrderTradeSideLabel(getOrderTradeSide(order, viewer));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="muted">{COMMERCIAL_ORDER_KIND_LABELS[getCommercialOrderKind(order.type)]}</Badge>
      <Badge variant="muted">{EVENT_ORDER_TYPE_LABELS[order.type]}</Badge>
      <Badge variant={actionRequired ? "outline" : "solid"}>{statusLabel}</Badge>
      <Badge variant={actionRequired ? "muted" : "outline"}>{sideLabel}</Badge>
      {actionRequired ? (
        <Badge variant="solid" icon={AlertCircle}>
          Действие
        </Badge>
      ) : null}
    </div>
  );
}
