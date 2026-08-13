"use client";

import { AppShell } from "@/components/layout/app-shell";
import { BackButton } from "@/components/ui/back-button";
import { Footer } from "@/components/layout/footer";
import { PublicHeader } from "@/components/layout/public-header";
import { useAuthStore } from "@/lib/store";

interface SharedPageShellProps {
  title: string;
  showBack?: boolean;
  backFallbackHref?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function SharedPageShell({
  title,
  showBack = false,
  backFallbackHref,
  actions,
  children,
}: SharedPageShellProps) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return (
      <AppShell
        title={title}
        showBack={showBack}
        backFallbackHref={backFallbackHref}
        actions={actions}
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
