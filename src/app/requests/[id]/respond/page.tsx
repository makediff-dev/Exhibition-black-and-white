"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Send } from "lucide-react";
import { EstimateBuilder, calcEstimateTotal } from "@/components/forms/estimate-builder";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/states";
import type { EstimateSection, Response } from "@/data/types";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast-provider";
import { formatPrice } from "@/lib/utils/formatters";
import { getContractorIdForUser, findContractorForUser, isResponseForUser } from "@/lib/utils/user-entity-map";
import { isRequestVisibleToContractor } from "@/lib/utils/cabinet-scope";
import { canSubmitProposal } from "@/lib/auth/authorization";
import { validateProposalPayload } from "@/lib/state/proposal-payload";
import { getRequestStatus } from "@/lib/state/request-machine";
import { StatusSummary } from "@/components/ui/status-summary";
import { getPrototypeNowDateIso } from "@/lib/time/now";
import { addDaysIso } from "@/lib/state/clock";

const RESPONSE_STATUS_LABELS: Record<string, string> = {
  pending: "На рассмотрении",
  accepted: "Принят",
  rejected: "Отклонён",
  withdrawn: "Отозван",
};

export default function RespondPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useAuthStore();
  const { requests, responses, deals, addResponse, updateRequest } = usePrototypeStore();
  const requestResponses = responses.filter((item) => item.requestId === id);
  const { showToast } = useToast();

  const request = requests.find((r) => r.id === id);
  const contractor = findContractorForUser(user);

  const [price, setPrice] = useState("");
  const [deadline, setDeadline] = useState("14 дней");
  const [terms, setTerms] = useState("Предоплата 50%");
  const [comment, setComment] = useState("");
  const [approach, setApproach] = useState("");
  const [estimate, setEstimate] = useState<EstimateSection[]>([]);
  const [files, setFiles] = useState<string[]>([]);

  if (!request) {
    return (
      <AppShell title="Отклик" showBack backFallbackHref="/requests">
        <EmptyState title="Заявка не найдена" actionLabel="К заявкам" actionHref="/requests" />
      </AppShell>
    );
  }

  const existing = responses.find(
    (r) => r.requestId === id && isResponseForUser(r, user)
  );
  const lifecycle = getRequestStatus(request, user, requestResponses, deals);
  const submitAccess = canSubmitProposal(user, request, requestResponses, deals);

  if (!existing && !isRequestVisibleToContractor(request, user)) {
    return (
      <AppShell
        title="Отклик недоступен"
        showBack
        backFallbackHref={`/requests/${id}`}
      >
        <EmptyState
          title="Заявка не принимает отклики"
          description="Эта заявка не совпадает с вашей категорией или географией. Расширьте специализацию в профиле или города оказания услуг, чтобы видеть такие заявки."
          actionLabel="Категории в профиле"
          actionHref="/account/contractor/profile"
        />
        <p className="text-center text-sm">
          <Link href="/account/contractor/cities" className="underline">
            Города оказания услуг
          </Link>
        </p>
      </AppShell>
    );
  }

  if (user?.role === "contractor" && !contractor) {
    return (
      <AppShell title="Отклик" showBack backFallbackHref="/requests">
        <EmptyState
          title="Профиль исполнителя не найден"
          description="Не удалось сопоставить аккаунт с карточкой исполнителя"
          actionLabel="К заявкам"
          actionHref="/requests"
        />
      </AppShell>
    );
  }

  if (existing) {
    const relatedDeal = deals.find(
      (d) => d.requestId === id && d.contractorId === existing.contractorId
    );
    return (
      <AppShell
        title="Ваш отклик"
        showBack
        backFallbackHref={`/requests/${id}`}
        actions={
          <>
            <Link href={`/requests/${id}`}>
              <Button size="sm" variant="outline">К заявке</Button>
            </Link>
            {relatedDeal && (
              <Link href={`/deals/${relatedDeal.id}`}>
                <Button size="sm">Открыть сделку</Button>
              </Link>
            )}
          </>
        }
      >
        <div className="space-y-4 max-w-2xl">
          <Card>
            <div className="flex justify-between items-start gap-3 flex-wrap mb-3">
              <CardTitle>{formatPrice(existing.price)}</CardTitle>
              <Badge variant="outline">
                {RESPONSE_STATUS_LABELS[existing.status] ?? existing.status}
              </Badge>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-600">Срок</dt>
                <dd>{existing.deadline}</dd>
              </div>
              {existing.terms && (
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-600">Условия</dt>
                  <dd className="text-right">{existing.terms}</dd>
                </div>
              )}
            </dl>
            {existing.approach && (
              <div className="mt-4">
                <p className="text-sm font-medium">Подход к работе</p>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{existing.approach}</p>
              </div>
            )}
            {existing.comment && (
              <div className="mt-4">
                <p className="text-sm font-medium">Комментарий</p>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{existing.comment}</p>
              </div>
            )}
          </Card>
          {existing.status === "pending" && (
            <p className="text-sm text-gray-600">Дождитесь решения заказчика.</p>
          )}
        </div>
      </AppShell>
    );
  }

  if (!submitAccess.allowed) {
    return (
      <AppShell title="Отклик недоступен" showBack backFallbackHref={`/requests/${id}`}>
        <div className="space-y-4 max-w-2xl">
          <StatusSummary status={lifecycle} />
          <EmptyState
            title="Отклик недоступен"
            description={submitAccess.reason}
            actionLabel="К заявке"
            actionHref={`/requests/${id}`}
          />
        </div>
      </AppShell>
    );
  }

  const estimateTotal = calcEstimateTotal(estimate);
  const finalPrice = price ? Number(price) : estimateTotal;

  const submit = () => {
    if (!submitAccess.allowed) {
      showToast(submitAccess.reason, "error");
      return;
    }
    const payload = validateProposalPayload({
      price: finalPrice,
      approach,
    });
    if (!payload.ok) {
      showToast(payload.reason, "error");
      return;
    }

    const response: Response = {
      id: `res-${Date.now()}`,
      requestId: id,
      contractorId: contractor!.id,
      contractorName: contractor!.name,
      price: finalPrice,
      deadline,
      terms,
      comment,
      approach,
      status: "pending",
      rating: contractor?.rating ?? 4.8,
      validUntil: addDaysIso(getPrototypeNowDateIso(), 30),
      estimate,
      files,
    };

    const accepted = addResponse(response);
    if (!accepted) {
      showToast("Отклик отклонён: цена и подход обязательны, заявка должна быть открыта.", "error");
      return;
    }
    updateRequest(id, { responseCount: request.responseCount + 1 });
    showToast("Отклик успешно отправлен", "success");
    router.push(`/requests/${id}`);
  };

  return (
    <AppShell
      title="Отклик на заявку"
      showBack
      backFallbackHref={`/requests/${id}`}
      actions={
        <Link href={`/requests/${id}`}>
          <Button variant="outline" size="sm">Отмена</Button>
        </Link>
      }
    >
      <div className="max-w-2xl space-y-6">
        <div className="border border-gray-300 p-4 bg-gray-50 text-sm rounded-card">
          <p className="font-medium">{request.title}</p>
          <p className="text-gray-600 mt-1">{request.category} · {request.city}</p>
        </div>
        <StatusSummary status={lifecycle} />

        <Input
          label="Цена, ₽ *"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder={estimateTotal > 0 ? String(estimateTotal) : "520000"}
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Срок выполнения"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
          <Input
            label="Условия оплаты"
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
          />
        </div>

        <Textarea
          label="Подход к выполнению *"
          value={approach}
          onChange={(e) => setApproach(e.target.value)}
          placeholder="Опишите, как будете выполнять задачу"
        />

        <Textarea
          label="Комментарий"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <div>
          <p className="text-sm font-medium mb-3">Смета</p>
          <EstimateBuilder sections={estimate} onChange={setEstimate} />
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Файлы</p>
          <FileUpload onUpload={(name) => setFiles((prev) => [...prev, name])} />
          {files.length > 0 && (
            <ul className="text-xs text-gray-600 mt-2 space-y-1">
              {files.map((f) => (
                <li key={f}>📄 {f}</li>
              ))}
            </ul>
          )}
        </div>

        <Button
          onClick={submit}
          className="w-full sm:w-auto"
          disabled={!submitAccess.allowed}
        >
          <Send className="h-4 w-4" />
          Отправить отклик
        </Button>
      </div>
    </AppShell>
  );
}