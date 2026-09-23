"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ActionableStatus } from "@/lib/state/types";
import { formatDate, formatDateTime } from "@/lib/utils/formatters";

function formatDeadline(value: string | null) {
  if (!value) return "Без срока";
  return value.includes("T") ? formatDateTime(value) : formatDate(value);
}

export function StatusSummary({
  status,
  compact = false,
}: {
  status: ActionableStatus;
  compact?: boolean;
}) {
  const body = (
    <div className="space-y-2 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="solid">{status.label}</Badge>
        {status.nextActorLabel && (
          <span className="text-xs text-gray-600">Дальше: {status.nextActorLabel}</span>
        )}
      </div>
      <p className="text-gray-700">{status.explanation}</p>
      <p className="text-xs text-gray-500">Срок: {formatDeadline(status.deadline)}</p>
      {status.blockedReason && (
        <p className="text-sm text-gray-900">{status.blockedReason}</p>
      )}
    </div>
  );

  if (compact) return body;
  return <Card className="space-y-2">{body}</Card>;
}
