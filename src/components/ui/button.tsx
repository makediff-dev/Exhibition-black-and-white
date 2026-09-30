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

    const outlineClass =
      catalogAccent || accountTheme
        ? "bg-white !text-[#171717] hover:bg-gray-50 border border-[#dddddd] hover:border-[#171717]"
        : "bg-white text-gray-900 hover:bg-gray-50 border border-gray-900";

    const variants: Record<ButtonVariant, string> = {
      primary: "bg-gray-900 text-white hover:bg-gray-800 border border-gray-900",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300",
      outline: outlineClass,
      "teal-outline": "bg-white text-[#28b5b3] hover:bg-[#eaf8f7] border border-[#28b5b3]",
      "soft-outline": "bg-white text-[#101828] hover:text-[#171717] border border-[#dddddd] hover:border-[#171717]",
      ghost: "bg-transparent text-gray-900 hover:bg-gray-100 border-0",
      teal: "bg-[var(--role-customer)] text-white hover:bg-[var(--role-customer-hover)] border border-[var(--role-customer)]",
      blue: "bg-[var(--role-organizer)] text-white hover:bg-[var(--role-organizer-hover)] border border-[var(--role-organizer)]",
      green: "bg-[var(--platform-accent)] text-white hover:bg-[var(--platform-accent-hover)] border border-[var(--platform-accent)]",
      purple: "bg-[var(--role-contractor)] text-white hover:bg-[var(--role-contractor-hover)] border border-[var(--role-contractor)]",
      violet: "bg-[var(--role-venue)] text-white hover:bg-[var(--role-venue-hover)] border border-[var(--role-venue)]",
      pink: "bg-[var(--role-venue)] text-white hover:bg-[var(--role-venue-hover)] border border-[var(--role-venue)]",
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
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-button font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
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