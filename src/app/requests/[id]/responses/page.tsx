"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { GitCompare, Star } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { formatPrice, formatShortDate } from "@/lib/utils/formatters";

export default function RequestResponsesPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuthStore();
  const { requests, responses, toggleCompareResponse, compareResponseIds } = usePrototypeStore();

  const request = requests.find((r) => r.id === id);
  const requestResponses = responses.filter((r) => r.requestId === id);

  if (!request) {
    return (
      <AppShell title="Отклики" breadcrumbs={[{ label: "Заявки", href: "/requests" }, { label: "Не найдено" }]}>
        <EmptyState title="Заявка не найдена" actionLabel="К заявкам" onAction={() => (window.location.href = "/requests")} />
      </AppShell>
    );
  }

  const isOwner = user?.id === request.customerId;

  return (
    <AppShell
      title={`Отклики: ${request.title}`}
      breadcrumbs={[
        { label: "Заявки", href: "/requests" },
        { label: request.title, href: `/requests/${id}` },
        { label: "Отклики" },
      ]}
      actions={
        isOwner && requestResponses.length >= 2 ? (
          <Link href={`/requests/${id}/compare`}>
            <Button size="sm">
              <GitCompare className="h-4 w-4" />
              Сравнить ({compareResponseIds.length || requestResponses.length})
            </Button>
          </Link>
        ) : undefined
      }
    >
      {requestResponses.length === 0 ? (
        <EmptyState
          title="Откликов пока нет"
          description="Исполнители смогут откликнуться после публикации заявки"
        />
      ) : (
        <div className="space-y-4">
          {requestResponses.map((response) => (
            <Card key={response.id}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-base">{response.contractorName}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Star className="h-3.5 w-3.5" />
                    {response.rating} · Срок: {response.deadline}
                  </CardDescription>
                  <p className="text-sm text-gray-700 mt-2">{response.approach}</p>
                  {response.comment && (
                    <p className="text-sm text-gray-600 mt-1 italic">{response.comment}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Действует до {formatShortDate(response.validUntil)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-bold">{formatPrice(response.price)}</p>
                  <Badge variant="outline" className="mt-2">
                    {response.status === "pending"
                      ? "На рассмотрении"
                      : response.status === "accepted"
                        ? "Выбран"
                        : "Отклонён"}
                  </Badge>
                  <div className="flex flex-col gap-2 mt-3">
                    {isOwner && (
                      <>
                        <label className="flex items-center gap-2 text-xs cursor-pointer justify-end">
                          <input
                            type="checkbox"
                            checked={compareResponseIds.includes(response.id)}
                            onChange={() => toggleCompareResponse(response.id)}
                            className="border-gray-900"
                          />
                          В сравнение
                        </label>
                        <Link href={`/requests/${id}/compare?ids=${response.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            Подробнее
                          </Button>
                        </Link>
                      </>
                    )}
                    <Link href={`/contractors/${response.contractorId}`}>
                      <Button variant="ghost" size="sm" className="w-full">
                        Профиль
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
              {response.estimate.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-600 mb-2">Смета</p>
                  {response.estimate.map((section) => (
                    <div key={section.id} className="text-xs text-gray-700">
                      <span className="font-medium">{section.title}:</span>{" "}
                      {section.items.map((i) => i.name).join(", ")}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
