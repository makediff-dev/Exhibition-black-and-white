"use client";

import type { CSSProperties } from "react";
import { useCatalogAccent } from "@/components/catalog/catalog-accent-provider";
import { cn } from "@/lib/utils/cn";
import { useCabinetSession } from "@/lib/hooks/use-cabinet-session";
import { roleBadgeStyle } from "@/lib/utils/role-accent";
import type { LucideIcon } from "lucide-react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "solid" | "outline" | "dashed" | "muted";
  icon?: LucideIcon;
  className?: string;
  useRoleAccent?: boolean;
  style?: CSSProperties;
}

export function Badge({
  children,
  variant = "outline",
  icon: Icon,
  className,
  useRoleAccent = true,
  style,
}: BadgeProps) {
  const catalogAccent = useCatalogAccent();
  const { accountRole } = useCabinetSession();
  const roleStyle = useRoleAccent
    ? roleBadgeStyle(accountRole, variant)
    : undefined;

  const variants = {
    solid: catalogAccent
      ? "bg-[var(--catalog-accent)] text-white border-[var(--catalog-accent)]"
      : "bg-[#28b5b3] text-white border-[#28b5b3]",
    outline: catalogAccent
      ? "bg-white text-[var(--catalog-accent)] border-[var(--catalog-accent)]"
      : "bg-white text-[#28b5b3] border-[#28b5b3]",
    dashed: catalogAccent
      ? "bg-[var(--catalog-accent-soft)] text-[var(--catalog-accent)] border-dashed border-[var(--catalog-accent)]"
      : "bg-gray-50 text-gray-700 border-dashed border-gray-500",
    muted: "bg-white text-gray-600 border-gray-300",
  };

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-button border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        roleStyle ? undefined : variants[variant],
        className,
      )}
      style={{ ...roleStyle, ...style }}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
}
