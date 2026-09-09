"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, Menu, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAccountRoleTheme } from "@/constants/account-role-themes";
import { useAuthStore } from "@/lib/store";
import { Drawer } from "@/components/ui/drawer";
import { AccountSwitcher } from "@/components/layout/account-switcher";
import { HeaderSearch } from "@/components/layout/header-search";
import styles from "./public-header.module.css";

const NAV_LINKS = [
  { href: "/events", label: "Выставки и мероприятия" },
  { href: "/contractors", label: "Исполнители" },
  { href: "/services", label: "Услуги" },
  { href: "/venues", label: "Площадки" },
];

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const requestButtonVariant = getAccountRoleTheme(user?.role ?? null)?.buttonVariant ?? "primary";

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.row}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoMark}>Э</span>
            <span className={styles.logoText}>ЭКСПО</span>
          </Link>

          <nav className={styles.nav}>
            {NAV_LINKS.map((link) => (
              <Link key={link.label} href={link.href} className={styles.navLink}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className={styles.searchWrap}>
            <HeaderSearch />
          </div>

          <div className={styles.actions}>
            {isAuthenticated ? (
              <>
                <Link href="/notifications" className="p-2 hover:bg-gray-100 relative" aria-label="Уведомления">
                  <Bell className="h-4 w-4" />
                </Link>
                <Link href="/messages" className="p-2 hover:bg-gray-100" aria-label="Сообщения">
                  <MessageSquare className="h-4 w-4" />
                </Link>
                <Link href="/requests/new" className="shrink-0">
                  <Button size="sm" variant={requestButtonVariant} className={styles.requestButton}>
                    Разместить заявку
                  </Button>
                </Link>
                <AccountSwitcher />
              </>
            ) : (
              <Link href="/login" className={styles.loginButton}>
                Вход
              </Link>
            )}
          </div>

          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setMobileOpen(true)}
            aria-label="Меню"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} title="Меню" side="right">
        <nav className="flex flex-col gap-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm py-2 border-b border-gray-200"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <HeaderSearch className="mt-2" onNavigate={() => setMobileOpen(false)} />
          <div className="flex flex-col gap-2 mt-4">
            {isAuthenticated ? (
              <>
                <Link href="/notifications" onClick={() => setMobileOpen(false)}>
                  Уведомления
                </Link>
                <Link href="/messages" onClick={() => setMobileOpen(false)}>
                  Сообщения
                </Link>
                <AccountSwitcher fullWidth onNavigate={() => setMobileOpen(false)} />
                <Link href="/requests/new" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full" variant={requestButtonVariant}>
                    Разместить заявку
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full">
                  Вход
                </Button>
              </Link>
            )}
          </div>
        </nav>
      </Drawer>
    </header>
  );
}