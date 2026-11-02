"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/lib/store";
import { loginHref, registerHref } from "@/lib/auth/session";
import { Drawer } from "@/components/ui/drawer";
import { AccountSwitcher } from "@/components/layout/account-switcher";
import { CityLocationButton } from "@/components/layout/city-location-button";
import { CompanyPickerSheet } from "@/components/layout/company-picker-sheet";
import { HeaderSearch } from "@/components/layout/header-search";
import { NotificationsPopover } from "@/components/layout/notifications-popover";
import { cn } from "@/lib/utils/cn";
import styles from "./public-header.module.css";

const CATALOG_NAV_LINKS = [
  { href: "/events", label: "Выставки и мероприятия" },
  { href: "/contractors", label: "Исполнители" },
  { href: "/services", label: "Услуги" },
  { href: "/venues", label: "Площадки" },
];

const MOBILE_NAV_LINKS = [...CATALOG_NAV_LINKS, { href: "/how-it-works", label: "Как это работает" }];

function isActiveNavLink(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [companySheetOpen, setCompanySheetOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const desktopNavLinks = isAuthenticated ? CATALOG_NAV_LINKS : MOBILE_NAV_LINKS;
  const cabinetHref = user?.role ? `/account/${user.role}` : "/login";

  const closeMenu = () => setMobileOpen(false);
  const openCompanySheet = () => {
    setMobileOpen(false);
    setCompanySheetOpen(true);
  };

  return (
    <header className={cn(styles.header, isAuthenticated ? styles.headerAuth : styles.headerGuest)}>
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
            {desktopNavLinks.map((link) => {
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
              <div className={styles.authActions}>
                <Link href="/requests/new" className={styles.placeOrderButton}>
                  Разместить заказ
                </Link>
                <AccountSwitcher
                  triggerLabel="Личный кабинет"
                  triggerClassName={styles.cabinetButton}
                />
              </div>
            ) : (
              <div className={styles.guestActions}>
                <Link href={loginHref(pathname)} className={styles.loginOutlineButton}>
                  Войти
                </Link>
                <Link href="/requests/new" className={styles.placeOrderButton}>
                  Разместить заказ
                </Link>
              </div>
            )}
          </div>

          {!isAuthenticated ? (
            <div className={styles.guestMobileBar}>
              <HeaderSearch compact className={styles.guestMobileSearch} />
              <Link href={loginHref(pathname)} className={styles.loginOutlineButton}>
                Войти
              </Link>
            </div>
          ) : (
            <div className={styles.authMobileBar}>
              <HeaderSearch compact className={styles.guestMobileSearch} />
              <AccountSwitcher variant="avatar" onOpenSheet={() => setCompanySheetOpen(true)} />
            </div>
          )}

          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setMobileOpen(true)}
            aria-label="Меню"
          >
            <span className={styles.menuIcon} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      <Drawer
        open={mobileOpen}
        onClose={closeMenu}
        title="Меню"
        side="right"
        fullScreen
        closeLabel="Закрыть меню"
        bodyClassName={styles.drawerBody}
        footerClassName={styles.drawerFooterWrap}
        footer={
          <div className={styles.drawerFooter}>
            {isAuthenticated ? (
              <>
                <AccountSwitcher variant="card" onOpenSheet={openCompanySheet} />
                <Link href="/requests/new" className={styles.menuPrimaryButton} onClick={closeMenu}>
                  Разместить заказ
                </Link>
                <Link href={cabinetHref} className={styles.menuOutlineButton} onClick={closeMenu}>
                  Личный кабинет
                </Link>
              </>
            ) : (
              <>
                <Link href={registerHref()} className={styles.menuPrimaryButton} onClick={closeMenu}>
                  Зарегистрироваться
                </Link>
                <Link href={loginHref(pathname)} className={styles.menuOutlineButton} onClick={closeMenu}>
                  Войти
                </Link>
              </>
            )}
          </div>
        }
      >
        <nav className={styles.drawerNav}>
          <HeaderSearch onNavigate={closeMenu} />
          <div className={styles.drawerLinks}>
            {MOBILE_NAV_LINKS.map((link) => {
              const active = isActiveNavLink(pathname, link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(styles.menuLink, active && styles.menuLinkActive)}
                  aria-current={active ? "page" : undefined}
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <CityLocationButton variant="menu" className={styles.menuUtility} />
          {isAuthenticated ? (
            <>
              <NotificationsPopover compactLabel onNavigate={closeMenu} />
              <Link href={cabinetHref} className={styles.menuUtility} onClick={closeMenu}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/home/menu-message.svg" alt="" width={16} height={16} aria-hidden="true" />
                <span>Сообщения</span>
              </Link>
            </>
          ) : null}
        </nav>
      </Drawer>

      <CompanyPickerSheet open={companySheetOpen} onClose={() => setCompanySheetOpen(false)} />
    </header>
  );
}
