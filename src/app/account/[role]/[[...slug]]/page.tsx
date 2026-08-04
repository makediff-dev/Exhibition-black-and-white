"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { AccountPageRenderer } from "@/components/account/account-page-renderer";
import type { UserRole } from "@/data/types";

const VALID_ROLES: UserRole[] = ["customer", "contractor", "venue", "organizer"];

export default function AccountPage({
  params,
}: {
  params: Promise<{ role: string; slug?: string[] }>;
}) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [resolved, setResolved] = useState<{ role: string; slug: string } | null>(null);

  useEffect(() => {
    params.then((p) => {
      const role = p.role;
      const slug = p.slug?.join("/") || "";
      if (!VALID_ROLES.includes(role as UserRole)) {
        router.push("/");
        return;
      }
      setResolved({ role, slug });
    });
  }, [params, router]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (resolved?.role === "customer" && resolved.slug === "requests") {
      router.replace("/requests");
    }
  }, [resolved, router]);

  useEffect(() => {
    if (user && resolved && user.role !== resolved.role) {
      const slugPath = resolved.slug ? `/${resolved.slug}` : "";
      router.replace(`/account/${user.role}${slugPath}`);
    }
  }, [user, resolved, router]);

  if (!resolved || !user) {
    return <div className="p-8 text-center text-sm text-gray-500">Загрузка...</div>;
  }

  return (
    <AppShell>
      <AccountPageRenderer role={resolved.role as UserRole} slug={resolved.slug} />
    </AppShell>
  );
}
