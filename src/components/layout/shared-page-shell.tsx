"use client";

import { AppShell } from "@/components/layout/app-shell";
import { BackButton } from "@/components/ui/back-button";
import { Footer } from "@/components/layout/footer";
import { PublicHeader } from "@/components/layout/public-header";
import type { AccountRole } from "@/constants/account-role-themes";
import { useCabinetSession } from "@/lib/hooks/use-cabinet-session";

interface SharedPageShellProps {
  title: string;
  showBack?: boolean;
  backFallbackHref?: string;
  actions?: React.ReactNode;
  activeNavSlug?: string;
  children: React.ReactNode;
}

export function SharedPageShell({
  title,
  showBack = false,
  backFallbackHref,
  actions,
  activeNavSlug,
  children,
}: SharedPageShellProps) {
  const { inCabinet, accountRole } = useCabinetSession();

  if (inCabinet && accountRole) {
    return (
      <AppShell
        title={title}
        showBack={showBack}
        backFallbackHref={backFallbackHref}
        actions={actions}
        activeNavSlug={activeNavSlug}
        accountRole={accountRole as AccountRole | undefined}
      >
        {children}
      </AppShell>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="mx-auto w-full max-w-site flex-1 px-4 py-6 md:px-6">
        {showBack && (
          <BackButton fallbackHref={backFallbackHref} className="mb-4" />
        )}
        {(title || actions) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
            {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
          </div>
        )}
        {children}
      </main>
      <Footer />
    </div>
  );
}