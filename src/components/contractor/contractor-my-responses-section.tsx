"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { Input } from "@/components/ui/input";
import type { CompanyProfile, Request, Response } from "@/data/types";
import { formatPrice } from "@/lib/utils/formatters";
import { isResponseForUser } from "@/lib/utils/user-entity-map";

const FILTER_FIELDS: Array<{
  filterKey: keyof Pick<ResponseFilters, "dateFrom" | "amountFrom" | "urgencyDays">;
  label: string;
  inputType: "date" | "number";
  placeholder: string;
  ariaLabel: string;
}> = [
  {
    filterKey: "dateFrom",
    label: "По дате",
    inputType: "date",
    placeholder: "",
    ariaLabel: "Фильтр по дате",
  },
  {
    filterKey: "amountFrom",
    label: "По сумме",
    inputType: "number",
    placeholder: "от, ₽",
    ariaLabel: "Минимальная сумма отклика",
  },
  {
    filterKey: "urgencyDays",
    label: "По срочности",
    inputType: "number",
    placeholder: "до, дней",
    ariaLabel: "Максимальный срок выполнения в днях",
  },
];

const RESPONSE_STATUS_LABELS: Record<string, string> = {
  pending: "На рассмотрении",
  accepted: "Принят",
  rejected: "Отклонён",
  withdrawn: "Отозван",
};

interface ResponseFilters {
  dateFrom: string;
  amountFrom: string;
  urgencyDays: string;
  searchQuery: string;
}

const EMPTY_FILTERS: ResponseFilters = {
  dateFrom: "",
  amountFrom: "",
  urgencyDays: "",
  searchQuery: "",
};

function parseDeadlineDays(value: string): number {
  const match = value.match(/(\d+)/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

function sortResponsesByDate(items: Response[]): Response[] {
  return [...items].sort((left, right) => right.validUntil.localeCompare(left.validUntil));
}

function applyResponseFilters(
  items: Response[],
  requests: Request[],
  filters: ResponseFilters
): Response[] {
  const requestMap = Object.fromEntries(requests.map((request) => [request.id, request]));
  let result = items;

  if (filters.dateFrom) {
    result = result.filter((response) => response.validUntil >= filters.dateFrom);
  }

  if (filters.amountFrom.trim()) {
    const minAmount = Number(filters.amountFrom);
    if (!Number.isNaN(minAmount)) {
      result = result.filter((response) => response.price >= minAmount);
    }
  }

  if (filters.urgencyDays.trim()) {
    const maxDays = Number(filters.urgencyDays);
    if (!Number.isNaN(maxDays)) {
      result = result.filter((response) => parseDeadlineDays(response.deadline) <= maxDays);
    }
  }

  const normalizedQuery = filters.searchQuery.trim().toLowerCase();
  if (!normalizedQuery) {
    return result;
  }

  return result.filter((response) => {
    const request = requestMap[response.requestId];
    const haystack = [
      request?.title,
      request?.city,
      request?.category,
      response.deadline,
      response.terms,
      response.approach,
      response.comment,
      RESPONSE_STATUS_LABELS[response.status],
      formatPrice(response.price),
      String(response.price),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

function hasActiveFilters(filters: ResponseFilters): boolean {
  return Boolean(
    filters.dateFrom ||
      filters.amountFrom.trim() ||
      filters.urgencyDays.trim() ||
      filters.searchQuery.trim()
  );
}

interface Props {
  user: CompanyProfile | null | undefined;
  responses: Response[];
  requests: Request[];
  onBrowseRequests: () => void;
}

export function ContractorMyResponsesSection({
  user,
  responses,
  requests,
  onBrowseRequests,
}: Props) {
  const [filters, setFilters] = useState<ResponseFilters>(EMPTY_FILTERS);

  const myResponses = useMemo(
    () => responses.filter((response) => isResponseForUser(response, user)),
    [responses, user]
  );

  const visibleResponses = useMemo(() => {
    const filtered = applyResponseFilters(myResponses, requests, filters);
    return sortResponsesByDate(filtered);
  }, [myResponses, requests, filters]);

  const updateFilter = (key: keyof ResponseFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  if (myResponses.length === 0) {
    return (
      <EmptyState
        title="Откликов пока нет"
        description="Откликнитесь на доступные заявки, чтобы получить заказы"
        actionLabel="Доступные заявки"
        onAction={onBrowseRequests}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
          {FILTER_FIELDS.map((field) => (
            <Input
              key={field.filterKey}
              type={field.inputType}
              label={field.label}
              value={filters[field.filterKey]}
              onChange={(event) => updateFilter(field.filterKey, event.target.value)}
              placeholder={field.placeholder}
              aria-label={field.ariaLabel}
              min={field.inputType === "number" ? 0 : undefined}
            />
          ))}
        </div>

        <div className="w-full xl:w-64">
          <Input
            label="Поиск"
            value={filters.searchQuery}
            onChange={(event) => updateFilter("searchQuery", event.target.value)}
            placeholder="поиск"
            aria-label="Поиск по откликам"
          />
        </div>
      </div>

      {visibleResponses.length === 0 ? (
        <EmptyState
          title="Ничего не найдено"
          description="Измените фильтры или сбросьте их"
          actionLabel="Сбросить фильтры"
          onAction={() => setFilters(EMPTY_FILTERS)}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {visibleResponses.map((response) => {
            const request = requests.find((item) => item.id === response.requestId);

            return (
              <Link
                key={response.id}
                href={`/requests/${response.requestId}/respond`}
                className="block"
              >
                <Card hoverable className="cabinet-card">
                  <div className="flex justify-between items-start gap-3 flex-wrap">
                    <div>
                      <CardTitle>{request?.title ??"Заявка"}</CardTitle>
                      <CardDescription>
                        {formatPrice(response.price)} · {response.deadline} · Статус:{" "}
                        {RESPONSE_STATUS_LABELS[response.status] ?? response.status}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      {RESPONSE_STATUS_LABELS[response.status] ?? response.status}
                    </Badge>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {hasActiveFilters(filters) && visibleResponses.length > 0 && (
        <button
          type="button"
          onClick={() => setFilters(EMPTY_FILTERS)}
          className="text-sm text-gray-600 underline underline-offset-4 hover:text-gray-900"
        >
          Сбросить фильтры
        </button>
      )}
    </div>
  );
}