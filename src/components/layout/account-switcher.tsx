"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";
import { ROLE_LABELS } from "@/constants/statuses";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils/cn";
import styles from "./account-switcher.module.css";

interface Props {
  className?: string;
  onNavigate?: () => void;
  fullWidth?: boolean;
}

export function AccountSwitcher({ className, onNavigate, fullWidth = false }: Props) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const accessibleAccounts = useAuthStore((state) => state.accessibleAccounts);
  const switchAccount = useAuthStore((state) => state.switchAccount);
  const logout = useAuthStore((state) => state.logout);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const accounts = accessibleAccounts.length > 0 ? accessibleAccounts : [user];

  const handleSelect = (accountId: string) => {
    const nextUser = switchAccount(accountId);
    setOpen(false);
    onNavigate?.();
    const target = nextUser ?? accounts.find((account) => account.id === accountId);
    if (target?.role) {
      router.push(`/account/${target.role}`);
    }
  };

  const handleLogout = () => {
    setOpen(false);
    logout();
    onNavigate?.();
    router.replace("/login");
  };

  return (
    <div ref={rootRef} className={cn("relative min-w-0", fullWidth && "w-full", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          styles.trigger,
          "inline-flex w-auto max-w-[180px] items-center justify-between gap-2 whitespace-nowrap border border-gray-900 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50",
          fullWidth && "w-full max-w-none"
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Текущая организация: ${user.name}`}
      >
        <span className="min-w-0 flex-1 truncate text-left">{user.name}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          className={cn(
            styles.menu,
            "absolute right-0 top-full z-50 mt-1 w-max max-w-[min(280px,calc(100vw-32px))] overflow-hidden border border-gray-300 bg-white shadow-sm",
            fullWidth && "left-0 right-0 min-w-0"
          )}
          role="listbox"
        >
          {accounts.length > 1 && (
            <p className="px-3 py-2 text-xs text-gray-500 border-b border-gray-200">
              Переключить организацию
            </p>
          )}
          {accounts.map((account) => {
            const isActive = account.id === user.id;

            return (
              <button
                key={account.id}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => handleSelect(account.id)}
                className={cn(
                  "w-full px-3 py-[10px] text-left border-b border-gray-100 last:border-b-0 hover:bg-gray-50",
                  isActive && "bg-gray-100"
                )}
              >
                <p className="text-sm font-medium">{account.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {account.role ? ROLE_LABELS[account.role] : "Кабинет"}
                  {isActive ? " · текущий" : ""}
                </p>
              </button>
            );
          })}
          <div className="border-t border-gray-200">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-3 py-[10px] text-left text-sm hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Выйти из аккаунта
            </button>
          </div>
        </div>
      )}
    </div>
  );
}