"use client";

import { AppShell } from "@/components/layout/app-shell";
import { BackButton } from "@/components/ui/back-button";
import { Footer } from "@/components/layout/footer";
import { PublicHeader } from "@/components/layout/public-header";
import { useAuthStore } from "@/lib/store";

interface SharedPageLayoutProps {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
  showBack?: boolean;
  backFallbackHref?: string;
}

export function SharedPageLayout({
  children,
  title,
  actions,
  showBack = false,
  backFallbackHref,
}: SharedPageLayoutProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return (
      <AppShell
        title={title}
        actions={actions}
        showBack={showBack}
        backFallbackHref={backFallbackHref}
      >
        {children}
      </AppShell>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        {showBack && (
          <BackButton fallbackHref={backFallbackHref} className="mb-4" />
        )}
        {(title || actions) && (
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            {title && <h1 className="text-xl font-bold text-gray-900">{title}</h1>}
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
          </div>
        )}
        {children}
      </main>
      <Footer />
    </div>
  );
}
