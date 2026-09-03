"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast-provider";
import { SEED_EVENT_ORDERS, SEED_EVENTS } from "@/data/mocks/seed";
import type { Participant } from "@/data/types";
import { usePrototypeStore } from "@/lib/store";
import { cn } from "@/lib/utils/cn";
import { formatDate, formatShortDate } from "@/lib/utils/formatters";

interface Props {
  eventId: string;
  participantId: string;
  organizerId?: string;
}

const WORKFLOW_STEPS = [
  { id: "application", label: "Заявка" },
  { id: "moderation", label: "Модерация" },
  { id: "booking", label: "Бронь" },
  { id: "invoice", label: "Счёт" },
  { id: "payment", label: "Оплата" },
] as const;

type WorkflowStepId = (typeof WORKFLOW_STEPS)[number]["id"];

function hasInvoice(participant: Participant) {
  return participant.documents.some((document) =>
    /invoice|сч/i.test(document)
  );
}

function getWorkflowState(participant: Participant) {
  const rejected = participant.status === "Отклонён";
  const confirmed = participant.status === "Подтверждён";
  const pendingModeration = participant.status === "На модерации";
  const hasBooking = Boolean(participant.assignedSpace);
  const invoiced = hasInvoice(participant);
  const paid = participant.paid;

  const completed: Record<WorkflowStepId, boolean> = {
    application: true,
    moderation: confirmed || rejected,
    booking: confirmed && hasBooking,
    invoice: confirmed && hasBooking && invoiced,
    payment: confirmed && hasBooking && invoiced && paid,
  };

  let currentStep: WorkflowStepId = "application";
  if (rejected) {
    currentStep = "moderation";
  } else if (pendingModeration) {
    currentStep = "moderation";
  } else if (confirmed && !hasBooking) {
    currentStep = "booking";
  } else if (confirmed && hasBooking && !invoiced) {
    currentStep = "invoice";
  } else if (confirmed && hasBooking && invoiced && !paid) {
    currentStep = "payment";
  } else if (paid) {
    currentStep = "payment";
  }

  return { completed, currentStep, rejected, confirmed, pendingModeration };
}

export function OrganizerParticipantDetailSection({
  eventId,
  participantId,
  organizerId = "user-organizer",
}: Props) {
  const { showToast } = useToast();
  const participants = usePrototypeStore((state) => state.participants);
  const updateParticipant = usePrototypeStore((state) => state.updateParticipant);

  const event = SEED_EVENTS.find((item) => item.id === eventId);
  const participant = participants.find((item) => item.id === participantId);

  const [spaceDraft, setSpaceDraft] = useState("");

  const relatedOrders = useMemo(
    () =>
      SEED_EVENT_ORDERS.filter(
        (order) =>
          order.eventId === eventId &&
          order.customerRole === "exhibitor" &&
          order.customerName === participant?.name
      ),
    [eventId, participant?.name]
  );

  if (!event || event.organizerId !== organizerId) {
    return <EmptyState title="Мероприятие не найдено" />;
  }

  if (!participant || participant.eventId !== eventId) {
    return <EmptyState title="Участник не найден" />;
  }

  const workflow = getWorkflowState(participant);
  const currentStepIndex = WORKFLOW_STEPS.findIndex((step) => step.id === workflow.currentStep);
  const allComplete = workflow.completed.payment;

  const handleApprove = () => {
    updateParticipant(participant.id, { status: "Подтверждён" });
    showToast("Заявка экспонента подтверждена", "success");
  };

  const handleReject = () => {
    updateParticipant(participant.id, { status: "Отклонён" });
    showToast("Заявка отклонена", "info");
  };

  const handleAssignSpace = () => {
    const value = spaceDraft.trim();
    if (!value) {
      showToast("Укажите участок или площадь", "error");
      return;
    }
    updateParticipant(participant.id, { assignedSpace: value });
    showToast("Участок закреплён за экспонентом", "success");
    setSpaceDraft("");
  };

  const handleIssueInvoice = () => {
    if (hasInvoice(participant)) return;
    updateParticipant(participant.id, {
      documents: [...participant.documents, "invoice.pdf"],
    });
    showToast("Счёт выставлен экспоненту", "success");
  };

  const handleMarkPaid = () => {
    updateParticipant(participant.id, { paid: true });
    showToast("Оплата зафиксирована", "success");
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="space-y-2">
        <BackButton
          fallbackHref={`/account/organizer/edit-event?id=${eventId}&tab=participants`}
        />
        <h1 className="text-xl font-bold text-gray-900">{participant.name}</h1>
        <CardDescription>
          Экспонент · {event.title} · {formatShortDate(event.startDate)} —{" "}
          {formatShortDate(event.endDate)}
        </CardDescription>
      </div>

      <Card className="space-y-4">
        <div>
          <CardTitle className="text-sm mb-1">Цепочка участия</CardTitle>
          <CardDescription>
            Заявка экспонента → модерация → бронь → счёт → оплата
          </CardDescription>
        </div>

        <div className="flex flex-wrap gap-2">
          {WORKFLOW_STEPS.map((step, index) => {
            const done = workflow.completed[step.id];
            const active = step.id === workflow.currentStep && !allComplete && !workflow.rejected;
            const upcoming = index > currentStepIndex && !done;

            return (
              <div key={step.id} className="flex items-center gap-2">
                <div
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium border flex items-center gap-1.5",
                    active && "bg-gray-900 text-white border-gray-900",
                    done && !active && "bg-gray-100 border-gray-400 text-gray-900",
                    upcoming && "border-gray-300 text-gray-400",
                    workflow.rejected && step.id === "moderation" && "bg-red-50 border-red-400 text-red-900"
                  )}
                >
                  {done && !active ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                  {step.label}
                </div>
                {index < WORKFLOW_STEPS.length - 1 ? (
                  <ArrowRight className="h-3.5 w-3.5 text-gray-400 hidden sm:block" />
                ) : null}
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{participant.status}</Badge>
          <Badge variant={participant.paid ? "solid" : "outline"}>
            {participant.paid ? "Оплачено" : "Не оплачено"}
          </Badge>
        </div>

        <dl className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-600">Дата заявки</dt>
            <dd className="font-medium mt-1">
              {participant.applicationDate
                ? formatDate(participant.applicationDate)
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-600">Площадь / участок</dt>
            <dd className="font-medium mt-1">{participant.assignedSpace || "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-600">Город</dt>
            <dd className="font-medium mt-1">{event.city}</dd>
          </div>
          <div>
            <dt className="text-gray-600">Площадка</dt>
            <dd className="font-medium mt-1">{event.venue}</dd>
          </div>
        </dl>

        {workflow.rejected ? (
          <p className="text-sm text-red-700 border border-red-200 bg-red-50 px-3 py-2">
            Заявка отклонена. Дальнейшие шаги недоступны.
          </p>
        ) : allComplete ? (
          <p className="text-sm text-emerald-800 border border-emerald-200 bg-emerald-50 px-3 py-2">
            Участие оформлено полностью: бронь подтверждена, счёт оплачен.
          </p>
        ) : (
          <div className="border border-gray-300 p-4 space-y-3">
            <p className="text-sm font-medium">
              Текущий шаг:{" "}
              {WORKFLOW_STEPS.find((step) => step.id === workflow.currentStep)?.label}
            </p>

            {workflow.currentStep === "moderation" && workflow.pendingModeration && (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={handleApprove}>
                  Подтвердить заявку
                </Button>
                <Button size="sm" variant="outline" onClick={handleReject}>
                  Отклонить
                </Button>
              </div>
            )}

            {workflow.currentStep === "booking" && (
              <div className="space-y-3 max-w-sm">
                <Input
                  label="Участок / площадь"
                  placeholder="B3 · 24 кв.м"
                  value={spaceDraft}
                  onChange={(event) => setSpaceDraft(event.target.value)}
                />
                <Button size="sm" onClick={handleAssignSpace}>
                  Закрепить бронь
                </Button>
              </div>
            )}

            {workflow.currentStep === "invoice" && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Участок {participant.assignedSpace}. Выставьте счёт за аренду площади.
                </p>
                <Button size="sm" onClick={handleIssueInvoice}>
                  Выставить счёт
                </Button>
              </div>
            )}

            {workflow.currentStep === "payment" && (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={handleMarkPaid}>
                  Отметить оплату
                </Button>
                <Link href="/account/organizer/payments">
                  <Button size="sm" variant="outline">
                    Открыть оплаты
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        <div>
          <CardTitle className="text-sm mb-2">Документы</CardTitle>
          {participant.documents.length === 0 ? (
            <CardDescription>Появятся после выставления счёта и подписания договора</CardDescription>
          ) : (
            <ul className="space-y-1 text-sm">
              {participant.documents.map((document) => (
                <li key={document} className="border border-gray-200 px-3 py-2 flex justify-between gap-2">
                  <span>{document}</span>
                  <Link href="/account/organizer/documents" className="underline text-xs shrink-0">
                    Открыть
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {relatedOrders.length > 0 && (
          <div className="border-t border-gray-200 pt-3 space-y-2">
            <CardTitle className="text-sm">Связанные заказы</CardTitle>
            <ul className="space-y-2 text-sm">
              {relatedOrders.map((order) => (
                <li key={order.id} className="flex flex-wrap items-center justify-between gap-2">
                  <Link href="/account/organizer/orders" className="underline hover:text-gray-900">
                    {order.title}
                  </Link>
                  <Badge variant="outline">{order.status}</Badge>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}