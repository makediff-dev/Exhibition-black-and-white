"use client";

import { useAccountTheme } from "@/components/account/account-theme-provider";
import styles from "@/components/account/account-cabinet.module.css";
import { cn } from "@/lib/utils/cn";
import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, type, ...props }, ref) => {
    const accountTheme = useAccountTheme();
    const inputId = id || label?.toLowerCase().replace(/\s/g, "-");

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-900">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
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
        {error && <span className="text-xs text-gray-700">{error}</span>}
      </div>
    );
  },
);
Input.displayName = "Input";