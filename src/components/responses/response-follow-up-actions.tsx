"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { RESPONSE_FOLLOW_UP_ACTIONS } from "@/constants/statuses";
import { useToast } from "@/components/ui/toast-provider";
import type { UserRole } from "@/data/types";
import { getContractorCheckSubscribeHref } from "@/lib/utils/contractor-profile-links";

interface ResponseFollowUpActionsProps {
  contractorId: string;
  requestId?: string | null;
  responseId?: string | null;
  accountRole?: UserRole | null;
}

export function ResponseFollowUpActions({
  contractorId,
  requestId,
  responseId,
  accountRole = null,
}: ResponseFollowUpActionsProps) {
  const { showToast } = useToast();

  const buildSubscribeHref = () =>
    getContractorCheckSubscribeHref(contractorId, {
      role: accountRole,
      from: "responses",
      requestId: requestId ?? undefined,
      responseId: responseId ?? undefined,
    });

  const handleAction = (label: string) => {
    showToast(`${label} — действие доступно в полной версии`, "info");
  };

  return (
    <section className="border border-gray-300 p-4 rounded-[10px]">
      <p className="text-xs font-medium text-gray-600 mb-2">Дальнейшие действия</p>
      <ul className="space-y-1">
        {RESPONSE_FOLLOW_UP_ACTIONS.map((action) => (
          <li key={action.id}>
            {"route" in action && action.route === "subscribe" ? (
              <Link
                href={buildSubscribeHref()}
                className="inline-flex items-center gap-1 text-sm text-gray-900 hover:underline text-left"
              >
                {action.label}
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => handleAction(action.label)}
                className="inline-flex items-center gap-1 text-sm text-gray-900 hover:underline text-left"
              >
                {action.label}
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}