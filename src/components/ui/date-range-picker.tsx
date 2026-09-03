"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatExecutionRange } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

const WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatMonthYear(date: Date) {
  const monthName = new Intl.DateTimeFormat("ru-RU", { month: "long" }).format(date);
  return `${monthName} ${date.getFullYear()}`;
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

function isInRange(dateKey: string, start: string, end: string) {
  if (!start || !end) return false;
  return dateKey >= start && dateKey <= end;
}

interface DateRangePickerProps {
  label?: string;
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
  placeholder?: string;
}

export function DateRangePicker({
  label,
  start,
  end,
  onChange,
  placeholder = "Выберите период",
}: DateRangePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    const initial = start ? new Date(`${start}T00:00:00`) : new Date();
    return new Date(initial.getFullYear(), initial.getMonth(), 1);
  });

  const days = useMemo(() => getCalendarDays(viewDate), [viewDate]);
  const displayValue = formatExecutionRange(start, end);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleDayClick = (dateKey: string) => {
    if (!start || (start && end)) {
      onChange(dateKey, "");
      return;
    }

    if (dateKey < start) {
      onChange(dateKey, start);
    } else {
      onChange(start, dateKey);
    }
    setOpen(false);
  };

  const handleClear = () => {
    onChange("", "");
  };

  return (
    <div ref={rootRef} className="relative flex flex-col gap-1">
      {label && <span className="text-sm font-medium text-gray-900">{label}</span>}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between rounded-[10px] border border-[#d4d4d4] px-3 py-2 text-left text-sm hover:border-[#171717] focus:border-[#171717] focus:outline-none focus:ring-1 focus:ring-[#171717]"
      >
        <span className={displayValue ? "text-gray-900" : "text-gray-500"}>
          {displayValue || placeholder}
        </span>
        <Calendar className="h-4 w-4 shrink-0 text-gray-500" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-[10px] border border-[#d4d4d4] bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
              aria-label="Предыдущий месяц"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium capitalize">{formatMonthYear(viewDate)}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
              aria-label="Следующий месяц"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {WEEKDAY_LABELS.map((weekday) => (
              <div key={weekday} className="text-center text-[10px] font-medium text-gray-500">
                {weekday}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="h-8" />;
              }

              const dateKey = toDateKey(day);
              const isStart = dateKey === start;
              const isEnd = dateKey === end;
              const inRange = isInRange(dateKey, start, end);

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => handleDayClick(dateKey)}
                  className={cn(
                    "h-8 rounded-[6px] text-xs border transition-colors",
                    isStart || isEnd
                      ? "border-gray-900 bg-gray-900 text-white"
                      : inRange
                        ? "border-transparent bg-gray-100 text-gray-900"
                        : "border-transparent hover:border-gray-300"
                  )}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 text-xs text-gray-600">
            <span>
              {!start && "Выберите дату начала"}
              {start && !end && "Выберите дату окончания"}
              {start && end && formatExecutionRange(start, end)}
            </span>
            {(start || end) && (
              <button type="button" onClick={handleClear} className="underline">
                Сбросить
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}