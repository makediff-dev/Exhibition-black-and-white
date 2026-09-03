"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Event } from "@/data/types";

const WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function monthKeyFromDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthYear(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const monthName = new Intl.DateTimeFormat("ru-RU", { month: "long" }).format(new Date(year, month - 1, 1));
  return `${monthName} ${year}`;
}

function getCalendarDays(month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const days: Array<Date | null> = [];

  for (let i = 0; i < startOffset; i += 1) {
    days.push(null);
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push(new Date(year, monthIndex, day));
  }

  return days;
}

function eventOnDay(event: Event, dateKey: string) {
  return event.startDate <= dateKey && event.endDate >= dateKey;
}

function eventInMonth(event: Event, month: string) {
  const monthStart = `${month}-01`;
  const [year, monthNumber] = month.split("-").map(Number);
  const monthEnd = toDateKey(new Date(year, monthNumber, 0));
  return event.startDate <= monthEnd && event.endDate >= monthStart;
}

export function isEventInSelectedPeriod(
  event: Event,
  activeMonthKey: string,
  selectedDays: string[],
) {
  if (selectedDays.length > 0) {
    return selectedDays.some((day) => eventOnDay(event, day));
  }

  return eventInMonth(event, activeMonthKey);
}

interface EventsDateFilterProps {
  events: Event[];
  viewYear: number;
  viewMonth: number;
  onShiftViewMonth: (delta: number) => void;
  selectedDays: string[];
  onToggleDay: (dateKey: string) => void;
  onClearPeriod: () => void;
}

export function EventsDateFilter({
  events,
  viewYear,
  viewMonth,
  onShiftViewMonth,
  selectedDays,
  onToggleDay,
  onClearPeriod,
}: EventsDateFilterProps) {
  const currentMonthDate = useMemo(() => new Date(viewYear, viewMonth, 1), [viewYear, viewMonth]);
  const days = useMemo(() => getCalendarDays(currentMonthDate), [currentMonthDate]);
  const activeMonthKey = monthKeyFromDate(currentMonthDate);

  const eventDays = useMemo(() => {
    const set = new Set<string>();
    events.forEach((event) => {
      const start = new Date(`${event.startDate}T00:00:00`);
      const end = new Date(`${event.endDate}T00:00:00`);

      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        if (date.getMonth() === viewMonth && date.getFullYear() === viewYear) {
          set.add(toDateKey(date));
        }
      }
    });
    return set;
  }, [events, viewMonth, viewYear]);

  return (
    <div className="space-y-3">
      {selectedDays.length > 0 && (
        <div className="flex justify-end">
          <button type="button" onClick={onClearPeriod} className="text-xs underline">
            Сбросить
          </button>
        </div>
      )}

      <div className="rounded-[10px] border border-[#d4d4d4] p-2">
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onShiftViewMonth(-1)}
            aria-label="Предыдущий месяц"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs font-medium capitalize">
            {formatMonthYear(activeMonthKey)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onShiftViewMonth(1)}
            aria-label="Следующий месяц"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="text-center text-[10px] font-medium text-gray-500">
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="h-7" />;
            }

            const dateKey = toDateKey(day);
            const hasEvents = eventDays.has(dateKey);
            const isSelected = selectedDays.includes(dateKey);

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => onToggleDay(dateKey)}
                className={`flex h-7 flex-col items-center justify-center rounded-[6px] border text-[11px] transition-colors ${
                  isSelected
                    ? "border-gray-900 bg-gray-900 text-white"
                    : hasEvents
                      ? "border-gray-900 bg-gray-50 hover:bg-gray-100"
                      : "border-transparent hover:border-[#d4d4d4]"
                }`}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDays.length > 0 && (
        <p className="text-xs text-gray-600">
          Выбрано дней: {selectedDays.length}
        </p>
      )}
    </div>
  );
}