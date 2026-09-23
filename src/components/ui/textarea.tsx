"use client";

import { useAccountTheme } from "@/components/account/account-theme-provider";
import { cn } from "@/lib/utils/cn";
import { type TextareaHTMLAttributes, forwardRef, useId } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  help?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, help, id, required, ...props }, ref) => {
    const accountTheme = useAccountTheme();
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const errorId = `${textareaId}-error`;
    const helpId = `${textareaId}-help`;
    const describedBy = [error ? errorId : null, help ? helpId : null].filter(Boolean).join(" ") || undefined;

    return (
      <div className={cn("flex flex-col gap-1", className)}>
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-gray-900">
            {label}
            {required ? <span aria-hidden="true"> *</span> : null}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "border border-gray-300 px-3 py-2 text-sm min-h-[100px] resize-y rounded-button focus:outline-none focus:ring-1",
            accountTheme
              ? "focus:border-[var(--account-accent)] focus:ring-[var(--account-accent)]"
              : "focus:border-gray-900 focus:ring-gray-900",
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
Textarea.displayName = "Textarea";