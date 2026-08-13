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
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center py-16 text-center border border-dashed border-gray-300 min-h-[280px]",
        className
      )}
    >
      <FileQuestion className="h-10 w-10 text-gray-400 mb-4" strokeWidth={1.5} />
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {description && <p className="text-sm text-gray-600 mt-2 max-w-md">{description}</p>}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-6">
          <Button>{actionLabel}</Button>
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function LoadingState({ message = "Загрузка..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 text-gray-400 animate-spin mb-3" />
      <p className="text-sm text-gray-600">{message}</p>
    </div>
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
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center border border-gray-900">
      <h3 className="text-base font-medium text-gray-900">{title}</h3>
      {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      {onRetry && <Button className="mt-4" variant="outline" onClick={onRetry}>Повторить</Button>}
    </div>
  );
}
