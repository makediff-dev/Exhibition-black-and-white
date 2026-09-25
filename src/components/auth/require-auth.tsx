"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { LoadingState } from "@/components/ui/states";
import { useAuthHydrated } from "@/lib/hooks/use-auth-hydrated";
import { loginHref } from "@/lib/auth/session";
import { useAuthStore } from "@/lib/store";

export function RequireAuth({ children }: { children: ReactNode }) {
  const hydrated = useAuthHydrated();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!hydrated) return;
    if (isAuthenticated && user) return;
    const dest =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}${window.location.hash}`
        : `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    router.replace(loginHref(dest));
  }, [hydrated, isAuthenticated, user, router, pathname, searchParams]);

  if (!hydrated || !isAuthenticated || !user) {
    return <LoadingState message="Переход к входу..." />;
  }

  return <>{children}</>;
}
