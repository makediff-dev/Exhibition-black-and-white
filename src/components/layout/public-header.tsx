"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAccountRoleTheme } from "@/constants/account-role-themes";
import { useAuthStore } from "@/lib/store";
import { loginHref } from "@/lib/auth/session";
import { Drawer } from "@/components/ui/drawer";
import { AccountSwitcher } from "@/components/layout/account-switcher";
import { CityLocationButton } from "@/components/layout/city-location-button";
import { HeaderSearch } from "@/components/layout/header-search";
import { NotificationsPopover } from "@/components/layout/notifications-popover";
import { cn } from "@/lib/utils/cn";
import styles from "./public-header.module.css";

const NAV_LINKS = [
  { href: "/events", label: "Выставки и мероприятия" },
  { href: "/contractors", label: "Исполнители" },
  { href: "/services", label: "Услуги" },
  { href: "/venues", label: "Площадки" },
];

function isActiveNavLink(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const requestButtonVariant = getAccountRoleTheme(user?.role ?? null)?.buttonVariant ?? "primary";

  return (
    <header className={styles.header}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-3 focus:py-2">
        Перейти к содержимому
      </a>
      <div className={styles.inner}>
        <div className={styles.row}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoMark}>Э</span>
            <span className={styles.logoText}>ЭКСПО</span>
          </Link>

          <nav className={styles.nav}>
            {NAV_LINKS.map((link) => {
              const active = isActiveNavLink(pathname, link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(styles.navLink, active && styles.navLinkActive)}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className={styles.searchWrap}>
            <HeaderSearch />
          </div>

          <CityLocationButton className={styles.cityButton} />

          <div className={styles.actions}>
            {isAuthenticated ? (
              <>
                <NotificationsPopover />
                <Link href="/messages" className="p-2 hover:bg-gray-100" aria-label="Сообщения">
                  <MessageSquare className="h-4 w-4" />
                </Link>
                {user?.role === "customer" ? (
                  <Link href="/requests/new" className="shrink-0">
                    <Button size="sm" variant={requestButtonVariant} className={styles.requestButton}>
                      Разместить заявку
                    </Button>
                  </Link>
                ) : null}
                <AccountSwitcher />
              </>
            ) : (
              <Link href={loginHref(pathname)} className={styles.loginButton}>
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
          {NAV_LINKS.map((link) => {
            const active = isActiveNavLink(pathname, link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "text-sm py-2 border-b border-gray-200",
                  active && "font-semibold text-[#28b5b3]",
                )}
                aria-current={active ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
          <HeaderSearch className="mt-2" onNavigate={() => setMobileOpen(false)} />
          <CityLocationButton className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm" />
          <div className="flex flex-col gap-2 mt-4">
            {isAuthenticated ? (
              <>
                <NotificationsPopover
                  compactLabel
                  onNavigate={() => setMobileOpen(false)}
                />
                <Link href="/messages" onClick={() => setMobileOpen(false)}>
                  Сообщения
                </Link>
                <AccountSwitcher fullWidth onNavigate={() => setMobileOpen(false)} />
                {user?.role === "customer" ? (
                  <Link href="/requests/new" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full" variant={requestButtonVariant}>
                      Разместить заявку
                    </Button>
                  </Link>
                ) : null}
              </>
            ) : (
              <Link href={loginHref(pathname)} onClick={() => setMobileOpen(false)}>
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