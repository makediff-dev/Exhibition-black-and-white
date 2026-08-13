"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, LogIn, Menu, MessageSquare, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store";
import { Drawer } from "@/components/ui/drawer";
import { AccountSwitcher } from "@/components/layout/account-switcher";
import { HeaderSearch } from "@/components/layout/header-search";

const NAV_LINKS = [
  { href: "/events", label: "Выставки и мероприятия" },
  { href: "/contractors", label: "Исполнители" },
  { href: "/services", label: "Услуги" },
  { href: "/how-it-works", label: "Как работает сервис" },
];

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  return (
    <header className="border-b border-gray-300 bg-white sticky top-0 z-40">
      <div className="mx-auto max-w-site px-4">
        <div className="flex h-14 items-center gap-4">
          <Link href="/" className="font-bold text-sm shrink-0 border border-gray-900 px-2 py-1">
            ЭКСПО
          </Link>

          <nav className="hidden lg:flex items-center gap-4">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                {link.label}
              </Link>
            ))}
          </nav>

          <HeaderSearch className="hidden md:flex flex-1 max-w-xs ml-auto" />

          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link href="/notifications" className="p-2 hover:bg-gray-100 relative" aria-label="Уведомления">
                  <Bell className="h-4 w-4" />
                </Link>
                <Link href="/messages" className="p-2 hover:bg-gray-100" aria-label="Сообщения">
                  <MessageSquare className="h-4 w-4" />
                </Link>
                <Link href="/requests/new">
                  <Button size="sm">Разместить заявку</Button>
                </Link>
                <AccountSwitcher />
              </>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost" size="sm"><LogIn className="h-4 w-4" />Вход</Button></Link>
                <Link href="/register"><Button size="sm"><UserPlus className="h-4 w-4" />Регистрация</Button></Link>
              </>
            )}
          </div>

          <button className="lg:hidden p-2 ml-auto" onClick={() => setMobileOpen(true)} aria-label="Меню">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} title="Меню" side="right">
        <nav className="flex flex-col gap-2">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm py-2 border-b border-gray-200" onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}
          <HeaderSearch
            className="mt-2"
            onNavigate={() => setMobileOpen(false)}
          />
          <div className="flex flex-col gap-2 mt-4">
            {isAuthenticated ? (
              <>
                <Link href="/notifications" onClick={() => setMobileOpen(false)}>Уведомления</Link>
                <Link href="/messages" onClick={() => setMobileOpen(false)}>Сообщения</Link>
                <AccountSwitcher fullWidth onNavigate={() => setMobileOpen(false)} />
                <Link href="/requests/new" onClick={() => setMobileOpen(false)}><Button className="w-full">Разместить заявку</Button></Link>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}><Button variant="outline" className="w-full">Вход</Button></Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}><Button className="w-full">Регистрация</Button></Link>
              </>
            )}
          </div>
        </nav>
      </Drawer>
    </header>
  );
}
