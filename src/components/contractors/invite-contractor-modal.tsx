"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/states";
import { REQUEST_FORMAT_LABELS, REQUEST_STATUS_LABELS } from "@/constants/statuses";
import type { Contractor, Request } from "@/data/types";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast-provider";
import { cn } from "@/lib/utils/cn";
import { formatShortDate } from "@/lib/utils/formatters";

interface InviteContractorModalProps {
  open: boolean;
  onClose: () => void;
  contractor: Contractor | null;
}

function canInviteToRequest(request: Request) {
  return request.status === "draft" || request.status === "published";
}

export function InviteContractorModal({
  open,
  onClose,
  contractor,
}: InviteContractorModalProps) {
  const { showToast } = useToast();
  const { isAuthenticated, user } = useAuthStore();
  const { requests, updateRequest } = usePrototypeStore();
  const [selectedRequestId, setSelectedRequestId] = useState("");

  const availableRequests = useMemo(
    () => requests.filter(canInviteToRequest),
    [requests]
  );

  const selectedRequest = availableRequests.find((request) => request.id === selectedRequestId);

  const handleClose = () => {
    setSelectedRequestId("");
    onClose();
  };

  const handleInvite = () => {
    if (!contractor || !selectedRequest) return;

    if (selectedRequest.invitedContractorIds.includes(contractor.id)) {
      showToast(`${contractor.name} уже приглашён в эту заявку`, "info");
      handleClose();
      return;
    }

    const updates: Partial<Request> = {
      invitedContractorIds: [...selectedRequest.invitedContractorIds, contractor.id],
      history: [
        ...selectedRequest.history,
        {
          date: new Date().toISOString().split("T")[0],
          action: `Приглашён исполнитель: ${contractor.name}`,
        },
      ],
    };

    if (selectedRequest.format === "open_request") {
      updates.format = "closed_request";
    }

    updateRequest(selectedRequest.id, updates);
    showToast(`${contractor.name} приглашён в заявку «${selectedRequest.title}»`, "success");
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Пригласить в заявку"
      footer={
        isAuthenticated ? (
          <>
            <Button variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button onClick={handleInvite} disabled={!selectedRequestId}>
              Пригласить
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={handleClose}>
              Закрыть
            </Button>
            <Link href="/login">
              <Button>Войти</Button>
            </Link>
          </>
        )
      }
    >
      {!contractor ? null : (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-900">{contractor.name}</p>
            <p className="text-xs text-gray-600 mt-1">{contractor.city}</p>
          </div>

          {!isAuthenticated ? (
            <p className="text-sm text-gray-600 border border-gray-300 p-3">
              Войдите в аккаунт, чтобы пригласить исполнителя в одну из ваших заявок.
            </p>
          ) : availableRequests.length === 0 ? (
            <EmptyState
              title="Нет активных заявок"
              description="Сначала создайте заявку, затем пригласите исполнителя прямо из каталога"
            />
          ) : (
            <>
              <p className="text-sm text-gray-600">
                Выберите заявку, в которую нужно добавить исполнителя. Страница каталога останется открытой.
              </p>
              <div className="space-y-2 max-h-[320px] overflow-y-auto">
                {availableRequests.map((request) => {
                  const isSelected = request.id === selectedRequestId;
                  const alreadyInvited = request.invitedContractorIds.includes(contractor.id);

                  return (
                    <button
                      key={request.id}
                      type="button"
                      onClick={() => setSelectedRequestId(request.id)}
                      className={cn(
                        "w-full text-left border p-3 transition-colors",
                        isSelected
                          ? "border-gray-900 bg-gray-50"
                          : "border-gray-300 hover:border-gray-900"
                      )}
                    >
                      <p className="text-sm font-medium">{request.title}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {REQUEST_FORMAT_LABELS[request.format]} · {REQUEST_STATUS_LABELS[request.status]}
                        {request.deadline ? ` · до ${formatShortDate(request.deadline)}` : ""}
                      </p>
                      {alreadyInvited && (
                        <p className="text-xs text-gray-500 mt-1">Уже приглашён</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}