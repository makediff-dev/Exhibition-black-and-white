"use client";

import React, { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { AccountPageRenderer } from "@/components/account/account-page-renderer";
import { ForbiddenState, LoadingState } from "@/components/ui/states";
import type { AccountRole } from "@/constants/account-role-themes";
import { ROLE_LABELS } from "@/constants/statuses";
import { useAuthHydrated } from "@/lib/hooks/use-auth-hydrated";
import { useAuthStore } from "@/lib/store";
import { canAccessCabinetPath } from "@/lib/auth/authorization";
import { loginHref } from "@/lib/auth/session";

export default function AccountPage({
  params,
}: {
  params: Promise<{ role: string; slug?: string[] }>;
}) {
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const { isAuthenticated, user } = useAuthStore();
  const resolvedParams = use(params);
  const role = resolvedParams.role;
  const slug = resolvedParams.slug?.join("/") || "";

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated || !user) {
      router.replace(loginHref(`/account/${role}${slug ? `/${slug}` : ""}`));
    }
  }, [hydrated, isAuthenticated, user, router, role, slug]);

  useEffect(() => {
    if (user?.role === "customer" && slug === "requests") {
      router.replace("/requests");
    }
  }, [user, slug, router]);

  if (!hydrated) {
    return <LoadingState message="Загрузка кабинета..." />;
  }

  if (!isAuthenticated || !user) {
    return <LoadingState message="Переход к входу..." />;
  }

  const access = canAccessCabinetPath(user, role, slug);
  if (!access.allowed) {
    const homeHref = `/account/${user.role}`;
    return (
      <AppShell accountRole={user.role as AccountRole} title="Нет доступа">
        <ForbiddenState
          title="Раздел недоступен"
          description={access.reason}
          actionLabel={`Перейти в кабинет: ${ROLE_LABELS[user.role as keyof typeof ROLE_LABELS]}`}
          actionHref={homeHref}
        />
      </AppShell>
    );
  }

  return (
    <AppShell accountRole={role as AccountRole}>
      <AccountPageRenderer role={role as AccountRole} slug={slug} />
    </AppShell>
  );
}
