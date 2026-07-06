"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Send } from "lucide-react";
import { EstimateBuilder, calcEstimateTotal } from "@/components/forms/estimate-builder";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/states";
import { SEED_CONTRACTORS } from "@/data/mocks/seed";
import type { EstimateSection, Response } from "@/data/types";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast-provider";

export default function RespondPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useAuthStore();
  const { requests, responses, addResponse, updateRequest } = usePrototypeStore();
  const { showToast } = useToast();

  const request = requests.find((r) => r.id === id);
  const contractor = SEED_CONTRACTORS.find((c) => c.id === "ctr-1");

  const [price, setPrice] = useState("");
  const [deadline, setDeadline] = useState("14 дней");
  const [terms, setTerms] = useState("Предоплата 50%");
  const [comment, setComment] = useState("");
  const [approach, setApproach] = useState("");
  const [estimate, setEstimate] = useState<EstimateSection[]>([]);
  const [files, setFiles] = useState<string[]>([]);

  if (!request) {
    return (
      <AppShell title="Отклик" breadcrumbs={[{ label: "Заявки", href: "/requests" }]}>
        <EmptyState title="Заявка не найдена" actionLabel="К заявкам" onAction={() => router.push("/requests")} />
      </AppShell>
    );
  }

  if (request.status !== "published") {
    return (
      <AppShell
        title="Отклик недоступен"
        breadcrumbs={[
          { label: "Заявки", href: "/requests" },
          { label: request.title, href: `/requests/${id}` },
        ]}
      >
        <EmptyState
          title="Заявка не принимает отклики"
          description="Откликнуться можно только на опубликованные заявки"
          actionLabel="К заявке"
          onAction={() => router.push(`/requests/${id}`)}
        />
      </AppShell>
    );
  }

  const existing = responses.find(
    (r) => r.requestId === id && r.contractorId === (contractor?.id ?? "ctr-1")
  );

  if (existing) {
    return (
      <AppShell
        title="Отклик отправлен"
        breadcrumbs={[
          { label: "Заявки", href: "/requests" },
          { label: request.title, href: `/requests/${id}` },
        ]}
      >
        <EmptyState
          title="Вы уже откликнулись"
          description="Дождитесь решения заказчика"
          actionLabel="К заявке"
          onAction={() => router.push(`/requests/${id}`)}
        />
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
      contractorId: contractor?.id ?? "ctr-1",
      contractorName: contractor?.name ?? user?.name ?? "ООО «СтендПро»",
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
      breadcrumbs={[
        { label: "Заявки", href: "/requests" },
        { label: request.title, href: `/requests/${id}` },
        { label: "Отклик" },
      ]}
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
