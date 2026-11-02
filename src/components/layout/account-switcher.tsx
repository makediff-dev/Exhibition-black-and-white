"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronsUpDown, ChevronDown, LogOut, Plus } from "lucide-react";
import { ROLE_LABELS } from "@/constants/statuses";
import { getAccountRoleTheme } from "@/constants/account-role-themes";
import { addCompanyHref } from "@/lib/auth/session";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils/cn";
import { companyInitials } from "@/lib/utils/company-initials";
import styles from "./account-switcher.module.css";

interface Props {
  className?: string;
  onNavigate?: () => void;
  fullWidth?: boolean;
  triggerLabel?: string;
  triggerClassName?: string;
  variant?: "button" | "card" | "avatar";
  onOpenSheet?: () => void;
}

export function AccountSwitcher({
  className,
  onNavigate,
  fullWidth = false,
  triggerLabel = "Личный кабинет",
  triggerClassName,
  variant = "button",
  onOpenSheet,
}: Props) {
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

  const openCabinet = (accountId: string) => {
    const nextUser = switchAccount(accountId);
    setOpen(false);
    onNavigate?.();
    const target = nextUser ?? accounts.find((account) => account.id === accountId) ?? user;
    if (target?.role) {
      router.push(`/account/${target.role}`);
    }
  };

  const handleTrigger = () => {
    if (onOpenSheet) {
      onOpenSheet();
      return;
    }

    setOpen((value) => !value);
  };

  const companyLabel = user.displayName ?? user.name;
  const roleLabel = user.role ? ROLE_LABELS[user.role] : "Кабинет";
  const theme = getAccountRoleTheme(user.role ?? null);
  const initials = companyInitials(companyLabel);

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
        onClick={handleTrigger}
        className={cn(
          variant === "card" && styles.cardTrigger,
          variant === "avatar" && styles.avatarTrigger,
          variant === "button" && styles.trigger,
          variant === "button" && fullWidth && "w-full",
          triggerClassName,
        )}
        aria-expanded={onOpenSheet ? undefined : open}
        aria-haspopup={onOpenSheet ? undefined : "listbox"}
        aria-label={variant === "button" ? triggerLabel : companyLabel}
      >
        {variant === "card" ? (
          <>
            <span className={styles.avatar} style={theme ? { background: theme.accent } : undefined}>
              {initials}
            </span>
            <span className={styles.cardText}>
              <span className={styles.cardName}>{companyLabel}</span>
              <span className={styles.cardMeta}>
                {roleLabel} · текущий
              </span>
            </span>
            <ChevronsUpDown className={styles.icon} aria-hidden="true" />
          </>
        ) : variant === "avatar" ? (
          <>
            <span className={styles.avatarLg} style={theme ? { background: theme.accent } : undefined}>
              {initials}
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/home/menu-chevron.svg" alt="" width={14} height={14} aria-hidden="true" />
          </>
        ) : (
          <>
            <span>{triggerLabel}</span>
            <ChevronDown className={cn(styles.chevron, open && styles.chevronOpen)} aria-hidden="true" />
          </>
        )}
      </button>

      {open ? (
        <div
          className={cn(styles.menu, fullWidth && "left-0 right-0 w-full")}
          role="listbox"
          aria-label="Выберите организацию"
        >
          <p className={styles.caption}>Выберите организацию</p>
          {accounts.map((account) => {
            const isActive = account.id === user.id;
            const roleLabel = account.role ? ROLE_LABELS[account.role] : "Кабинет";

            return (
              <button
                key={account.id}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => openCabinet(account.id)}
                className={cn(styles.account, isActive && styles.accountActive)}
              >
                <p className={styles.accountName}>{account.name}</p>
                <p className={styles.accountMeta}>
                  {roleLabel}
                  {isActive ? " · текущий" : ""}
                </p>
              </button>
            );
          })}
          <Link href={addCompanyHref()} className={styles.action} onClick={() => {
            setOpen(false);
            onNavigate?.();
          }}>
            <Plus className={styles.icon} aria-hidden="true" />
            Добавить компанию
          </Link>
          <button type="button" onClick={handleLogout} className={styles.action}>
            <LogOut className={styles.icon} aria-hidden="true" />
            Выйти из аккаунта
          </button>
        </div>
      ) : null}
    </div>
  );
}
