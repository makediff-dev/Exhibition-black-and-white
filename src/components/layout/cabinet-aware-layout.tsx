"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { BackButton } from "@/components/ui/back-button";
import { Footer } from "@/components/layout/footer";
import { PublicHeader } from "@/components/layout/public-header";
import { CatalogAccentProvider } from "@/components/catalog/catalog-accent-provider";
import { catalogAccentFromPathname } from "@/constants/catalog-section-styles";
import { useCabinetSession } from "@/lib/hooks/use-cabinet-session";
import { cn } from "@/lib/utils/cn";
import { keepsCabinetSidebar } from "@/lib/utils/message-related-links";
import type { ReactNode } from "react";

interface CabinetAwareLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showBack?: boolean;
  backFallbackHref?: string;
  actions?: ReactNode;
  activeNavSlug?: string;
  constrained?: boolean;
  className?: string;
}

export function CabinetAwareLayout({
  children,
  title,
  description,
  showBack = false,
  backFallbackHref,
  actions,
  activeNavSlug,
  constrained = true,
  className,
}: CabinetAwareLayoutProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { inCabinet, accountRole } = useCabinetSession();
  const from = searchParams.get("from");
  const catalogAccent = catalogAccentFromPathname(pathname);
  const showCabinetSidebar =
    inCabinet &&
    accountRole &&
    keepsCabinetSidebar(from, accountRole);

  const publicContent = catalogAccent ? (
    <CatalogAccentProvider accent={catalogAccent}>{children}</CatalogAccentProvider>
  ) : (
    children
  );

  if (showCabinetSidebar) {
    return (
      <AppShell
        accountRole={accountRole}
        activeNavSlug={activeNavSlug}
        title={title}
        showBack={showBack}
        backFallbackHref={backFallbackHref}
        actions={actions}
      >
        {description ? <p className="text-sm text-gray-600 mb-4 -mt-2">{description}</p> : null}
        <div className={className}>{children}</div>
      </AppShell>
    );
  }

  return (
    <div className="register-accent flex min-h-screen flex-col">
      <PublicHeader />
      <main
        id="main-content"
        className={cn(
          "flex-1 w-full px-4 py-6 md:px-6",
          constrained && "mx-auto max-w-site",
          className,
        )}
      >
        {showBack && <BackButton fallbackHref={backFallbackHref} className="mb-4" />}
        {(title || actions) && (
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              {title ? <h1 className="text-2xl font-bold text-gray-900">{title}</h1> : null}
              {description ? <p className="mt-1 text-sm text-gray-600">{description}</p> : null}
            </div>
            {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
          </div>
        )}
        {publicContent}
      </main>
      <Footer />
    </div>
  );
}