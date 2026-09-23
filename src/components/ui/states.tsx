"use client";

import { useAccountTheme } from "@/components/account/account-theme-provider";
import { useCatalogAccent } from "@/components/catalog/catalog-accent-provider";
import styles from "@/components/account/account-cabinet.module.css";
import { FileQuestion, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "./button";
import { cn } from "@/lib/utils/cn";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}) {
  const accountTheme = useAccountTheme();
  const catalogAccent = useCatalogAccent();
  const actionVariant = catalogAccent
    ? catalogAccent.buttonVariant
    : accountTheme
      ? "primary"
      : "teal";

  return (
    <div
      className={cn(
        "flex w-full min-h-[280px] flex-col items-center justify-center border border-dashed py-16 text-center",
        catalogAccent
          ? "rounded-[14px] border-[var(--catalog-accent)]/40"
          : accountTheme
            ? cn("rounded-card", styles.accountEmptyState)
            : "rounded-[14px] border-[#28b5b3]/40",
        className,
      )}
    >
      <FileQuestion
        className={cn(
          "mb-4 h-10 w-10",
          catalogAccent
            ? "text-[var(--catalog-accent)]"
            : accountTheme
              ? "text-gray-400"
              : "text-[#28b5b3]",
        )}
        strokeWidth={1.5}
      />
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-gray-600">{description}</p>}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-6">
          <Button variant={actionVariant}>{actionLabel}</Button>
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <Button className="mt-6" variant={actionVariant} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function LoadingState({ message = "Загрузка..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="mb-3 h-8 w-8 animate-spin text-gray-400" />
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );
}

export function ForbiddenState({
  title = "Нет доступа",
  description,
  actionLabel = "На главную",
  actionHref = "/",
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      actionLabel={actionLabel}
      actionHref={actionHref}
    />
  );
}

export function ErrorState({
  title = "Произошла ошибка",
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  const accountTheme = useAccountTheme();

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center border py-12 text-center",
        accountTheme
          ? cn("rounded-card", styles.accountErrorState)
          : "rounded-[14px] border-gray-900",
      )}
    >
      <h3 className="text-base font-medium text-gray-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      {onRetry && (
        <Button className="mt-4" variant="outline" onClick={onRetry}>
          Повторить
        </Button>
      )}
    </div>
  );
}