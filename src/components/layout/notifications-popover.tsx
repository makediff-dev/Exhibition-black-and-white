"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { getAccountRoleTheme } from "@/constants/account-role-themes";
import type { Notification } from "@/data/types";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { formatDate } from "@/lib/utils/formatters";
import { resolveNotificationHref } from "@/lib/utils/notification-links";
import { isNotificationForUser } from "@/lib/utils/cabinet-scope";
import { cn } from "@/lib/utils/cn";
import styles from "./notifications-popover.module.css";

interface NotificationsPopoverProps {
  onNavigate?: () => void;
  compactLabel?: boolean;
}

export function NotificationsPopover({
  onNavigate,
  compactLabel = false,
}: NotificationsPopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const role = useAuthStore((state) => state.user?.role);
  const deals = usePrototypeStore((state) => state.deals);
  const { notifications, markNotificationRead, markAllNotificationsRead } = usePrototypeStore();

  const visibleNotifications = useMemo(
    () => notifications.filter((item) => isNotificationForUser(item, role)),
    [notifications, role],
  );

  const unreadCount = visibleNotifications.filter((item) => !item.read).length;
  const roleTheme = getAccountRoleTheme(role ?? null);
  const panelStyle = roleTheme
    ? ({ "--notification-accent": roleTheme.accent } as CSSProperties)
    : undefined;

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleMarkRead = (notification: Notification) => {
    if (!notification.read) {
      markNotificationRead(notification.id);
    }
  };

  const closeAndNavigate = () => {
    setOpen(false);
    onNavigate?.();
  };

  return (
    <div className={cn(styles.root, compactLabel && styles.rootDrawer)} ref={rootRef}>
      <button
        type="button"
        className={cn(styles.trigger, compactLabel && styles.triggerLabeled)}
        aria-label="Уведомления"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((current) => !current)}
      >
        <Bell className="h-4 w-4" />
        {compactLabel ? <span>Уведомления</span> : null}
        {unreadCount > 0 ? (
          <span className={styles.badge}>{unreadCount > 9 ? "9+" : unreadCount}</span>
        ) : null}
      </button>

      {open ? (
        <div className={styles.panel} role="dialog" aria-label="Уведомления" style={panelStyle}>
          <div className={styles.header}>
            <p className={styles.title}>Уведомления</p>
            {unreadCount > 0 ? (
              <button type="button" className={styles.markAll} onClick={markAllNotificationsRead}>
                <CheckCheck className="h-3.5 w-3.5" />
                Прочитать все
              </button>
            ) : null}
          </div>

          <div className={styles.list}>
            {visibleNotifications.length === 0 ? (
              <p className={styles.empty}>Новых уведомлений нет</p>
            ) : (
              visibleNotifications.map((notification) => {
                const href = resolveNotificationHref(notification, role, deals);
                const content = (
                  <>
                    <p className={styles.itemTitle}>{notification.title}</p>
                    <p className={styles.itemMessage}>{notification.message}</p>
                    <p className={styles.itemDate}>{formatDate(notification.date)}</p>
                  </>
                );

                return (
                  <article
                    key={notification.id}
                    className={cn(
                      styles.item,
                      !notification.read && styles.itemUnread,
                      href && styles.itemClickable,
                    )}
                  >
                    {href ? (
                      <Link
                        href={href}
                        className={styles.itemBody}
                        onClick={() => {
                          handleMarkRead(notification);
                          closeAndNavigate();
                        }}
                      >
                        {content}
                      </Link>
                    ) : (
                      <div className={styles.itemBody}>{content}</div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
