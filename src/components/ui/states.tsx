import { FileQuestion, Loader2 } from "lucide-react";
import { Button } from "./button";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-gray-300">
      <FileQuestion className="h-10 w-10 text-gray-400 mb-3" />
      <h3 className="text-base font-medium text-gray-900">{title}</h3>
      {description && <p className="text-sm text-gray-600 mt-1 max-w-sm">{description}</p>}
      {actionLabel && onAction && (
        <Button className="mt-4" onClick={onAction}>{actionLabel}</Button>
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
