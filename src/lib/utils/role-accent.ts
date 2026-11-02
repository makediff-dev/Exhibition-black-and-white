import type { CSSProperties } from "react";
import { getAccountRoleTheme } from "@/constants/account-role-themes";
import type { UserRole } from "@/data/types";

export function roleAccentToken(role: UserRole | undefined): string | null {
  return getAccountRoleTheme(role ?? null)?.accent ?? null;
}

export function roleStarStyle(role: UserRole | undefined): CSSProperties | undefined {
  const accent = roleAccentToken(role);
  if (!accent) return undefined;
  return { color: accent, fill: accent };
}

export function roleBadgeStyle(
  role: UserRole | undefined,
  variant: "solid" | "outline" | "dashed" | "muted",
): CSSProperties | undefined {
  const accent = roleAccentToken(role);
  if (!accent || variant === "muted") return undefined;
  if (variant === "solid") {
    return { backgroundColor: accent, borderColor: accent, color: "#fff" };
  }
  if (variant === "outline") {
    return { backgroundColor: "#fff", borderColor: accent, color: accent };
  }
  return { backgroundColor: "transparent", borderColor: accent, color: accent };
}
