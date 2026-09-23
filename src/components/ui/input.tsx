"use client";

import { useAccountTheme } from "@/components/account/account-theme-provider";
import { cn } from "@/lib/utils/cn";
import { type InputHTMLAttributes, forwardRef, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  help?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, help, id, type, required, ...props }, ref) => {
    const accountTheme = useAccountTheme();
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const helpId = `${inputId}-help`;
    const describedBy = [error ? errorId : null, help ? helpId : null].filter(Boolean).join(" ") || undefined;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-900">
            {label}
            {required ? <span aria-hidden="true"> *</span> : null}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "border px-3 py-2 text-sm rounded-button",
            accountTheme
              ? "border-[#d4d4d4] focus:border-[var(--account-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--account-accent)]"
              : "border-[#d4d4d4] focus:border-[#171717] focus:outline-none focus:ring-1 focus:ring-[#171717]",
            type === "number" &&
              "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
            error && (accountTheme ? "border-[var(--account-accent)]" : "border-gray-900"),
            className,
          )}
          {...props}
        />
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
Input.displayName = "Input";