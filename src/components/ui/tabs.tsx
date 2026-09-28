"use client";

import { useAccountTheme } from "@/components/account/account-theme-provider";
import styles from "@/components/account/account-cabinet.module.css";
import { cn } from "@/lib/utils/cn";
import { useEffect, useRef } from "react";
import tabStyles from "./tabs.module.css";

interface TabsProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: "underline" | "pills";
}

export function Tabs({ tabs, activeTab, onChange, className, variant = "underline" }: TabsProps) {
  const accountTheme = useAccountTheme();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const active = list.querySelector<HTMLElement>('[data-tab-active="true"]');
    active?.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "smooth" });
  }, [activeTab]);

  const moveByKeyboard = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const index = tabs.findIndex((tab) => tab.id === activeTab);
    const nextIndex =
      event.key === "ArrowRight"
        ? (index + 1) % tabs.length
        : (index - 1 + tabs.length) % tabs.length;
    onChange(tabs[nextIndex].id);
  };

  if (variant === "pills") {
    return (
      <div className={cn(tabStyles.pillsWrap, className)}>
      <div className={tabStyles.pills} ref={listRef} role="tablist" onKeyDown={moveByKeyboard}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              data-tab-active={isActive ? "true" : undefined}
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
      </div>
    );
  }

  return (
    <div className={cn(tabStyles.underlineWrap, className)}>
      <div
        ref={listRef}
        className={tabStyles.underline}
        role="tablist"
        onKeyDown={moveByKeyboard}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => onChange(tab.id)}
            data-tab-active={activeTab === tab.id ? "true" : undefined}
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
    </div>
  );
}
