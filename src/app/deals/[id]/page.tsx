"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  CreditCard,
  FileText,
  MessageSquare,
  Play,
  Send,
  Shield,
  Upload,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ConfirmModal } from "@/components/ui/modal";
import { DealReviewTab } from "@/components/deals/deal-review-tab";
import { EventOrdersPanel } from "@/components/deals/event-orders-panel";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/states";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  DEAL_STATUS_LABELS,
  REQUEST_FORMAT_LABELS,
} from "@/constants/statuses";
import type { Deal, DealStage, DealStatus } from "@/data/types";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { formatPrice, formatShortDate } from "@/lib/utils/formatters";
import { useToast } from "@/components/ui/toast-provider";

const STAGE_STATUS_LABELS: Record<DealStage["status"], string> = {
  pending: "Ожидает",
  in_progress: "В работе",
  review: "На проверке",
  accepted: "Принят",
  revision: "Доработка",
};

const SAFE_DEAL_STEPS = [
  { key: "negotiation", label: "Согласование" },
  { key: "awaiting_payment", label: "Оплата" },
  { key: "funds_reserved", label: "Резерв" },
  { key: "in_progress", label: "Работа" },
  { key: "stage_review", label: "Проверка" },
  { key: "stage_accepted", label: "Приёмка" },
  { key: "awaiting_payout", label: "Выплата" },
  { key: "completed", label: "Завершено" },
];

type DealTab = "overview" | "stages" | "documents" | "payments" | "files" | "history" | "review" | "recommend";

interface DealAction {
  id: string;
  label: string;
  status: DealStatus;
  variant?: "primary" | "outline" | "secondary";
  icon?: React.ReactNode;
  confirm?: string;
  stageUpdate?: Partial<DealStage>;
}

function getCustomerActions(deal: Deal): DealAction[] {
  const actions: DealAction[] = [];
  switch (deal.status) {
    case "negotiation":
      actions.push({
        id: "confirm",
        label: "Подтвердить условия",
        status: "awaiting_payment",
        icon: <Check className="h-4 w-4" />,
        confirm: "Подтвердить условия сделки и перейти к оплате?",
      });
      break;
    case "awaiting_payment":
      actions.push({
        id: "pay",
        label: "Оплатить",
        status: deal.format === "safe_deal" ? "funds_reserved" : "in_progress",
        icon: <CreditCard className="h-4 w-4" />,
        confirm: "Подтвердить оплату?",
      });
      break;
    case "stage_review":
      actions.push(
        {
          id: "accept",
          label: "Принять этап",
          status: "stage_accepted",
          icon: <Check className="h-4 w-4" />,
          confirm: "Принять результат этапа?",
        },
        {
          id: "remarks",
          label: "Замечания",
          status: "needs_revision",
          variant: "outline",
          icon: <AlertTriangle className="h-4 w-4" />,
          confirm: "Отправить на доработку?",
        }
      );
      break;
    case "stage_accepted":
      actions.push({
        id: "next",
        label: "Следующий этап",
        status: "in_progress",
        icon: <Play className="h-4 w-4" />,
      });
      break;
    case "dispute":
      actions.push({
        id: "resolve",
        label: "Принять решение спора",
        status: "completed",
        icon: <Check className="h-4 w-4" />,
        confirm: "Принять демонстрационное решение: частичная компенсация заказчику, сделка завершена?",
      });
      break;
    default:
      break;
  }
  if (deal.status !== "completed" && deal.status !== "dispute") {
    actions.push({
      id: "dispute",
      label: "Открыть спор",
      status: "dispute",
      variant: "outline",
      icon: <AlertTriangle className="h-4 w-4" />,
      confirm: "Открыть спор по сделке?",
    });
  }
  return actions;
}

function getContractorActions(deal: Deal): DealAction[] {
  const actions: DealAction[] = [];
  switch (deal.status) {
    case "negotiation":
      actions.push({
        id: "confirm",
        label: "Подтвердить условия",
        status: "awaiting_payment",
        icon: <Check className="h-4 w-4" />,
        confirm: "Подтвердить условия сделки?",
      });
      break;
    case "funds_reserved":
    case "needs_revision":
      actions.push({
        id: "start",
        label: "Начать работу",
        status: "in_progress",
        icon: <Play className="h-4 w-4" />,
        stageUpdate: { status: "in_progress" },
      });
      break;
    case "in_progress":
      actions.push({
        id: "submit",
        label: "Передать результат",
        status: "stage_review",
        icon: <Send className="h-4 w-4" />,
        confirm: "Передать результат этапа на проверку?",
        stageUpdate: { status: "review", result: "Результат передан" },
      });
      break;
    case "stage_accepted":
      actions.push({
        id: "payout",
        label: "Запросить выплату",
        status: "awaiting_payout",
        icon: <CreditCard className="h-4 w-4" />,
        confirm: "Запросить выплату по принятому этапу?",
      });
      break;
    case "awaiting_payout":
      actions.push({
        id: "complete",
        label: "Завершить сделку",
        status: "completed",
        icon: <Check className="h-4 w-4" />,
        confirm: "Завершить сделку?",
      });
      break;
    default:
      break;
  }
  return actions;
}

function SafeDealFlow({ status }: { status: DealStatus }) {
  const currentIndex = SAFE_DEAL_STEPS.findIndex((s) => s.key === status);

  return (
    <div className="border border-gray-300 p-4 mb-6">
      <p className="text-sm font-medium flex items-center gap-2 mb-3">
        <Shield className="h-4 w-4" />
        Безопасная сделка — этапы
      </p>
      <div className="flex flex-wrap gap-2">
        {SAFE_DEAL_STEPS.map((step, i) => {
          const done = currentIndex > i || status === "completed";
          const active = step.key === status;
          return (
            <div
              key={step.key}
              className={`px-2 py-1 text-xs border ${
                active
                  ? "bg-gray-900 text-white border-gray-900"
                  : done
                    ? "bg-gray-100 border-gray-400"
                    : "border-gray-300 text-gray-400"
              }`}
            >
              {step.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DealPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuthStore();
  const { deals, documents, payments, messages, requests, updateDeal, updateDealStatus } =
    usePrototypeStore();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<DealTab>("overview");
  const [confirmAction, setConfirmAction] = useState<DealAction | null>(null);
  const [remark, setRemark] = useState("");
  const [recommendInn, setRecommendInn] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [reviewUploadOpen, setReviewUploadOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const deal = deals.find((d) => d.id === id);
  const linkedRequest = deal?.requestId
    ? requests.find((request) => request.id === deal.requestId)
    : undefined;
  const eventId = deal?.eventId ?? linkedRequest?.eventId;
  const dealDocuments = documents.filter((d) => d.dealId === id);
  const dealPayments = payments.filter((p) => p.dealId === id);
  const messageThread = messages.find((m) => m.relatedId === id);

  const isCustomer = user?.id === deal?.customerId || user?.role === "customer";
  const isContractor = user?.role === "contractor";
  const isVenue = user?.role === "venue";

  const actions = useMemo(() => {
    if (!deal) return [];
    if (isCustomer) return getCustomerActions(deal);
    if (isContractor) return getContractorActions(deal);
    return [];
  }, [deal, isCustomer, isContractor]);

  const isStageReview = deal?.status === "stage_review";
  const stageReviewActions = useMemo(
    () => (deal && isStageReview ? getCustomerActions(deal) : []),
    [deal, isStageReview]
  );
  const remarksAction =
    stageReviewActions.find((action) => action.id === "remarks") ??
    actions.find((action) => action.id === "remarks");

  const handleActionClick = (action: DealAction) => {
    if (action.confirm) {
      setConfirmAction(action);
      return;
    }
    executeAction(action);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setUploadedFiles((prev) => [...prev, ...files.map((file) => file.name)]);
    showToast(`Загружено файлов: ${files.length}`, "success");
    event.target.value = "";
  };

  const handleSendActToEdo = (docNumber: string) => {
    if (user?.edoStatus !== "connected") {
      showToast("Подключите ЭДО в личном кабинете для отправки на подпись", "error");
      return;
    }
    showToast(`Акт ${docNumber} отправлен в ЭДО на подпись`, "success");
  };

  const executeAction = (action: DealAction) => {
    if (!deal) return;

    let updatedStages = deal.stages;
    if (action.stageUpdate) {
      const activeStageIndex = deal.stages.findIndex(
        (s) => s.status === "in_progress" || s.status === "review" || s.status === "revision"
      );
      const idx = activeStageIndex >= 0 ? activeStageIndex : 0;
      updatedStages = deal.stages.map((s, i) =>
        i === idx ? { ...s, ...action.stageUpdate } : s
      );
    }

    if (action.status === "stage_accepted" && action.id === "accept") {
      updatedStages = deal.stages.map((s) =>
        s.status === "review" ? { ...s, status: "accepted" as const } : s
      );
    }

    if (action.status === "needs_revision") {
      updatedStages = deal.stages.map((s) =>
        s.status === "review"
          ? { ...s, status: "revision" as const, comments: [...s.comments, remark || "Замечания заказчика"] }
          : s
      );
    }

    if (action.status === "in_progress" && action.id === "next") {
      const nextPending = updatedStages.findIndex((s) => s.status === "pending");
      if (nextPending >= 0) {
        updatedStages = updatedStages.map((s, i) =>
          i === nextPending ? { ...s, status: "in_progress" as const } : s
        );
      } else {
        updateDealStatus(deal.id, "awaiting_payout");
        showToast("Все этапы приняты", "success");
        return;
      }
    }

    updateDeal(deal.id, { stages: updatedStages });
    updateDealStatus(deal.id, action.status);
    showToast(`Статус: ${DEAL_STATUS_LABELS[action.status]}`, "success");
    setRemark("");
  };

  const tabs: { id: DealTab; label: string }[] = [
    { id: "overview", label: "Обзор" },
    { id: "stages", label: "Этапы" },
    { id: "documents", label: "Документы" },
    { id: "payments", label: "Оплаты" },
    { id: "files", label: "Файлы" },
    { id: "history", label: "История" },
    ...(deal?.status === "completed" ? [{ id: "review" as const, label: "Отзыв" }] : []),
    ...(deal?.status === "completed" && isCustomer
      ? [{ id: "recommend" as const, label: "Рекомендация" }]
      : []),
  ];

  const handleDealUpdate = (updates: Partial<Deal>) => {
    updateDeal(deal!.id, updates);
  };

  const handleRecommendByInn = () => {
    if (!recommendInn.trim()) {
      showToast("Укажите ИНН организации", "error");
      return;
    }
    showToast(`Рекомендация отправлена организации с ИНН ${recommendInn}`, "success");
    setRecommendInn("");
  };

  const handleShareProfile = (channel: "telegram" | "whatsapp" | "copy") => {
    if (!deal) return;
    const profileUrl = `${window.location.origin}/contractors/${deal.contractorId}`;
    const text = `Рекомендую исполнителя ${deal.contractorName}: ${profileUrl}`;
    if (channel === "copy") {
      void navigator.clipboard.writeText(text);
      showToast("Ссылка на профиль скопирована", "success");
      return;
    }
    const url =
      channel === "telegram"
        ? `https://t.me/share/url?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(`Рекомендую исполнителя ${deal.contractorName}`)}`
        : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!deal) {
    return (
      <AppShell title="Сделка" showBack backFallbackHref="/requests">
        <EmptyState
          title="Сделка не найдена"
          actionLabel="К заявкам"
          onAction={() => (window.location.href = "/requests")}
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      title={`${deal.number} — ${deal.title}`}
      showBack
      backFallbackHref={deal.requestId ? `/requests/${deal.requestId}` : "/requests"}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {messageThread && (
            <Link href={messageThread.relatedLink}>
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4" />
                Сообщения
              </Button>
            </Link>
          )}
          {actions.map((action) => (
            <Button
              key={action.id}
              size="sm"
              variant={action.variant ?? "primary"}
              onClick={() => handleActionClick(action)}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
          {deal.status === "completed" && isContractor && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setActiveTab("review");
                  setReviewUploadOpen(true);
                }}
              >
                <Upload className="h-4 w-4" />
                Загрузить фото проекта
              </Button>
              {!deal.reviewRequested && !deal.review && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setActiveTab("review");
                    handleDealUpdate({
                      reviewRequested: true,
                      reviewRequestedAt: new Date().toISOString().slice(0, 10),
                      history: [
                        ...deal.history,
                        {
                          date: new Date().toISOString().slice(0, 10),
                          action: "Исполнитель запросил отзыв у заказчика",
                          actor: deal.contractorName,
                        },
                      ],
                    });
                    showToast(
                      "Заказчику отправлено сообщение с просьбой оценить исполнителя",
                      "success"
                    );
                  }}
                >
                  <MessageSquare className="h-4 w-4" />
                  Запросить отзыв у заказчика
                </Button>
              )}
            </>
          )}
          {deal.status === "completed" && isCustomer && !deal.review && (
            <Button size="sm" onClick={() => setActiveTab("review")}>
              Оценить исполнителя
            </Button>
          )}
        </div>
      }
    >
      <ConfirmModal
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          if (confirmAction) executeAction(confirmAction);
          setConfirmAction(null);
        }}
        title={confirmAction?.label ?? "Подтверждение"}
        message={confirmAction?.confirm ?? "Выполнить действие?"}
      />

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge>{DEAL_STATUS_LABELS[deal.status]}</Badge>
        <Badge variant="outline">{REQUEST_FORMAT_LABELS[deal.format]}</Badge>
        <Badge variant="outline">{formatPrice(deal.totalPrice)}</Badge>
      </div>

      {deal.format === "safe_deal" && <SafeDealFlow status={deal.status} />}

      {deal.status === "dispute" && (
        <Card className="mb-6 border-2 border-gray-900">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Спор по сделке
          </CardTitle>
          <CardDescription className="mt-2">
            Заказчик оставил замечания после повторной передачи результата. Спор рассматривается модератором платформы.
            Демонстрационное решение: частичный возврат 20% заказчику, остальное — исполнителю за вычетом комиссии.
          </CardDescription>
          <p className="text-xs text-gray-500 mt-3 border-t border-gray-200 pt-3">
            Данные в прототипе демонстрационные. Нажмите «Принять решение спора» для завершения сценария.
          </p>
        </Card>
      )}

      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as DealTab)}
        className="mb-6"
      />

      {activeTab === "overview" && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardTitle className="text-sm mb-3">Стороны</CardTitle>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-600">Заказчик</dt>
                <dd className="font-medium">{deal.customerName}</dd>
              </div>
              <div>
                <dt className="text-gray-600">Исполнитель</dt>
                <dd className="font-medium">{deal.contractorName}</dd>
              </div>
            </dl>
          </Card>
          <Card>
            <CardTitle className="text-sm mb-3">Финансы</CardTitle>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Сумма</dt>
                <dd className="font-bold">{formatPrice(deal.totalPrice)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Комиссия</dt>
                <dd>{formatPrice(deal.commission)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Этапов</dt>
                <dd>{deal.stages.length}</dd>
              </div>
            </dl>
          </Card>
          {deal.requestId && (
            <Card className="md:col-span-2">
              <CardTitle className="text-sm mb-2">Связанная заявка</CardTitle>
              <Link href={`/requests/${deal.requestId}`} className="text-sm hover:underline">
                Перейти к заявке
              </Link>
            </Card>
          )}
          {eventId && (
            <EventOrdersPanel
              eventId={eventId}
              currentDealId={deal.id}
              showVenueNote={isVenue}
            />
          )}
          {isStageReview && (
            <Card className="md:col-span-2">
              <CardTitle className="text-sm mb-2">Замечания к этапу</CardTitle>
              <Textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Опишите замечания (используется при отправке на доработку)"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {remarksAction && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleActionClick(remarksAction)}
                  >
                    <Send className="h-4 w-4" />
                    Отправить замечания
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Загрузить файлы
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={handleFileUpload}
                />
              </div>
              {uploadedFiles.length > 0 && (
                <ul className="mt-3 space-y-1 text-xs text-gray-600">
                  {uploadedFiles.map((file) => (
                    <li key={file}>📄 {file}</li>
                  ))}
                </ul>
              )}
            </Card>
          )}
        </div>
      )}

      {activeTab === "stages" && (
        <div className="space-y-4">
          {deal.stages.map((stage, i) => (
            <Card key={stage.id}>
              <div className="flex flex-wrap justify-between gap-2 mb-2">
                <CardTitle className="text-sm">
                  {i + 1}. {stage.title}
                </CardTitle>
                <Badge variant="outline">{STAGE_STATUS_LABELS[stage.status]}</Badge>
              </div>
              <CardDescription>{stage.description}</CardDescription>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                <span>{formatPrice(stage.price)}</span>
                <span>Дедлайн: {formatShortDate(stage.deadline)}</span>
              </div>
              {stage.result && (
                <p className="text-sm mt-2 border-t border-gray-200 pt-2">
                  <span className="font-medium">Результат:</span> {stage.result}
                </p>
              )}
              {stage.comments.length > 0 && (
                <ul className="text-xs text-gray-600 mt-2 space-y-1">
                  {stage.comments.map((c, j) => (
                    <li key={j}>• {c}</li>
                  ))}
                </ul>
              )}
              {stage.files.length > 0 && (
                <ul className="text-xs mt-2">
                  {stage.files.map((f) => (
                    <li key={f}>📄 {f}</li>
                  ))}
                </ul>
              )}
            </Card>
          ))}
        </div>
      )}

      {activeTab === "documents" && (
        <div className="space-y-3">
          {dealDocuments.length === 0 ? (
            <EmptyState title="Документов пока нет" description="Документы появятся после согласования" />
          ) : (
            dealDocuments.map((doc) => (
              <div key={doc.id} className="border border-gray-300 p-3 text-sm">
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">
                      {doc.type} {doc.number}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <span>{formatShortDate(doc.date)}</span>
                    {doc.type === "Акт" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        onClick={() => handleSendActToEdo(doc.number)}
                      >
                        Отправить в ЭДО на подпись
                      </Button>
                    ) : (
                      <Badge variant="outline">{doc.status}</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "payments" && (
        <div className="space-y-3">
          {dealPayments.length === 0 ? (
            <EmptyState title="Оплат пока нет" />
          ) : (
            dealPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-wrap justify-between items-center border border-gray-300 p-3 text-sm"
              >
                <div>
                  <p className="font-medium">{payment.type}</p>
                  <p className="text-gray-600 text-xs">{payment.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatPrice(payment.amount)}</p>
                  <Badge variant="outline" className="mt-1">{payment.status}</Badge>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "files" && (
        <div className="space-y-2">
          {deal.stages.flatMap((s) => s.files).length === 0 ? (
            <EmptyState title="Файлов пока нет" />
          ) : (
            deal.stages.flatMap((s) =>
              s.files.map((f) => (
                <div key={`${s.id}-${f}`} className="border border-gray-300 p-3 text-sm">
                  📄 {f} <span className="text-gray-500">— {s.title}</span>
                </div>
              ))
            )
          )}
        </div>
      )}

      {activeTab === "review" && deal.status === "completed" && (
        <DealReviewTab
          deal={deal}
          isContractor={isContractor}
          isCustomer={isCustomer}
          onUpdate={handleDealUpdate}
          uploadModalOpen={reviewUploadOpen}
          onUploadModalOpenChange={setReviewUploadOpen}
        />
      )}

      {activeTab === "recommend" && deal.status === "completed" && isCustomer && (
        <div className="max-w-lg space-y-6">
          <p className="text-sm text-gray-600">
            Порекомендуйте исполнителя{" "}
            <span className="font-medium text-gray-900">{deal.contractorName}</span> другой
            организации или отправьте профиль коллеге.
          </p>

          <Card>
            <CardTitle className="text-sm mb-3">Рекомендация по ИНН</CardTitle>
            <CardDescription className="mb-4">
              Укажите ИНН организации, которой хотите порекомендовать исполнителя
            </CardDescription>
            <Input
              label="ИНН организации"
              value={recommendInn}
              onChange={(e) => setRecommendInn(e.target.value)}
              placeholder="10 или 12 цифр"
            />
            <Button className="mt-4" onClick={handleRecommendByInn}>
              Отправить рекомендацию
            </Button>
          </Card>

          <Card>
            <CardTitle className="text-sm mb-3">Отправить коллеге</CardTitle>
            <CardDescription className="mb-4">
              Поделитесь профилем исполнителя в мессенджере
            </CardDescription>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => handleShareProfile("telegram")}>
                Telegram
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleShareProfile("whatsapp")}>
                WhatsApp
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleShareProfile("copy")}>
                Скопировать ссылку
              </Button>
            </div>
            <Link
              href={`/contractors/${deal.contractorId}`}
              className="inline-block mt-4 text-sm hover:underline"
            >
              Открыть профиль исполнителя
            </Link>
          </Card>
        </div>
      )}

      {activeTab === "history" && (
        <ul className="space-y-2">
          {deal.history.length === 0 ? (
            <EmptyState title="История пуста" />
          ) : (
            [...deal.history].reverse().map((h, i) => (
              <li key={i} className="flex gap-3 text-sm border-b border-gray-200 pb-2">
                <span className="text-gray-500 shrink-0">{formatShortDate(h.date)}</span>
                <span>{h.action}</span>
                <span className="text-gray-500 ml-auto">{h.actor}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </AppShell>
  );
}
