"use client";

import { useAccountTheme } from "@/components/account/account-theme-provider";
import { useCatalogAccent } from "@/components/catalog/catalog-accent-provider";
import { cn } from "@/lib/utils/cn";
import { type ButtonHTMLAttributes, forwardRef } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "teal-outline"
  | "soft-outline"
  | "ghost"
  | "teal"
  | "blue"
  | "green"
  | "purple"
  | "violet"
  | "pink";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const catalogAccent = useCatalogAccent();
    const accountTheme = useAccountTheme();
    const resolvedVariant =
      variant === "primary" && catalogAccent
        ? catalogAccent.buttonVariant
        : accountTheme && variant === "primary"
          ? accountTheme.buttonVariant
          : variant;

    const outlineClass = catalogAccent
      ? "bg-white text-[var(--catalog-accent)] hover:bg-[var(--catalog-accent-soft)] border border-[var(--catalog-accent)]"
      : accountTheme
        ? "bg-white text-[var(--account-accent)] hover:bg-[var(--account-accent-soft)] border border-[var(--account-accent)]"
        : "bg-white text-gray-900 hover:bg-gray-50 border border-gray-900";

    const variants: Record<ButtonVariant, string> = {
      primary: "bg-gray-900 text-white hover:bg-gray-800 border border-gray-900",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300",
      outline: outlineClass,
      "teal-outline": "bg-white text-[#28b5b3] hover:bg-[#eaf8f7] border border-[#28b5b3]",
      "soft-outline": "bg-white text-[#101828] hover:text-[#171717] border border-[#d4d4d4] hover:border-[#171717]",
      ghost: "bg-transparent text-gray-900 hover:bg-gray-100 border-0",
      teal: "bg-[#28b5b3] text-white hover:bg-[#1f9696] border border-[#28b5b3]",
      blue: "bg-[#2939eb] text-white hover:bg-[#2230c7] border border-[#2939eb]",
      green: "bg-[#00b23d] text-white hover:bg-[#009a35] border border-[#00b23d]",
      purple: "bg-[#0AAEE4] text-white hover:bg-[#0893C2] border border-[#0AAEE4]",
      violet: "bg-[#683BD9] text-white hover:bg-[#5730C0] border border-[#683BD9]",
      pink: "bg-[#ff0096] text-white hover:bg-[#e00086] border border-[#ff0096]",
    };
    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };
    return (
      <button
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-2 whitespace-nowrap rounded-button font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
          variants[resolvedVariant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";