"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const LEGEND = [
  { label: "0%", className: "bg-[#722f37]" },
  { label: "до 10%", className: "bg-red-600" },
  { label: "до 20%", className: "bg-orange-500" },
  { label: "до 30%", className: "bg-yellow-400" },
  { label: "до 50%", className: "bg-lime-300" },
  { label: "выше 50%", className: "bg-emerald-600" },
];

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseIsoDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getOccupancyColorClass(percent: number) {
  if (percent === 0) return "bg-[#722f37] text-white";
  if (percent <= 10) return "bg-red-600 text-white";
  if (percent <= 20) return "bg-orange-500 text-white";
  if (percent <= 30) return "bg-yellow-400 text-gray-900";
  if (percent <= 50) return "bg-lime-300 text-gray-900";
  return "bg-emerald-600 text-white";
}

interface Props {
  occupancyByDate: Record<string, number>;
  rangeStart: string;
  rangeEnd: string;
  onDaySelect: (date: string) => void;
}

export function OccupancyCalendar({
  occupancyByDate,
  rangeStart,
  rangeEnd,
  onDaySelect,
}: Props) {
  const initialMonth = rangeStart ? parseIsoDate(rangeStart) : new Date(2026, 10, 1);
  const [viewMonth, setViewMonth] = useState(
    new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1)
  );

  const monthLabel = new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(viewMonth);

  const calendarDays = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: Array<{ iso: string; day: number; currentMonth: boolean }> = [];

    for (let i = 0; i < startOffset; i += 1) {
      const date = new Date(year, month, -startOffset + i + 1);
      days.push({ iso: toIsoDate(date), day: date.getDate(), currentMonth: false });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day);
      days.push({ iso: toIsoDate(date), day, currentMonth: true });
    }

    while (days.length % 7 !== 0) {
      const last = days[days.length - 1];
      const date = parseIsoDate(last.iso);
      date.setDate(date.getDate() + 1);
      days.push({ iso: toIsoDate(date), day: date.getDate(), currentMonth: false });
    }

    return days;
  }, [viewMonth]);

  const monthAverage = useMemo(() => {
    const monthKey = `${viewMonth.getFullYear()}-${String(viewMonth.getMonth() + 1).padStart(2, "0")}`;
    const values = Object.entries(occupancyByDate)
      .filter(([date]) => date.startsWith(monthKey))
      .map(([, percent]) => percent);

    if (!values.length) return 0;
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  }, [occupancyByDate, viewMonth]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Календарь загрузки площадей</p>
          <p className="text-xs text-gray-600 mt-1">
            Средняя загрузка в {monthLabel}: {monthAverage}%
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Предыдущий месяц"
            onClick={() =>
              setViewMonth(
                (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1)
              )
            }
            className="inline-flex h-8 w-8 items-center justify-center hover:bg-gray-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Следующий месяц"
            onClick={() =>
              setViewMonth(
                (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1)
              )
            }
            className="inline-flex h-8 w-8 items-center justify-center hover:bg-gray-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((weekday) => (
          <div key={weekday} className="text-center text-xs text-gray-500 py-1">
            {weekday}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(({ iso, day, currentMonth }) => {
          const percent = occupancyByDate[iso] ?? 0;
          const selected = iso === rangeStart || iso === rangeEnd;

          return (
            <button
              key={iso}
              type="button"
              title={`${iso}: ${percent}%`}
              onClick={() => onDaySelect(iso)}
              className={cn(
                "relative h-10 text-xs border border-transparent hover:border-gray-900",
                !currentMonth && "opacity-40",
                getOccupancyColorClass(percent),
                selected && "ring-2 ring-gray-900 ring-offset-1"
              )}
            >
              <span className="font-medium">{day}</span>
              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[10px]">
                {percent}%
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-gray-600">
        {LEGEND.map((item) => (
          <span key={item.label} className="inline-flex items-center gap-1.5">
            <span className={cn("h-3 w-3", item.className)} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
