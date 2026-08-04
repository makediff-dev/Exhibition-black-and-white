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
import { usePrototypeStore } from "@/lib/store";
import { formatDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

const PRIORITY_LABELS: Record<NotificationPriority, string> = {
  action_required: "Требует действия",
  deadline: "Срок приближается",
  info: "Информация",
};

const PRIORITY_VARIANT: Record<NotificationPriority, "solid" | "outline" | "dashed"> = {
  action_required: "solid",
  deadline: "dashed",
  info: "outline",
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
  const { notifications, markNotificationRead, markAllNotificationsRead } = usePrototypeStore();
  const [categoryFilter, setCategoryFilter] = useState("");

  const categories = useMemo(() => {
    const set = new Set(notifications.map((n) => n.category));
    return Array.from(set);
  }, [notifications]);

  const filtered = useMemo(() => {
    if (!categoryFilter) return notifications;
    return notifications.filter((n) => n.category === categoryFilter);
  }, [notifications, categoryFilter]);

  const unreadCount = notifications.filter((n) => !n.read).length;

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
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
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
          className="sm:max-w-xs"
        />
        <p className="text-sm text-gray-600 flex items-center gap-1">
          <Bell className="h-4 w-4" />
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
          {filtered.map((notification) => (
            <Card
              key={notification.id}
              className={cn(
                "transition-colors",
                !notification.read && "border-gray-900 bg-gray-50"
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge variant={PRIORITY_VARIANT[notification.priority]}>
                      {PRIORITY_LABELS[notification.priority]}
                    </Badge>
                    <Badge variant="outline">
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

                <div className="flex flex-wrap gap-2 shrink-0">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkRead(notification)}
                    >
                      Прочитано
                    </Button>
                  )}
                  {notification.link && (
                    <Link href={notification.link} onClick={() => handleMarkRead(notification)}>
                      <Button variant="outline" size="sm">
                        Перейти
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </SharedPageShell>
  );
}
