"use client";

import { useAccountTheme } from "@/components/account/account-theme-provider";
import { cn } from "@/lib/utils/cn";
import { Upload, X } from "lucide-react";
import { useId, useRef, useState } from "react";

const DEFAULT_ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp,.zip";
const DEFAULT_MAX_MB = 10;

export function FileUpload({
  label = "Прикрепить файл",
  onUpload,
  onRemove,
  files,
  accept = DEFAULT_ACCEPT,
  maxSizeMb = DEFAULT_MAX_MB,
  fullWidth = false,
  name,
}: {
  label?: string;
  onUpload?: (fileName: string) => void;
  onRemove?: (fileName: string) => void;
  files?: string[];
  accept?: string;
  maxSizeMb?: number;
  fullWidth?: boolean;
  name?: string;
}) {
  const accountTheme = useAccountTheme();
  const generatedId = useId();
  const inputId = `file-upload-${generatedId}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalFiles, setInternalFiles] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const visibleFiles = files ?? internalFiles;

  const applyFile = (file: File) => {
    const allowed = accept
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
    const fileName = file.name.toLowerCase();
    const matchesType =
      allowed.length === 0 ||
      allowed.some((rule) =>
        rule.startsWith(".") ? fileName.endsWith(rule) : file.type.includes(rule.replace("*", ""))
      );
    if (!matchesType) {
      setStatus("error");
      setError(`Формат не подходит. Допустимо: ${accept}`);
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      setStatus("error");
      setError(`Файл больше ${maxSizeMb} МБ`);
      return;
    }

    setStatus("uploading");
    setError(null);
    window.setTimeout(() => {
      setInternalFiles((prev) => (files ? prev : [...prev, file.name]));
      onUpload?.(file.name);
      setStatus("idle");
    }, 250);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) applyFile(file);
  };

  const handleRemove = (fileName: string) => {
    if (files) {
      onRemove?.(fileName);
      return;
    }
    setInternalFiles((prev) => prev.filter((item) => item !== fileName));
    onRemove?.(fileName);
  };

  return (
    <div className={fullWidth ? "w-full" : undefined}>
      <div
        className={cn(
          "relative border border-dashed px-4 py-3 text-sm rounded-button focus-within:ring-2 focus-within:ring-gray-900",
          fullWidth ? "w-full" : "inline-flex",
          accountTheme
            ? "border-gray-400 hover:border-[var(--account-accent)] text-gray-700"
            : "border-gray-400 hover:border-gray-900",
        )}
      >
        <label htmlFor={inputId} className="flex w-full cursor-pointer items-center gap-2">
          <Upload className="h-4 w-4" aria-hidden="true" />
          <span>{status === "uploading" ? "Загрузка…" : label}</span>
        </label>
        <input
          ref={inputRef}
          id={inputId}
          name={name ?? inputId}
          type="file"
          accept={accept}
          className="absolute h-px w-px overflow-hidden opacity-0"
          aria-label={label}
          onChange={handleChange}
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">
        До {maxSizeMb} МБ. Форматы: {accept}
      </p>
      {error ? (
        <div className="mt-2 flex items-center gap-2 text-xs text-red-700">
          <span>{error}</span>
          <button
            type="button"
            className="underline"
            onClick={() => {
              setError(null);
              setStatus("idle");
              inputRef.current?.click();
            }}
          >
            Повторить
          </button>
        </div>
      ) : null}
      {visibleFiles.length > 0 && (
        <ul className="mt-2 space-y-1">
          {visibleFiles.map((fileName) => (
            <li key={fileName} className="text-xs text-gray-600 flex items-center gap-2">
              <span className="border border-gray-300 px-1 rounded-button">файл</span>
              <span>{fileName}</span>
              <button
                type="button"
                className="inline-flex items-center gap-1 underline"
                onClick={() => handleRemove(fileName)}
                aria-label={`Удалить файл ${fileName}`}
              >
                <X className="h-3 w-3" aria-hidden="true" />
                Удалить
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function StepIndicator({
  steps,
  currentStep,
  centered = false,
  wide = false,
}: {
  steps: string[];
  currentStep: number;
  centered?: boolean;
  wide?: boolean;
}) {
  return (
    <div className={cn("pb-2", centered && "text-center")}>
      <p className="text-xs text-gray-600 mb-2 sm:hidden">
        Шаг {currentStep + 1} из {steps.length}: {steps[currentStep]}
      </p>
      <div
        className={cn(
          "flex items-center gap-x-2 gap-y-2",
          wide ? "w-full" : "flex-wrap",
          centered && !wide && "justify-center",
        )}
      >
        {steps.map((step, i) => (
          <div
            key={step}
            className={cn("flex items-center gap-2 shrink-0", wide && "flex-1 last:flex-none")}
          >
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center text-xs font-medium border shrink-0 rounded-button",
                i < currentStep ? "bg-gray-900 text-white border-gray-900" :
                i === currentStep ? "border-gray-900 text-gray-900" :
                "border-gray-300 text-gray-400"
              )}
            >
              {i + 1}
            </div>
            <span className={cn("text-xs hidden sm:inline", wide ? "whitespace-nowrap" : "truncate", i <= currentStep ? "text-gray-900" : "text-gray-400")}>
              {step}
            </span>
            {i < steps.length - 1 && (
              <div className={cn("hidden sm:block h-px bg-gray-300", wide ? "flex-1 min-w-4" : "w-4 shrink-0")} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
