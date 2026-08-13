"use client";

import { cn } from "@/lib/utils/cn";
import { Upload } from "lucide-react";
import { useState } from "react";

export function FileUpload({
  label = "Прикрепить файл",
  onUpload,
  accept,
}: {
  label?: string;
  onUpload?: (fileName: string) => void;
  accept?: string;
}) {
  const [files, setFiles] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles((prev) => [...prev, file.name]);
      onUpload?.(file.name);
    }
  };

  return (
    <div>
      <label className="inline-flex items-center gap-2 border border-dashed border-gray-400 px-4 py-3 cursor-pointer hover:border-gray-900 text-sm">
        <Upload className="h-4 w-4" />
        {label}
        <input type="file" className="hidden" onChange={handleChange} accept={accept} />
      </label>
      {files.length > 0 && (
        <ul className="mt-2 space-y-1">
          {files.map((f) => (
            <li key={f} className="text-xs text-gray-600 flex items-center gap-1">
              <span className="border border-gray-300 px-1">📄</span> {f}
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
                "flex h-7 w-7 items-center justify-center text-xs font-medium border shrink-0",
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
