"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { SharedPageShell } from "@/components/layout/shared-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { Select } from "@/components/ui/select";
import type { Notification, NotificationPriority } from "@/data/types";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { formatDate } from "@/lib/utils/formatters";
import { resolveNotificationHref } from "@/lib/utils/notification-links";
import { isNotificationForUser } from "@/lib/utils/cabinet-scope";
import { cn } from "@/lib/utils/cn";

const PRIORITY_LABELS: Record<NotificationPriority, string> = {
  action_required: "Требует действия",
  deadline: "Срок приближается",
  info: "Информация",
};

const PRIORITY_VARIANT: Record<NotificationPriority, "solid" | "muted"> = {
  action_required: "solid",
  deadline: "solid",
  info: "muted",
};

const CATEGORY_LABELS: Record<string, string> = {
  responses: "Отклики",
  deals: "Сделки",
  documents: "Документы",
  system: "Система",
  payments: "Оплаты",
  messages: "Сообщения",
};

export default function NotificationsPage() {
  const role = useAuthStore((state) => state.user?.role);
  const deals = usePrototypeStore((state) => state.deals);
  const { notifications, markNotificationRead, markAllNotificationsRead } = usePrototypeStore();
  const [categoryFilter, setCategoryFilter] = useState("");

  const visibleNotifications = useMemo(
    () => notifications.filter((item) => isNotificationForUser(item, role)),
    [notifications, role]
  );

  const categories = useMemo(() => {
    const set = new Set(visibleNotifications.map((n) => n.category));
    return Array.from(set);
  }, [visibleNotifications]);

  const filtered = useMemo(() => {
    if (!categoryFilter) return visibleNotifications;
    return visibleNotifications.filter((n) => n.category === categoryFilter);
  }, [visibleNotifications, categoryFilter]);

  const unreadCount = visibleNotifications.filter((n) => !n.read).length;

  const handleMarkRead = (notification: Notification) => {
    if (!notification.read) {
      markNotificationRead(notification.id);
    }
  };

  return (
    <SharedPageShell
      title="Уведомления"
      actions={
        unreadCount > 0 ? (
          <Button variant="outline" size="sm" onClick={markAllNotificationsRead}>
            <CheckCheck className="h-4 w-4" />
            Прочитать все ({unreadCount})
          </Button>
        ) : undefined
      }
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
        <Select
          label="Категория"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          options={[
            { value: "", label: "Все категории" },
            ...categories.map((c) => ({
              value: c,
              label: CATEGORY_LABELS[c] || c,
            })),
          ]}
          className="sm:max-w-xs w-full"
        />
        <p className="text-sm text-gray-600 flex items-center gap-1 sm:mt-6 sm:h-9">
          <Bell className="h-4 w-4 shrink-0" />
          Всего: {filtered.length}
          {unreadCount > 0 && ` · Непрочитанных: ${unreadCount}`}
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Нет уведомлений"
          description="Здесь будут появляться важные события по вашим заявкам и сделкам"
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((notification) => {
            const href = resolveNotificationHref(notification, role, deals);

            return (
              <Card
                key={notification.id}
                className={cn(
                  "transition-colors",
                  href && "hover:bg-gray-50",
                  !notification.read && "border-gray-900 bg-gray-50"
                )}
              >
                {href ? (
                  <Link
                    href={href}
                    className="block text-inherit no-underline"
                    onClick={() => handleMarkRead(notification)}
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge variant={PRIORITY_VARIANT[notification.priority]}>
                        {PRIORITY_LABELS[notification.priority]}
                      </Badge>
                      <Badge variant="muted">
                        {CATEGORY_LABELS[notification.category] || notification.category}
                      </Badge>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-gray-900 shrink-0" aria-hidden />
                      )}
                    </div>
                    <p className="text-sm font-semibold">{notification.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{formatDate(notification.date)}</p>
                  </Link>
                ) : (
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge variant={PRIORITY_VARIANT[notification.priority]}>
                        {PRIORITY_LABELS[notification.priority]}
                      </Badge>
                      <Badge variant="muted">
                        {CATEGORY_LABELS[notification.category] || notification.category}
                      </Badge>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-gray-900 shrink-0" aria-hidden />
                      )}
                    </div>
                    <p className="text-sm font-semibold">{notification.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{formatDate(notification.date)}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </SharedPageShell>
  );
}