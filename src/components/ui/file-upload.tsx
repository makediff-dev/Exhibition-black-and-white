"use client";

import { useAccountTheme } from "@/components/account/account-theme-provider";
import { cn } from "@/lib/utils/cn";
import { Upload } from "lucide-react";
import { useState } from "react";

export function FileUpload({
  label = "Прикрепить файл",
  onUpload,
  accept,
  fullWidth = false,
}: {
  label?: string;
  onUpload?: (fileName: string) => void;
  accept?: string;
  fullWidth?: boolean;
}) {
  const accountTheme = useAccountTheme();
  const [files, setFiles] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles((prev) => [...prev, file.name]);
      onUpload?.(file.name);
    }
  };

  return (
    <div className={fullWidth ? "w-full" : undefined}>
      <label
        className={cn(
          "items-center gap-2 border border-dashed px-4 py-3 cursor-pointer text-sm rounded-button",
          fullWidth ? "flex w-full" : "inline-flex",
          accountTheme
            ? "border-gray-400 hover:border-[var(--account-accent)] text-gray-700"
            : "border-gray-400 hover:border-gray-900",
        )}
      >
        <Upload className="h-4 w-4" />
        {label}
        <input type="file" className="hidden" onChange={handleChange} accept={accept} />
      </label>
      {files.length > 0 && (
        <ul className="mt-2 space-y-1">
          {files.map((f) => (
            <li key={f} className="text-xs text-gray-600 flex items-center gap-1">
              <span className="border border-gray-300 px-1 rounded-[4px]">📄</span> {f}
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
            className={cn("flex items-center gap-2 shrink-0", wide && "flex-1 min-w-0 last:flex-none")}
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
            <span className={cn("text-xs hidden sm:inline truncate", i <= currentStep ? "text-gray-900" : "text-gray-400")}>
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