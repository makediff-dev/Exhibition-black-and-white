"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { getNavForRole, isNavItemActive, resolveActiveNavSlug } from "@/constants/nav-menus";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { PublicHeader } from "./public-header";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { AccountThemeProvider } from "@/components/account/account-theme-provider";
import type { AccountRole } from "@/constants/account-role-themes";
import styles from "@/components/account/account-cabinet.module.css";
import shellStyles from "@/components/layout/app-shell.module.css";

export function AppShell({
  children,
  title,
  actions,
  showBack = false,
  backFallbackHref,
  activeNavSlug,
  accountRole,
}: {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
  showBack?: boolean;
  backFallbackHref?: string;
  activeNavSlug?: string;
  accountRole?: AccountRole;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarNavRef = useRef<HTMLElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const showCompanyRegistrationPrompt = useAuthStore((s) => s.showCompanyRegistrationPrompt);
  const setShowCompanyRegistrationPrompt = useAuthStore((s) => s.setShowCompanyRegistrationPrompt);
  const deals = usePrototypeStore((s) => s.deals);
  const nav = getNavForRole(user?.role || "");
  const resolvedAccountRole = accountRole ?? (user?.role as AccountRole | undefined);

  const dealNavSlug = useMemo(() => {
    const match = pathname.match(/^\/deals\/([^/?#]+)/);
    if (!match) return undefined;
    const deal = deals.find((item) => item.id === match[1]);
    if (!deal) return undefined;
    return deal.status === "completed" ? "completed-projects" : "active-projects";
  }, [pathname, deals]);

  const resolvedActiveNavSlug = useMemo(() => {
    if (activeNavSlug != null) return activeNavSlug;
    if (dealNavSlug != null) return dealNavSlug;
    const role = user?.role || "";
    if (!role) return undefined;
    return resolveActiveNavSlug(pathname, role);
  }, [activeNavSlug, dealNavSlug, pathname, user?.role]);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  useLayoutEffect(() => {
    const positionActiveLink = (navElement: HTMLElement | null) => {
      if (!navElement) return;
      const activeLink = navElement.querySelector<HTMLElement>('[data-nav-active="true"]');
      if (!activeLink) return;

      const centeredTop =
        activeLink.offsetTop - (navElement.clientHeight - activeLink.offsetHeight) / 2;
      const maxScrollTop = navElement.scrollHeight - navElement.clientHeight;
      navElement.scrollTop = Math.max(0, Math.min(centeredTop, maxScrollTop));
    };

    positionActiveLink(sidebarNavRef.current);
    if (sidebarOpen) {
      positionActiveLink(mobileNavRef.current);
    }
  }, [resolvedActiveNavSlug, pathname, sidebarOpen, nav.length]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const renderNavLink = (item: (typeof nav)[number], onNavigate?: () => void) => {
    const isActive =
      resolvedActiveNavSlug !== undefined
        ? item.slug === resolvedActiveNavSlug
        : isNavItemActive(pathname, item, user?.role ?? undefined);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        data-nav-active={isActive ? "true" : undefined}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "block w-full py-2 text-sm",
          shellStyles.sidebarNavLink,
          isActive && shellStyles.sidebarNavLinkActive,
          resolvedAccountRole
            ? isActive
              ? styles.accountNavActive
              : styles.accountNavItem
            : isActive
              ? "bg-gray-900 text-white"
              : "text-gray-700 hover:bg-gray-200",
        )}
      >
        {item.label}
      </Link>
    );
  };

  const cabinetBody = (
    <div className={shellStyles.cabinetLayout}>
        <aside
          className={cn(
            "hidden md:flex w-60 shrink-0 border-r border-gray-300 flex-col",
            shellStyles.sidebarSticky,
            resolvedAccountRole ? styles.accountSidebar : "bg-gray-50",
          )}
        >
          <nav ref={sidebarNavRef} className={cn("space-y-0.5", shellStyles.sidebarNav)}>
            {nav.map((item) => renderNavLink(item))}
          </nav>
          {user && (
            <div className="p-3 border-t border-gray-300">
              <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Выйти
              </Button>
            </div>
          )}
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-gray-900/50" onClick={() => setSidebarOpen(false)} />
            <aside
              className={cn(
                "absolute left-0 top-0 h-full w-72 border-r border-gray-300 overflow-y-auto",
                resolvedAccountRole ? styles.accountSidebar : "bg-gray-50",
              )}
            >
              <div className="flex justify-between items-center mb-3 px-3 pt-3">
                <span className="text-sm font-semibold">Меню</span>
                <button onClick={() => setSidebarOpen(false)}><X className="h-4 w-4" /></button>
              </div>
              <nav ref={mobileNavRef} className={cn("space-y-0.5", shellStyles.sidebarNav)}>
                {nav.map((item) => renderNavLink(item, () => setSidebarOpen(false)))}
              </nav>
              {user && (
                <div className="mt-4 pt-4 px-3 pb-3 border-t border-gray-300">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSidebarOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Выйти
                  </Button>
                </div>
              )}
            </aside>
          </div>
        )}

        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <button
            className={cn(
              "md:hidden mb-3 flex items-center gap-2 text-sm",
              resolvedAccountRole && styles.accountMenuButton,
            )}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" /> Меню кабинета
          </button>
          <div className="w-full">
            {showCompanyRegistrationPrompt && (
              <div
                className={cn(
                  "mb-4 border p-4 text-sm rounded-card",
                  resolvedAccountRole ? styles.accountPromptBanner : "border-gray-900 bg-gray-50",
                )}
              >
                <p className="font-semibold mb-1">Зарегистрируйте компанию</p>
                <p className="text-gray-600 mb-3">
                  Вы подтвердили личный аккаунт. Теперь можно зарегистрировать компанию и выбрать
                  роль на платформе. Без регистрации юридического лица многие функции сервиса
                  будут недоступны.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link href="/register">
                    <Button size="sm">Зарегистрировать компанию</Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowCompanyRegistrationPrompt(false)}
                  >
                    Закрыть
                  </Button>
                </div>
              </div>
            )}
            {showBack && (
              <BackButton fallbackHref={backFallbackHref} className="mb-2" />
            )}
            {(title || actions) && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                {title && <h1 className="text-xl font-bold text-gray-900">{title}</h1>}
                {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
              </div>
            )}
            {children}
          </div>
        </main>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      {resolvedAccountRole ? (
        <AccountThemeProvider role={resolvedAccountRole} className="flex-1 w-full">
          {cabinetBody}
        </AccountThemeProvider>
      ) : (
        <div className="flex-1 w-full">{cabinetBody}</div>
      )}
    </div>
  );
}