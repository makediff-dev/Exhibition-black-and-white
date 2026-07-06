"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Footer } from "@/components/layout/footer";
import { PublicHeader } from "@/components/layout/public-header";
import { useAuthStore } from "@/lib/store";

interface SharedPageShellProps {
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: "default" | "wide" | "full";
}

export function SharedPageShell({
  title,
  breadcrumbs,
  actions,
  children,
  maxWidth = "default",
}: SharedPageShellProps) {
  const { isAuthenticated } = useAuthStore();

  const widthClass =
    maxWidth === "wide"
      ? "max-w-5xl mx-auto w-full"
      : maxWidth === "full"
        ? "w-full"
        : "max-w-4xl mx-auto w-full";

  if (isAuthenticated) {
    return (
      <AppShell title={title} breadcrumbs={breadcrumbs} actions={actions}>
        <div className={widthClass}>{children}</div>
      </AppShell>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1 px-4 py-6 md:px-6">
        <div className={widthClass}>
          {(title || actions) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
              {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
            </div>
          )}
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
