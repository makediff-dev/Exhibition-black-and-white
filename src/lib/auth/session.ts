import type { UserRole } from "../../data/types/index.ts";

export const REGISTER_ROLES: Exclude<UserRole, null>[] = [
  "customer",
  "contractor",
  "venue",
  "organizer",
];

export function sanitizeReturnUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  if (value.startsWith("/login") || value.startsWith("/register")) return null;
  return value;
}

export function parseRegisterRole(value: string | null | undefined): UserRole | undefined {
  if (!value) return undefined;
  return REGISTER_ROLES.includes(value as Exclude<UserRole, null>)
    ? (value as UserRole)
    : undefined;
}

export function loginHref(returnUrl?: string | null) {
  const safe = sanitizeReturnUrl(returnUrl);
  return safe ? `/login?returnUrl=${encodeURIComponent(safe)}` : "/login";
}

export function registerHref(role?: UserRole | null, returnUrl?: string | null) {
  const params = new URLSearchParams();
  if (role) params.set("role", role);
  const safe = sanitizeReturnUrl(returnUrl);
  if (safe) params.set("returnUrl", safe);
  const query = params.toString();
  return query ? `/register?${query}` : "/register";
}
