"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import styles from "./ad-badge.module.css";

export const DEFAULT_ADVERTISER = {
  name: "ООО «Рекламодатель»",
  inn: "7700000000",
  erid: "2SDnjeXXXXX",
} as const;

interface AdBadgeProps {
  advertiser?: string;
  inn?: string;
  erid?: string;
  showAdvertiserName?: boolean;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

export function AdBadge({
  advertiser = DEFAULT_ADVERTISER.name,
  inn = DEFAULT_ADVERTISER.inn,
  erid = DEFAULT_ADVERTISER.erid,
  showAdvertiserName = false,
  className,
  onOpenChange,
}: AdBadgeProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const setMenuOpen = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        onOpenChange?.(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onOpenChange]);

  return (
    <div
      ref={rootRef}
      className={cn(styles.root, className)}
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <p className={styles.label}>
        Реклама
        {showAdvertiserName ? <span className={styles.name}>{` · ${advertiser}`}</span> : null}
      </p>
      <button
        type="button"
        className={styles.more}
        aria-label="Сведения о рекламодателе"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setMenuOpen(!open)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/home/promo-ad-more.svg" alt="" width={16} height={16} />
      </button>
      {open ? (
        <div id={menuId} className={styles.menu} role="dialog" aria-label="Сведения о рекламодателе">
          <p className={styles.menuCaption}>Рекламодатель</p>
          <p className={styles.menuName}>{advertiser}</p>
          <p className={styles.menuMeta}>{`ИНН ${inn}`}</p>
          <p className={styles.menuMeta}>{`erid: ${erid}`}</p>
        </div>
      ) : null}
    </div>
  );
}
