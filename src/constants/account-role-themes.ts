import type { ButtonVariant } from "@/components/ui/button";
import type { UserRole } from "@/data/types";

export interface AccountRoleTheme {
  accent: string;
  accentHover: string;
  accentSoft: string;
  accentBorder: string;
  buttonVariant: ButtonVariant;
}

export type AccountRole = Exclude<UserRole, null>;

export const ACCOUNT_ROLE_THEMES: Record<AccountRole, AccountRoleTheme> = {
  customer: {
    accent: "var(--role-customer)",
    accentHover: "var(--role-customer-hover)",
    accentSoft: "var(--role-customer-soft)",
    accentBorder: "var(--role-customer)",
    buttonVariant: "teal",
  },
  contractor: {
    accent: "var(--role-contractor)",
    accentHover: "var(--role-contractor-hover)",
    accentSoft: "var(--role-contractor-soft)",
    accentBorder: "var(--role-contractor)",
    buttonVariant: "purple",
  },
  organizer: {
    accent: "var(--role-organizer)",
    accentHover: "var(--role-organizer-hover)",
    accentSoft: "var(--role-organizer-soft)",
    accentBorder: "var(--role-organizer)",
    buttonVariant: "blue",
  },
  venue: {
    accent: "var(--role-venue)",
    accentHover: "var(--role-venue-hover)",
    accentSoft: "var(--role-venue-soft)",
    accentBorder: "var(--role-venue)",
    buttonVariant: "violet",
  },
};

export function getAccountRoleTheme(role: UserRole): AccountRoleTheme | null {
  if (!role) return null;
  return ACCOUNT_ROLE_THEMES[role];
}
