"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Footer } from "@/components/layout/footer";
import { PublicHeader } from "@/components/layout/public-header";
import type { AccountRole } from "@/constants/account-role-themes";
import { useCabinetSession } from "@/lib/hooks/use-cabinet-session";

export default function MessagesLayout({ children }: { children: ReactNode }) {
  const { inCabinet, accountRole } = useCabinetSession();

  if (inCabinet && accountRole) {
    return (
      <AppShell activeNavSlug="messages" accountRole={accountRole as AccountRole}>
        {children}
      </AppShell>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="mx-auto w-full max-w-site flex-1 px-4 py-6 md:px-6">{children}</main>
      <Footer />
    </div>
  );
}
