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
  | "pink"
  | "cta"
  | "ctaGhost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const catalogAccent = useCatalogAccent();
    const accountTheme = useAccountTheme();
    const resolvedVariant =
      variant === "primary" && accountTheme
        ? accountTheme.buttonVariant
        : variant === "primary" && catalogAccent
          ? catalogAccent.buttonVariant
          : variant;

    const outlineClass =
      catalogAccent || accountTheme
        ? "bg-white !text-[#171717] hover:bg-[var(--interactive-hover-fill)] border border-[var(--interactive-border)] hover:border-[var(--interactive-border-hover)]"
        : "bg-white text-gray-900 hover:bg-[var(--interactive-hover-fill)] border border-gray-900";

    const variants: Record<ButtonVariant, string> = {
      primary: "bg-gray-900 text-white hover:bg-gray-800 border border-gray-900",
      secondary:
        "bg-white text-[#171717] hover:bg-[var(--interactive-hover-fill)] border border-[var(--interactive-border)] hover:border-[var(--interactive-border-hover)]",
      outline: outlineClass,
      "teal-outline": "bg-white text-[#28b5b3] hover:bg-[#eaf8f7] border border-[#28b5b3]",
      "soft-outline":
        "bg-white text-[#101828] hover:bg-[var(--interactive-hover-fill)] hover:text-[#171717] border border-[var(--interactive-border)] hover:border-[var(--interactive-border-hover)]",
      ghost: "bg-transparent text-gray-900 hover:bg-gray-100 border-0",
      teal: "bg-[var(--role-customer)] text-white hover:bg-[var(--role-customer-hover)] border border-[var(--role-customer)] hover:border-[var(--role-customer-hover)]",
      blue: "bg-[var(--role-organizer)] text-white hover:bg-[var(--role-organizer-hover)] border border-[var(--role-organizer)] hover:border-[var(--role-organizer-hover)]",
      green: "bg-[var(--platform-accent)] text-white hover:bg-[var(--platform-accent-hover)] border border-[var(--platform-accent)] hover:border-[var(--platform-accent-hover)]",
      purple: "bg-[var(--role-contractor)] text-white hover:bg-[var(--role-contractor-hover)] border border-[var(--role-contractor)] hover:border-[var(--role-contractor-hover)]",
      violet: "bg-[var(--role-venue)] text-white hover:bg-[var(--role-venue-hover)] border border-[var(--role-venue)] hover:border-[var(--role-venue-hover)]",
      pink: "bg-[var(--role-venue)] text-white hover:bg-[var(--role-venue-hover)] border border-[var(--role-venue)] hover:border-[var(--role-venue-hover)]",
      cta: "bg-white text-[#101828] font-semibold hover:opacity-[0.92] border-0",
      ctaGhost: "bg-transparent text-white border-[1.5px] border-[rgba(255,255,255,0.85)] hover:bg-[rgba(255,255,255,0.16)]",
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