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
    accent: "#2939eb",
    accentHover: "#2230c7",
    accentSoft: "#eef0fe",
    accentBorder: "#2939eb",
    buttonVariant: "blue",
  },
  contractor: {
    accent: "#683BD9",
    accentHover: "#5730C0",
    accentSoft: "#f3effc",
    accentBorder: "#683BD9",
    buttonVariant: "violet",
  },
  venue: {
    accent: "#ff0096",
    accentHover: "#e00086",
    accentSoft: "#fff0f8",
    accentBorder: "#ff0096",
    buttonVariant: "pink",
  },
  organizer: {
    accent: "#0AAEE4",
    accentHover: "#0893C2",
    accentSoft: "#e8f7fd",
    accentBorder: "#0AAEE4",
    buttonVariant: "purple",
  },
};

export function getAccountRoleTheme(role: UserRole): AccountRoleTheme | null {
  if (!role) return null;
  return ACCOUNT_ROLE_THEMES[role];
}
