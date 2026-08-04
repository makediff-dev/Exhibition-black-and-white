"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { getNavForRole, isNavItemActive } from "@/constants/nav-menus";
import { useAuthStore } from "@/lib/store";
import { PublicHeader } from "./public-header";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";

export function AppShell({
  children,
  title,
  actions,
  showBack = false,
  backFallbackHref,
}: {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
  showBack?: boolean;
  backFallbackHref?: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const nav = getNavForRole(user?.role || "");

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const renderNavLink = (item: (typeof nav)[number], onNavigate?: () => void) => {
    const isActive = isNavItemActive(pathname, item);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "block px-3 py-2 text-sm rounded-none",
          isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-200"
        )}
      >
        {item.label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <div className="flex flex-1">
        <aside className="hidden lg:flex w-60 shrink-0 border-r border-gray-300 bg-gray-50 flex-col">
          <nav className="p-3 space-y-0.5 overflow-y-auto flex-1">
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
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-gray-900/50" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-72 bg-gray-50 border-r border-gray-300 p-3 overflow-y-auto">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold">Меню</span>
                <button onClick={() => setSidebarOpen(false)}><X className="h-4 w-4" /></button>
              </div>
              <nav className="space-y-0.5">
                {nav.map((item) => renderNavLink(item, () => setSidebarOpen(false)))}
              </nav>
              {user && (
                <div className="mt-4 pt-4 border-t border-gray-300">
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
          <button className="lg:hidden mb-3 flex items-center gap-2 text-sm" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-4 w-4" /> Меню кабинета
          </button>
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
        </main>
      </div>
    </div>
  );
}
