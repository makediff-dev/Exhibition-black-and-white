"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import type { VenueBookingDateStatus } from "@/data/types";
import {
  VENUE_BOOKING_DATE_STATUS_META,
} from "@/lib/utils/venue-date-statuses";
import { cn } from "@/lib/utils/cn";
import { formatShortDate } from "@/lib/utils/formatters";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

interface CalendarProps {
  markedDates?: string[];
  dateStatuses?: Record<string, VenueBookingDateStatus[]>;
  rangeStart: string;
  rangeEnd: string;
  onRangeChange: (start: string, end: string) => void;
  onComplete?: () => void;
}

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

function isWithinRange(date: string, start: string, end: string) {
  if (!start) return false;
  const endDate = end || start;
  return date >= start && date <= endDate;
}

export function BookingDateStatusLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-600">
      {(Object.keys(VENUE_BOOKING_DATE_STATUS_META) as VenueBookingDateStatus[]).map((status) => (
        <span key={status} className="inline-flex items-center gap-1.5">
          <span
            className={cn("h-2 w-2 rounded-full", VENUE_BOOKING_DATE_STATUS_META[status].dotClassName)}
          />
          {VENUE_BOOKING_DATE_STATUS_META[status].label}
        </span>
      ))}
    </div>
  );
}

export function BookingDateCalendarGrid({
  markedDates = [],
  dateStatuses = {},
  rangeStart,
  rangeEnd,
  onRangeChange,
  onComplete,
}: CalendarProps) {
  const initialMonth = rangeStart ? parseIsoDate(rangeStart) : new Date(2026, 3, 1);
  const [viewMonth, setViewMonth] = useState(
    new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1)
  );
  const [pendingStart, setPendingStart] = useState<string | null>(null);

  const markedSet = useMemo(() => new Set(markedDates), [markedDates]);

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

  const handleDayClick = (iso: string) => {
    if (!pendingStart || iso < pendingStart) {
      setPendingStart(iso);
      onRangeChange(iso, iso);
      return;
    }

    onRangeChange(pendingStart, iso);
    setPendingStart(null);
    onComplete?.();
  };

  const shiftMonth = (delta: number) => {
    setViewMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  };

  return (
    <div className="p-3">
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-sm font-medium capitalize">{monthLabel}</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Предыдущий месяц"
            onClick={() => shiftMonth(-1)}
            className="inline-flex h-8 w-8 items-center justify-center hover:bg-gray-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Следующий месяц"
            onClick={() => shiftMonth(1)}
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
          const selected = isWithinRange(iso, rangeStart, rangeEnd);
          const isEdge = iso === rangeStart || iso === (rangeEnd || rangeStart);
          const statuses = dateStatuses[iso] ?? [];
          const hasLegacyMark = markedSet.has(iso) && statuses.length === 0;

          return (
            <button
              key={iso}
              type="button"
              onClick={() => handleDayClick(iso)}
              className={cn(
                "relative h-9 text-sm border border-transparent hover:border-gray-900",
                !currentMonth && "text-gray-300",
                selected && "bg-gray-100",
                isEdge && "bg-gray-900 text-white hover:border-gray-900"
              )}
            >
              {day}
              {(statuses.length > 0 || hasLegacyMark) && !isEdge && (
                <span className="absolute bottom-0.5 left-1/2 flex -translate-x-1/2 gap-0.5">
                  {statuses.length > 0
                    ? statuses.map((status) => (
                        <span
                          key={`${iso}-${status}`}
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            VENUE_BOOKING_DATE_STATUS_META[status].dotClassName
                          )}
                        />
                      ))
                    : (
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-900" />
                      )}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {rangeStart && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            className="text-xs underline hover:text-gray-900"
            onClick={() => {
              setPendingStart(null);
              onRangeChange("", "");
            }}
          >
            Сбросить
          </button>
        </div>
      )}
    </div>
  );
}

interface PickerProps extends CalendarProps {
  label?: string;
  inline?: boolean;
  showLegend?: boolean;
}

export function BookingDateRangePicker({
  label = "Календарь",
  markedDates,
  dateStatuses,
  rangeStart,
  rangeEnd,
  onRangeChange,
  inline = false,
  showLegend = false,
}: PickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayValue = rangeStart
    ? rangeEnd && rangeEnd !== rangeStart
      ? `${formatShortDate(rangeStart)} — ${formatShortDate(rangeEnd)}`
      : formatShortDate(rangeStart)
    : "";

  useEffect(() => {
    if (!open || inline) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, inline]);

  if (inline) {
    return (
      <div className="space-y-3">
        {label ? <p className="text-sm font-medium text-gray-900">{label}</p> : null}
        {displayValue ? (
          <p className="text-sm text-gray-600">Выбрано: {displayValue}</p>
        ) : null}
        <div className="border border-gray-300">
          <BookingDateCalendarGrid
            markedDates={markedDates}
            dateStatuses={dateStatuses}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            onRangeChange={onRangeChange}
          />
        </div>
        {showLegend ? <BookingDateStatusLegend /> : null}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-900">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 border border-gray-300 bg-white px-3 py-2 text-sm text-left hover:border-gray-900"
      >
        <span className={displayValue ? "text-gray-900" : "text-gray-500"}>
          {displayValue || "Выберите период"}
        </span>
        <CalendarDays className="h-4 w-4 shrink-0 text-gray-600" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 border border-gray-300 bg-white shadow-sm">
          <BookingDateCalendarGrid
            markedDates={markedDates}
            dateStatuses={dateStatuses}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            onRangeChange={onRangeChange}
            onComplete={() => setOpen(false)}
          />
          {showLegend ? (
            <div className="border-t border-gray-200 px-3 py-2">
              <BookingDateStatusLegend />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
