"use client";

import type { AccountRole } from "@/constants/account-role-themes";
import { useAuthStore } from "@/lib/store";
import { useAuthHydrated } from "@/lib/hooks/use-auth-hydrated";

export function useCabinetSession() {
  const hydrated = useAuthHydrated();
  const user = useAuthStore((s) => s.user);
  const accountRole = user?.role as AccountRole | undefined;
  const inCabinet = hydrated && Boolean(accountRole);

  return { hydrated, inCabinet, user, accountRole };
}
