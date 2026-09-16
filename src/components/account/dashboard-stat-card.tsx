"use client";

import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";

export function PaymentInvoicesLabel({
  direction,
  tooltip,
}: {
  direction: string;
  tooltip?: string;
}) {
  return (
    <div className="mt-1">
      <p className="text-sm text-gray-600">Неоплаченные счета</p>
      <div className="flex items-center gap-1">
        <p className="text-sm font-semibold text-gray-900">{direction}</p>
        {tooltip && (
          <Tooltip content={tooltip}>
            <button
              type="button"
              className="shrink-0 text-gray-500 hover:text-gray-900"
              aria-label="Подробнее о неоплаченных исходящих счетах"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

export function DashboardStatCard({
  value,
  label,
  href,
}: {
  value: number | string;
  label: React.ReactNode;
  href?: string;
}) {
  const card = (
    <Card hoverable={Boolean(href)} className={href ? "h-full" : undefined}>
      <CardTitle className="text-2xl">{value}</CardTitle>
      {typeof label === "string" ? <CardDescription>{label}</CardDescription> : label}
    </Card>
  );

  if (!href) return card;

  return (
    <Link href={href} className="block h-full">
      {card}
    </Link>
  );
}

export function DashboardStatsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">{children}</div>
  );
}
