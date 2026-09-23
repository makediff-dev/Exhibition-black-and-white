"use client";

import { useAccountTheme } from "@/components/account/account-theme-provider";
import { cn } from "@/lib/utils/cn";
import { ChevronDown } from "lucide-react";
import { type SelectHTMLAttributes, forwardRef, useId } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  help?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, help, options, id, required, ...props }, ref) => {
    const accountTheme = useAccountTheme();
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const errorId = `${selectId}-error`;
    const helpId = `${selectId}-help`;
    const describedBy = [error ? errorId : null, help ? helpId : null].filter(Boolean).join(" ") || undefined;

    return (
      <div className={cn("flex flex-col gap-1", className)}>
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-gray-900">
            {label}
            {required ? <span aria-hidden="true"> *</span> : null}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            required={required}
            aria-required={required || undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              "w-full appearance-none rounded-button border bg-white py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1",
              accountTheme
                ? "border-[#d4d4d4] focus:border-[var(--account-accent)] focus:ring-[var(--account-accent)]"
                : "border-[#d4d4d4] focus:border-[#171717] focus:ring-[#171717]",
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-500" />
        </div>
        {help && !error && (
          <span id={helpId} className="text-xs text-gray-600">
            {help}
          </span>
        )}
        {error && (
          <span id={errorId} className="text-xs text-gray-700">
            {error}
          </span>
        )}
      </div>
    );
  },
);
Select.displayName = "Select";