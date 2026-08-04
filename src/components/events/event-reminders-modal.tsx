"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast-provider";
import type { Event } from "@/data/types";
import { useAuthStore } from "@/lib/store";
import { formatShortDate } from "@/lib/utils/formatters";

const REMINDER_OPTIONS = [
  { id: "week_before", label: "За 7 дней до начала" },
  { id: "day_before", label: "За 1 день до начала" },
  { id: "start_day", label: "В день открытия" },
  { id: "registration", label: "Окончание приёма заявок" },
] as const;

type ReminderOptionId = (typeof REMINDER_OPTIONS)[number]["id"];

interface EventRemindersModalProps {
  open: boolean;
  onClose: () => void;
  event: Event;
}

export function EventRemindersModal({ open, onClose, event }: EventRemindersModalProps) {
  const { showToast } = useToast();
  const { isAuthenticated } = useAuthStore();
  const [selected, setSelected] = useState<ReminderOptionId[]>([
    "week_before",
    "day_before",
  ]);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);

  useEffect(() => {
    if (!open) return;
    setSelected(["week_before", "day_before"]);
    setEmailEnabled(true);
    setPushEnabled(true);
  }, [open, event.id]);

  const toggleOption = (id: ReminderOptionId) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const handleSave = () => {
    if (!isAuthenticated) return;
    if (selected.length === 0) {
      showToast("Выберите хотя бы одно напоминание", "info");
      return;
    }
    if (!emailEnabled && !pushEnabled) {
      showToast("Выберите способ уведомления", "info");
      return;
    }

    const channels = [emailEnabled && "email", pushEnabled && "push"].filter(Boolean).join(", ");
    showToast(
      `Напоминания подключены: ${selected.length} событий · ${channels}`,
      "success"
    );
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Напоминания о мероприятии"
      footer={
        isAuthenticated ? (
          <>
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={handleSave}>Подключить</Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={onClose}>
              Закрыть
            </Button>
            <Link href="/login">
              <Button>Войти</Button>
            </Link>
          </>
        )
      }
    >
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-900">{event.title}</p>
          <p className="text-xs text-gray-600 mt-1">
            {event.city} · {formatShortDate(event.startDate)} — {formatShortDate(event.endDate)}
          </p>
        </div>

        {!isAuthenticated ? (
          <p className="text-sm text-gray-600 border border-gray-300 p-3">
            Войдите в аккаунт, чтобы получать напоминания о начале мероприятия и важных сроках.
          </p>
        ) : (
          <>
            <div>
              <p className="text-sm font-medium mb-2">Когда напомнить</p>
              <div className="space-y-2">
                {REMINDER_OPTIONS.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(option.id)}
                      onChange={() => toggleOption(option.id)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Куда отправлять</p>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailEnabled}
                    onChange={(event) => setEmailEnabled(event.target.checked)}
                  />
                  Email
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pushEnabled}
                    onChange={(event) => setPushEnabled(event.target.checked)}
                  />
                  Push-уведомления
                </label>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
