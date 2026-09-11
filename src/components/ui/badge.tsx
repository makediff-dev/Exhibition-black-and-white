"use client";

import { useAccountTheme } from "@/components/account/account-theme-provider";
import { useCatalogAccent } from "@/components/catalog/catalog-accent-provider";
import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "solid" | "outline" | "dashed";
  icon?: LucideIcon;
  className?: string;
}

export function Badge({ children, variant = "outline", icon: Icon, className }: BadgeProps) {
  const catalogAccent = useCatalogAccent();
  const accountTheme = useAccountTheme();

  const variants = {
    solid: catalogAccent
      ? "bg-[var(--catalog-accent)] text-white border-[var(--catalog-accent)]"
      : accountTheme
        ? "bg-[var(--account-accent)] text-white border-[var(--account-accent)]"
        : "bg-[#28b5b3] text-white border-[#28b5b3]",
    outline: catalogAccent
      ? "bg-white text-[var(--catalog-accent)] border-[var(--catalog-accent)]"
      : accountTheme
        ? "bg-white text-[var(--account-accent)] border-[var(--account-accent)]"
        : "bg-white text-[#28b5b3] border-[#28b5b3]",
    dashed: catalogAccent
      ? "bg-[var(--catalog-accent-soft)] text-[var(--catalog-accent)] border-dashed border-[var(--catalog-accent)]"
      : "bg-gray-50 text-gray-700 border-dashed border-gray-500",
  };

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-button border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        variants[variant],
        className,
      )}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
}
