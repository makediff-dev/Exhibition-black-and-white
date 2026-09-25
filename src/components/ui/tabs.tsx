"use client";

import { useAccountTheme } from "@/components/account/account-theme-provider";
import styles from "@/components/account/account-cabinet.module.css";
import { cn } from "@/lib/utils/cn";

interface TabsProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: "underline" | "pills";
}

export function Tabs({ tabs, activeTab, onChange, className, variant = "underline" }: TabsProps) {
  const accountTheme = useAccountTheme();

  if (variant === "pills") {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                isActive
                  ? accountTheme
                    ? "border-[var(--account-accent)] bg-[var(--account-accent)] text-white"
                    : "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-900",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("flex w-full border-b border-gray-300 overflow-x-auto", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
            activeTab === tab.id
              ? accountTheme
                ? styles.accountTabActive
                : "border-gray-900 text-gray-900"
              : "border-transparent text-gray-500 hover:text-gray-700",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}