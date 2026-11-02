"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Plus } from "lucide-react";
import { ROLE_LABELS } from "@/constants/statuses";
import { getAccountRoleTheme } from "@/constants/account-role-themes";
import { addCompanyHref } from "@/lib/auth/session";
import { useAuthStore } from "@/lib/store";
import { Drawer } from "@/components/ui/drawer";
import { cn } from "@/lib/utils/cn";
import { companyInitials } from "@/lib/utils/company-initials";
import styles from "./company-picker-sheet.module.css";

interface CompanyPickerSheetProps {
  open: boolean;
  onClose: () => void;
}

export function CompanyPickerSheet({ open, onClose }: CompanyPickerSheetProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const accessibleAccounts = useAuthStore((state) => state.accessibleAccounts);
  const switchAccount = useAuthStore((state) => state.switchAccount);
  const logout = useAuthStore((state) => state.logout);

  if (!user) return null;

  const accounts = accessibleAccounts.length > 0 ? accessibleAccounts : [user];

  const selectAccount = (accountId: string) => {
    switchAccount(accountId);
    onClose();
  };

  const handleLogout = () => {
    onClose();
    logout();
    router.replace("/login");
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Выберите организацию"
      side="bottom"
      hideChrome
      bodyClassName={styles.body}
    >
      <div className={styles.handle} aria-hidden="true" />
      <h2 className={styles.title}>Выберите организацию</h2>
      <div className={styles.list} role="listbox" aria-label="Выберите организацию">
        {accounts.map((account) => {
          const isActive = account.id === user.id;
          const roleLabel = account.role ? ROLE_LABELS[account.role] : "Кабинет";
          const theme = getAccountRoleTheme(account.role ?? null);
          const label = account.displayName ?? account.name;

          return (
            <button
              key={account.id}
              type="button"
              role="option"
              aria-selected={isActive}
              className={cn(styles.account, isActive && styles.accountActive)}
              onClick={() => selectAccount(account.id)}
            >
              <span
                className={styles.avatar}
                style={theme ? { background: theme.accent } : undefined}
              >
                {companyInitials(label)}
              </span>
              <span className={styles.accountText}>
                <span className={styles.accountName}>{label}</span>
                <span className={styles.accountMeta}>
                  {roleLabel}
                  {isActive ? " · текущий" : ""}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <Link href={addCompanyHref()} className={styles.action} onClick={onClose}>
        <Plus className={styles.icon} aria-hidden="true" />
        Добавить компанию
      </Link>
      <button type="button" className={styles.action} onClick={handleLogout}>
        <LogOut className={styles.icon} aria-hidden="true" />
        Выйти из аккаунта
      </button>
    </Drawer>
  );
}
