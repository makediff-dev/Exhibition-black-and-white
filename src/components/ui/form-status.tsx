interface Props {
  dirty: boolean;
  saved: boolean;
}

export function FormStatus({ dirty, saved }: Props) {
  if (dirty) {
    return (
      <p className="text-xs text-gray-700" role="status">
        Есть несохранённые изменения
      </p>
    );
  }
  if (saved) {
    return (
      <p className="text-xs text-gray-600" role="status">
        Сохранено
      </p>
    );
  }
  return null;
}

export function FormErrorSummary({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;
  return (
    <div className="rounded-button border border-gray-900 bg-gray-50 p-3 text-sm" role="alert">
      <p className="font-medium mb-1">Исправьте ошибки в форме</p>
      <ul className="list-disc pl-5 space-y-1 text-gray-700">
        {errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </div>
  );
}
