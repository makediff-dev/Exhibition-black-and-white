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
import { findContractorForUser, isResponseForUser } from "@/lib/utils/user-entity-map";

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

  if (request.status !== "published" && !existing) {
    return (
      <AppShell
        title="Отклик недоступен"
        showBack
        backFallbackHref={`/requests/${id}`}
      >
        <EmptyState
          title="Заявка не принимает отклики"
          description="Откликнуться можно только на опубликованные заявки"
          actionLabel="К заявке"
          actionHref={`/requests/${id}`}
        />
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

  const estimateTotal = calcEstimateTotal(estimate);
  const finalPrice = price ? Number(price) : estimateTotal;

  const submit = () => {
    if (!approach.trim() || finalPrice <= 0) {
      showToast("Заполните подход и цену", "error");
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
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      estimate,
      files,
    };

    addResponse(response);
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
        <div className="border border-gray-300 p-4 bg-gray-50 text-sm">
          <p className="font-medium">{request.title}</p>
          <p className="text-gray-600 mt-1">{request.category} · {request.city}</p>
        </div>

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

        <Button onClick={submit} className="w-full sm:w-auto">
          <Send className="h-4 w-4" />
          Отправить отклик
        </Button>
      </div>
    </AppShell>
  );
}
