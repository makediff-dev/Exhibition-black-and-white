"use client";

import { createContext, useContext, useMemo, type CSSProperties, type ReactNode } from "react";
import { getAccountRoleTheme, type AccountRole, type AccountRoleTheme } from "@/constants/account-role-themes";
import styles from "./account-cabinet.module.css";
import { cn } from "@/lib/utils/cn";

const AccountThemeContext = createContext<AccountRoleTheme | null>(null);

export function useAccountTheme() {
  return useContext(AccountThemeContext);
}

interface AccountThemeProviderProps {
  role: AccountRole;
  children: ReactNode;
  className?: string;
  tokensOnly?: boolean;
}

export function AccountThemeProvider({
  role,
  children,
  className,
  tokensOnly = false,
}: AccountThemeProviderProps) {
  const theme = useMemo(() => getAccountRoleTheme(role)!, [role]);

  const style = {
    "--account-accent": theme.accent,
    "--account-accent-hover": theme.accentHover,
    "--account-accent-soft": theme.accentSoft,
    "--account-accent-border": theme.accentBorder,
    "--radius-card": "14px",
    "--radius-button": "10px",
  } as CSSProperties;

  return (
    <AccountThemeContext.Provider value={theme}>
      {tokensOnly ? (
        <div className={className} style={style}>
          {children}
        </div>
      ) : (
        <div
          data-account-role={role}
          className={cn(styles.accountCabinet, className)}
          style={style}
        >
          {children}
        </div>
      )}
    </AccountThemeContext.Provider>
  );
}