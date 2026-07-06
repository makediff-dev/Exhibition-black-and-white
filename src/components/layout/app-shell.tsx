"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ChevronRight } from "lucide-react";
import { getNavForRole } from "@/constants/nav-menus";
import { useAuthStore } from "@/lib/store";
import { PublicHeader } from "./public-header";
import { cn } from "@/lib/utils/cn";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex items-center gap-1 text-xs text-gray-500 mb-2 flex-wrap">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-gray-900">{item.label}</Link>
          ) : (
            <span className="text-gray-900">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function AppShell({
  children,
  title,
  actions,
  breadcrumbs,
}: {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const nav = getNavForRole(user?.role || "");

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-60 shrink-0 border-r border-gray-300 bg-gray-50 flex-col">
          <nav className="p-3 space-y-0.5 overflow-y-auto flex-1">
            {nav.map((item) => {
              const isActive = pathname === item.href || (item.slug && pathname.includes(item.slug));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block px-3 py-2 text-sm rounded-none",
                    isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-gray-900/50" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-72 bg-gray-50 border-r border-gray-300 p-3 overflow-y-auto">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold">Меню</span>
                <button onClick={() => setSidebarOpen(false)}><X className="h-4 w-4" /></button>
              </div>
              <nav className="space-y-0.5">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </aside>
          </div>
        )}

        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <button className="lg:hidden mb-3 flex items-center gap-2 text-sm" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-4 w-4" /> Меню кабинета
          </button>
          {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
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
