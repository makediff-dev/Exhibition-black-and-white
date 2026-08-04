"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, LogIn, Menu, MessageSquare, Search, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store";
import { Drawer } from "@/components/ui/drawer";
import { AccountSwitcher } from "@/components/layout/account-switcher";

const NAV_LINKS = [
  { href: "/events", label: "Выставки и мероприятия" },
  { href: "/contractors", label: "Исполнители" },
  { href: "/services", label: "Услуги" },
  { href: "/how-it-works", label: "Как работает сервис" },
];

export function PublicHeader() {
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/events?q=${encodeURIComponent(search)}`);
    }
  };

  return (
    <header className="border-b border-gray-300 bg-white sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4">
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

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs ml-auto">
            <div className="relative w-full">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск..."
                className="w-full border border-gray-300 pl-8 pr-3 py-1.5 text-sm focus:border-gray-900 focus:outline-none"
              />
            </div>
          </form>

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
          <form onSubmit={(e) => { handleSearch(e); setMobileOpen(false); }} className="mt-2">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск..." />
          </form>
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
