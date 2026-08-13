"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Star, X } from "lucide-react";
import { ContractorRegistryBadges } from "@/components/contractors/contractor-registry-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ConfirmModal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast-provider";
import { RESPONSE_STATUS_LABELS } from "@/constants/statuses";
import { SEED_CONTRACTORS } from "@/data/mocks/seed";
import type { Response } from "@/data/types";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { createDealFromResponse } from "@/lib/utils/create-deal-from-response";
import { formatPrice, formatShortDate } from "@/lib/utils/formatters";

export function ResponseCard({
  response,
  requestId,
  isOwner,
  category,
  city,
  eventTitle,
  onDismiss,
}: {
  response: Response;
  requestId: string;
  isOwner: boolean;
  category?: string;
  city?: string;
  eventTitle?: string;
  onDismiss?: (responseId: string) => void;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useAuthStore();
  const { requests, responses, deals, addDeal, updateRequest, updateResponse } = usePrototypeStore();

  const [dismissOpen, setDismissOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  const contractor = SEED_CONTRACTORS.find((item) => item.id === response.contractorId);

  const contractorProfileHref = isOwner
    ? `/contractors/${response.contractorId}?from=responses&requestId=${requestId}&responseId=${response.id}`
    : `/contractors/${response.contractorId}`;

  const handleDismiss = () => {
    setHidden(true);
    onDismiss?.(response.id);
  };

  const handleAssign = () => {
    const request = requests.find((item) => item.id === requestId);
    if (!request) return;

    const deal = createDealFromResponse({
      request,
      response,
      dealsCount: deals.length,
      actorName: user?.name ?? "Заказчик",
    });

    addDeal(deal);
    updateRequest(request.id, { status: "in_progress" });
    updateResponse(response.id, { status: "accepted" });
    responses
      .filter((item) => item.requestId === requestId && item.id !== response.id)
      .forEach((item) => updateResponse(item.id, { status: "rejected" }));

    showToast("Исполнитель назначен, сделка создана", "success");
    router.push(`/deals/${deal.id}`);
  };

  if (hidden) return null;

  return (
    <>
      <Card className="relative w-full max-w-sm flex flex-col gap-4">
        {isOwner && (
          <button
            type="button"
            onClick={() => setDismissOpen(true)}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-900"
            aria-label="Скрыть отклик"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{RESPONSE_STATUS_LABELS[response.status]}</Badge>
          <ContractorRegistryBadges inRsvya={contractor?.inRsvya} inSroVz={contractor?.inSroVz} />
        </div>

        <div className="space-y-1 pr-6">
          <CardTitle>{response.contractorName}</CardTitle>
          <CardDescription className="flex items-center gap-1 mt-0">
            <Star className="h-3.5 w-3.5" />
            {response.rating} · Срок: {response.deadline}
          </CardDescription>
        </div>

        <p className="text-2xl font-bold">{formatPrice(response.price)}</p>

        <div className="space-y-2 text-sm text-gray-700">
          <p>{response.approach}</p>
          {response.comment && <p>{response.comment}</p>}
          {response.estimate.map((section) => (
            <p key={section.id}>
              {section.title}: {section.items.map((item) => item.name).join(", ")}
            </p>
          ))}
          {isOwner && <p>Расширенная проверка (услуга платная)</p>}
          <p>Действует до {formatShortDate(response.validUntil)}</p>
        </div>

        {(category || city || eventTitle) && (
          <div className="space-y-1 border-t border-gray-200 pt-3 text-sm text-gray-700">
            {category && (
              <p>
                <span className="text-gray-500">Категория:</span> {category}
              </p>
            )}
            {city && (
              <p>
                <span className="text-gray-500">Город:</span> {city}
              </p>
            )}
            {eventTitle && (
              <p>
                <span className="text-gray-500">Мероприятие:</span> {eventTitle}
              </p>
            )}
          </div>
        )}

        <div className="pt-3 border-t border-gray-200 flex flex-col items-center gap-4">
          <Link href={contractorProfileHref} className="w-full">
            <Button variant="outline" size="sm" className="w-full">
              Профиль исполнителя
            </Button>
          </Link>
          {isOwner && response.status === "pending" && (
            <button
              type="button"
              onClick={() => setAssignOpen(true)}
              className="text-xs text-gray-900 hover:underline"
            >
              Назначить исполнителя
            </button>
          )}
        </div>
      </Card>

      <ConfirmModal
        open={dismissOpen}
        onClose={() => setDismissOpen(false)}
        onConfirm={handleDismiss}
        title="Скрыть отклик"
        message={`Скрыть отклик от «${response.contractorName}» из списка?`}
      />

      <ConfirmModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        onConfirm={handleAssign}
        title="Назначить исполнителя"
        message={`Назначить «${response.contractorName}» исполнителем по этой заявке и создать сделку?`}
      />
    </>
  );
}
