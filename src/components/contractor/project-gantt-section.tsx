"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, X } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/states";
import { ProjectTimelineRowModal } from "@/components/contractor/project-timeline-row-modal";
import { STAGE_STATUS_LABELS } from "@/constants/statuses";
import type { Deal, DealStage, ProjectTimelineRow } from "@/data/types";
import { usePrototypeStore } from "@/lib/store";
import { formatShortDate } from "@/lib/utils/formatters";
import type { GanttRow, GanttStageBar, TimelineRange } from "@/lib/utils/gantt-utils";
import {
  buildCalendarEvents,
  buildGanttRows,
  formatDayHeader,
  formatGanttRange,
  formatMonthLabel,
  formatWeekdayShort,
  getBarPosition,
  getBarPositionInRange,
  getCalendarYearMonthSpans,
  getCalendarYearRange,
  getDayColumns,
  getMonthGrid,
  getMonthSpans,
  getRangeFromMonthSpans,
  getTimelineRange,
  getTodayOffset,
  getTodayPercentInRange,
  isSameDay,
  isWeekend,
  toDateKey,
} from "@/lib/utils/gantt-utils";
import { cn } from "@/lib/utils/cn";

const LABEL_WIDTH = 240;
const ROW_HEIGHT = 52;
const STAGE_ROW_HEIGHT = 40;
const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

type CalendarScale = "month" | "quarter" | "half-year" | "year";
type GanttZoom = "compact" | "standard" | "detailed";

const CALENDAR_SCALE_WINDOW_MONTHS: Record<Exclude<CalendarScale, "month">, number> = {
  quarter: 3,
  "half-year": 6,
  year: 12,
};

const CALENDAR_SCALE_OPTIONS: Array<{ id: CalendarScale; label: string }> = [
  { id: "month", label: "Месяц" },
  { id: "quarter", label: "3 месяца" },
  { id: "half-year", label: "6 месяцев" },
  { id: "year", label: "Год" },
];

const GANTT_ZOOM_WIDTH: Record<GanttZoom, number> = {
  compact: 20,
  standard: 32,
  detailed: 48,
};

const GANTT_WINDOW_MONTHS: Record<GanttZoom, number> = {
  compact: 3,
  standard: 3,
  detailed: 6,
};

const GANTT_ZOOM_OPTIONS: Array<{ id: GanttZoom; label: string }> = [
  { id: "compact", label: "Обзор" },
  { id: "standard", label: "Стандарт" },
  { id: "detailed", label: "Детально" },
];

function getCalendarNavigationYearBounds(): { min: number; max: number } {
  const currentYear = new Date().getFullYear();
  return { min: currentYear - 20, max: currentYear + 10 };
}

function stageBarClass(status: DealStage["status"], isCustom?: boolean): string {
  const base = (() => {
    switch (status) {
      case "in_progress":
        return "bg-gray-900 text-white border-gray-900";
      case "accepted":
        return "bg-gray-200 text-gray-900 border-gray-600";
      case "review":
        return "bg-white text-gray-900 border-gray-900 border-dashed";
      case "revision":
        return "bg-red-50 text-red-900 border-red-400";
      default:
        return "bg-gray-100 text-gray-700 border-gray-400";
    }
  })();

  return isCustom ? `${base} border-dashed` : base;
}

function stageDotClass(status: DealStage["status"]): string {
  switch (status) {
    case "in_progress":
      return "bg-gray-900";
    case "accepted":
      return "bg-gray-500";
    case "review":
      return "bg-white border border-gray-900 border-dashed";
    case "revision":
      return "bg-red-400";
    default:
      return "bg-gray-300";
  }
}

function GanttLegend() {
  const items: { status: DealStage["status"]; label: string }[] = [
    { status: "pending", label: STAGE_STATUS_LABELS.pending },
    { status: "in_progress", label: STAGE_STATUS_LABELS.in_progress },
    { status: "review", label: STAGE_STATUS_LABELS.review },
    { status: "accepted", label: STAGE_STATUS_LABELS.accepted },
    { status: "revision", label: STAGE_STATUS_LABELS.revision },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-gray-200 px-4 py-3 text-xs text-gray-600">
      {items.map((item) => (
        <span key={item.status} className="inline-flex items-center gap-2 shrink-0 whitespace-nowrap">
          <span className={cn("h-2.5 w-2.5 shrink-0 border", stageDotClass(item.status))} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function useExpandedDeals(deals: Deal[]) {
  const [expandedDeals, setExpandedDeals] = useState<Set<string>>(
    () => new Set(deals.map((deal) => deal.id))
  );

  useEffect(() => {
    setExpandedDeals(new Set(deals.map((deal) => deal.id)));
  }, [deals]);

  const toggleDeal = (dealId: string) => {
    setExpandedDeals((prev) => {
      const next = new Set(prev);
      if (next.has(dealId)) {
        next.delete(dealId);
      } else {
        next.add(dealId);
      }
      return next;
    });
  };

  return { expandedDeals, toggleDeal };
}

function TodayMarker({
  leftPx,
  leftPercent,
}: {
  leftPx?: number | null;
  leftPercent?: number | null;
}) {
  if (leftPx == null && leftPercent == null) return null;

  return (
    <div
      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none"
      style={leftPx != null ? { left: leftPx } : { left: `${leftPercent}%` }}
      aria-hidden
    />
  );
}

function AddTimelineRowButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
    >
      <Plus className="h-3.5 w-3.5" />
      Добавить строку
    </button>
  );
}

function GanttStageBarBlock({
  bar,
  range,
  dayWidth,
  usePercent,
}: {
  bar: GanttStageBar;
  range: TimelineRange;
  dayWidth?: number;
  usePercent?: boolean;
}) {
  if (usePercent) {
    const position = getBarPositionInRange(bar, range);
    if (!position) return null;

    return (
      <div
        className={cn(
          "absolute top-1.5 h-7 border text-[11px] flex items-center px-1.5 overflow-hidden z-[1]",
          stageBarClass(bar.stage.status, bar.isCustom)
        )}
        style={{
          left: `calc(${position.leftPercent}% + 2px)`,
          width: `max(calc(${position.widthPercent}% - 4px), 24px)`,
        }}
        title={`${bar.stage.title}: ${formatGanttRange(bar.start, bar.end)}`}
      >
        <span className="truncate font-medium">{bar.stage.title}</span>
      </div>
    );
  }

  if (!dayWidth) return null;

  const { left, width } = getBarPosition(bar, range, dayWidth);
  if (bar.end < range.start || bar.start > range.end) return null;

  return (
    <div
      className={cn(
        "absolute top-1.5 h-7 border text-[11px] flex items-center px-1.5 overflow-hidden z-[1]",
        stageBarClass(bar.stage.status, bar.isCustom)
      )}
      style={{ left: left + 2, width: Math.max(width, Math.min(dayWidth * 2, 48)) }}
      title={`${bar.stage.title}: ${formatGanttRange(bar.start, bar.end)}`}
    >
      <span className="truncate font-medium">{bar.stage.title}</span>
    </div>
  );
}

function GanttProjectRowsDay({
  rows,
  range,
  days,
  dayWidth,
  chartWidth,
  expandedDeals,
  toggleDeal,
  onAddRow,
  onRemoveRow,
}: {
  rows: GanttRow[];
  range: TimelineRange;
  days: Date[];
  dayWidth: number;
  chartWidth: number;
  expandedDeals: Set<string>;
  toggleDeal: (dealId: string) => void;
  onAddRow: (dealId: string) => void;
  onRemoveRow: (rowId: string) => void;
}) {
  return (
    <>
      {rows.map((row) => {
        const isExpanded = expandedDeals.has(row.dealId);

        return (
          <div key={row.dealId}>
            <div className="flex border-b border-gray-200">
              <div
                className="shrink-0 border-r border-gray-300 px-2 py-2 bg-white"
                style={{ width: LABEL_WIDTH, minHeight: isExpanded ? 40 : ROW_HEIGHT }}
              >
                <button
                  type="button"
                  onClick={() => toggleDeal(row.dealId)}
                  className="flex items-start gap-1.5 w-full text-left group"
                  aria-expanded={isExpanded}
                >
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 mt-0.5 text-gray-500 transition-transform",
                      !isExpanded && "-rotate-90"
                    )}
                  />
                  <div className="min-w-0">
                    <Link
                      href={`/deals/${row.dealId}`}
                      className="text-sm font-medium hover:underline line-clamp-2"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {row.dealTitle}
                    </Link>
                    <p className="text-[11px] text-gray-500 mt-0.5">{row.dealNumber}</p>
                    {!isExpanded && (
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {row.bars.length}{" "}
                        {row.bars.length === 1 ? "строка" : row.bars.length < 5 ? "строки" : "строк"}
                      </p>
                    )}
                  </div>
                </button>
              </div>

              {!isExpanded && (
                <div className="relative shrink-0" style={{ width: chartWidth, minHeight: ROW_HEIGHT }}>
                  {days.map((day, index) => (
                    <div
                      key={`${row.dealId}-collapsed-${toDateKey(day)}`}
                      className={cn(
                        "absolute top-0 bottom-0 border-r border-gray-100",
                        isWeekend(day) && "bg-gray-50/70"
                      )}
                      style={{ left: index * dayWidth, width: dayWidth }}
                    />
                  ))}
                  {row.bars.map((bar) => (
                    <GanttStageBarBlock key={bar.stage.id} bar={bar} range={range} dayWidth={dayWidth} />
                  ))}
                </div>
              )}

              {isExpanded && (
                <div
                  className="shrink-0 border-r border-gray-200 bg-gray-50/30"
                  style={{ width: chartWidth, minHeight: 40 }}
                />
              )}
            </div>

            {isExpanded &&
              row.bars.map((bar) => (
                <div key={bar.stage.id} className="flex border-b border-gray-100 last:border-b-0">
                  <div
                    className="shrink-0 border-r border-gray-300 bg-gray-50/40 pl-8 pr-3 py-2"
                    style={{ width: LABEL_WIDTH, minHeight: STAGE_ROW_HEIGHT }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{bar.stage.title}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {STAGE_STATUS_LABELS[bar.stage.status]}
                          {bar.isCustom && " · доп."}
                        </p>
                      </div>
                      {bar.isCustom && (
                        <button
                          type="button"
                          onClick={() => onRemoveRow(bar.stage.id)}
                          className="p-0.5 text-gray-400 hover:text-red-600 shrink-0"
                          aria-label="Удалить строку"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div
                    className="relative shrink-0"
                    style={{ width: chartWidth, minHeight: STAGE_ROW_HEIGHT }}
                  >
                    {days.map((day, index) => (
                      <div
                        key={`${row.dealId}-${bar.stage.id}-${toDateKey(day)}`}
                        className={cn(
                          "absolute top-0 bottom-0 border-r border-gray-100",
                          isWeekend(day) && "bg-gray-50/70"
                        )}
                        style={{ left: index * dayWidth, width: dayWidth }}
                      />
                    ))}
                    <GanttStageBarBlock bar={bar} range={range} dayWidth={dayWidth} />
                  </div>
                </div>
              ))}

            {isExpanded && (
              <div className="flex border-b border-gray-200">
                <div className="shrink-0 border-r border-gray-300 pl-8 pr-3 py-2" style={{ width: LABEL_WIDTH }}>
                  <AddTimelineRowButton onClick={() => onAddRow(row.dealId)} />
                </div>
                <div className="shrink-0 bg-gray-50/20 border-r border-gray-200" style={{ width: chartWidth }} />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

function GanttProjectRowsPercent({
  rows,
  range,
  visibleMonthSpans,
  expandedDeals,
  toggleDeal,
  onAddRow,
  onRemoveRow,
}: {
  rows: GanttRow[];
  range: TimelineRange;
  visibleMonthSpans: { key: string }[];
  expandedDeals: Set<string>;
  toggleDeal: (dealId: string) => void;
  onAddRow: (dealId: string) => void;
  onRemoveRow: (rowId: string) => void;
}) {
  return (
    <>
      {rows.map((row) => {
        const isExpanded = expandedDeals.has(row.dealId);

        return (
          <div key={row.dealId}>
            <div className="flex border-b border-gray-200">
              <div
                className="shrink-0 border-r border-gray-300 px-2 py-2 bg-white"
                style={{ width: LABEL_WIDTH, minHeight: isExpanded ? 40 : ROW_HEIGHT }}
              >
                <button
                  type="button"
                  onClick={() => toggleDeal(row.dealId)}
                  className="flex items-start gap-1.5 w-full text-left"
                  aria-expanded={isExpanded}
                >
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 mt-0.5 text-gray-500 transition-transform",
                      !isExpanded && "-rotate-90"
                    )}
                  />
                  <div className="min-w-0">
                    <Link
                      href={`/deals/${row.dealId}`}
                      className="text-sm font-medium hover:underline line-clamp-2"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {row.dealTitle}
                    </Link>
                    <p className="text-[11px] text-gray-500 mt-0.5">{row.dealNumber}</p>
                    {!isExpanded && (
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {row.bars.length}{" "}
                        {row.bars.length === 1 ? "строка" : row.bars.length < 5 ? "строки" : "строк"}
                      </p>
                    )}
                  </div>
                </button>
              </div>

              {!isExpanded && (
                <div className="relative flex-1 min-w-0" style={{ minHeight: ROW_HEIGHT }}>
                  {visibleMonthSpans.map((month, index) => (
                    <div
                      key={`${row.dealId}-collapsed-${month.key}`}
                      className="absolute top-0 bottom-0 border-r border-gray-100"
                      style={{
                        left: `${(index / visibleMonthSpans.length) * 100}%`,
                        width: `${100 / visibleMonthSpans.length}%`,
                      }}
                    />
                  ))}
                  {row.bars.map((bar) => (
                    <GanttStageBarBlock key={bar.stage.id} bar={bar} range={range} usePercent />
                  ))}
                </div>
              )}

              {isExpanded && <div className="flex-1 min-w-0 bg-gray-50/30 border-r border-gray-200 min-h-[40px]" />}
            </div>

            {isExpanded &&
              row.bars.map((bar) => (
                <div key={bar.stage.id} className="flex border-b border-gray-100 last:border-b-0">
                  <div
                    className="shrink-0 border-r border-gray-300 bg-gray-50/40 pl-8 pr-3 py-2"
                    style={{ width: LABEL_WIDTH, minHeight: STAGE_ROW_HEIGHT }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{bar.stage.title}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {STAGE_STATUS_LABELS[bar.stage.status]}
                          {bar.isCustom && " · доп."}
                        </p>
                      </div>
                      {bar.isCustom && (
                        <button
                          type="button"
                          onClick={() => onRemoveRow(bar.stage.id)}
                          className="p-0.5 text-gray-400 hover:text-red-600 shrink-0"
                          aria-label="Удалить строку"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="relative flex-1 min-w-0" style={{ minHeight: STAGE_ROW_HEIGHT }}>
                    {visibleMonthSpans.map((month, index) => (
                      <div
                        key={`${row.dealId}-${bar.stage.id}-${month.key}`}
                        className="absolute top-0 bottom-0 border-r border-gray-100"
                        style={{
                          left: `${(index / visibleMonthSpans.length) * 100}%`,
                          width: `${100 / visibleMonthSpans.length}%`,
                        }}
                      />
                    ))}
                    <GanttStageBarBlock bar={bar} range={range} usePercent />
                  </div>
                </div>
              ))}

            {isExpanded && (
              <div className="flex border-b border-gray-200">
                <div className="shrink-0 border-r border-gray-300 pl-8 pr-3 py-2" style={{ width: LABEL_WIDTH }}>
                  <AddTimelineRowButton onClick={() => onAddRow(row.dealId)} />
                </div>
                <div className="flex-1 min-w-0 bg-gray-50/20 border-r border-gray-200" />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

function formatGanttMonthHeader(date: Date, spanWidth: number): string {
  if (spanWidth >= 140) {
    return new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(date);
  }
  return new Intl.DateTimeFormat("ru-RU", { month: "short", year: "numeric" }).format(date);
}

function shouldShowGanttDayLabel(day: Date, dayWidth: number, isFirstInRange: boolean): boolean {
  if (dayWidth >= 28) return true;
  if (dayWidth >= 20) return day.getDate() === 1 || day.getDay() === 1 || isFirstInRange;
  return day.getDate() === 1 || isFirstInRange;
}

function GanttDayHeader({
  day,
  dayWidth,
  isFirstInRange,
}: {
  day: Date;
  dayWidth: number;
  isFirstInRange: boolean;
}) {
  if (!shouldShowGanttDayLabel(day, dayWidth, isFirstInRange)) {
    return null;
  }

  if (dayWidth >= 28) {
    return (
      <>
        <div className="truncate text-[10px] uppercase leading-none opacity-70">
          {formatWeekdayShort(day).slice(0, 2)}
        </div>
        <div className="truncate text-xs font-medium leading-tight mt-0.5">{day.getDate()}</div>
      </>
    );
  }

  return <div className="truncate text-[10px] font-medium leading-none">{day.getDate()}</div>;
}

function GanttChartView({
  deals,
  customRows,
  dayWidth,
  zoom,
  onAddRow,
  onRemoveRow,
}: {
  deals: Deal[];
  customRows: ProjectTimelineRow[];
  dayWidth: number;
  zoom: GanttZoom;
  onAddRow: (dealId: string) => void;
  onRemoveRow: (rowId: string) => void;
}) {
  const windowSize = GANTT_WINDOW_MONTHS[zoom];
  const rows = useMemo(() => buildGanttRows(deals, customRows), [deals, customRows]);
  const { expandedDeals, toggleDeal } = useExpandedDeals(deals);
  const fullRange = useMemo(() => getTimelineRange(rows), [rows]);
  const allMonthSpans = useMemo(() => getMonthSpans(fullRange), [fullRange]);
  const allDays = useMemo(() => getDayColumns(fullRange), [fullRange]);
  const [windowStart, setWindowStart] = useState(0);

  useEffect(() => {
    setWindowStart(0);
  }, [deals, zoom]);

  const maxWindowStart = Math.max(0, allMonthSpans.length - windowSize);
  const clampedWindowStart = Math.min(windowStart, maxWindowStart);
  const visibleMonthSpans = useMemo(
    () => allMonthSpans.slice(clampedWindowStart, clampedWindowStart + windowSize),
    [allMonthSpans, clampedWindowStart, windowSize]
  );
  const range = useMemo(
    () => getRangeFromMonthSpans(visibleMonthSpans) ?? fullRange,
    [visibleMonthSpans, fullRange]
  );
  const days = useMemo(
    () => allDays.filter((day) => day >= range.start && day <= range.end),
    [allDays, range]
  );
  const chartWidth = days.length * dayWidth;
  const todayOffset = getTodayOffset(range, dayWidth);

  const monthSpans = useMemo(() => {
    const spans: { label: string; width: number; key: string }[] = [];
    let currentKey = "";
    let currentWidth = 0;
    let currentMonthDate: Date | null = null;

    days.forEach((day) => {
      const key = `${day.getFullYear()}-${day.getMonth()}`;

      if (key !== currentKey) {
        if (currentKey && currentMonthDate) {
          spans.push({
            key: currentKey,
            label: formatGanttMonthHeader(currentMonthDate, currentWidth),
            width: currentWidth,
          });
        }
        currentKey = key;
        currentMonthDate = day;
        currentWidth = dayWidth;
      } else {
        currentWidth += dayWidth;
      }
    });

    if (currentKey && currentMonthDate) {
      spans.push({
        key: currentKey,
        label: formatGanttMonthHeader(currentMonthDate, currentWidth),
        width: currentWidth,
      });
    }

    return spans;
  }, [days, dayWidth]);

  const shiftWindow = (delta: number) => {
    setWindowStart((prev) => Math.min(maxWindowStart, Math.max(0, prev + delta)));
  };

  const canGoPrev = clampedWindowStart > 0;
  const canGoNext = clampedWindowStart < maxWindowStart;
  const headerHeight = dayWidth >= 28 ? 36 : 28;

  return (
    <div className="border border-gray-300 bg-white">
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={() => shiftWindow(-1)}
          disabled={!canGoPrev}
          className="p-1 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Предыдущие месяцы"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-center min-w-0">
          <p className="text-sm font-semibold capitalize truncate">
            {formatDayHeader(range.start)} — {formatDayHeader(range.end)}
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Показано {visibleMonthSpans.length} из {allMonthSpans.length} мес.
          </p>
        </div>
        <button
          type="button"
          onClick={() => shiftWindow(1)}
          disabled={!canGoNext}
          className="p-1 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Следующие месяцы"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="w-max min-w-full" style={{ minWidth: LABEL_WIDTH + chartWidth }}>
          <div className="flex border-b border-gray-300">
            <div
              className="shrink-0 border-r border-gray-300 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600"
              style={{ width: LABEL_WIDTH }}
            >
              Проект / этап
            </div>
            <div className="flex shrink-0" style={{ width: chartWidth }}>
              {monthSpans.map((month) => (
                <div
                  key={month.key}
                  className="shrink-0 overflow-hidden border-r border-gray-200 px-1 py-2 text-xs font-semibold capitalize whitespace-nowrap text-center"
                  style={{ width: month.width, minWidth: month.width, maxWidth: month.width }}
                  title={month.label}
                >
                  {month.label}
                </div>
              ))}
            </div>
          </div>

          <div className="flex border-b border-gray-300">
            <div
              className="shrink-0 border-r border-gray-300 bg-gray-50"
              style={{ width: LABEL_WIDTH, height: headerHeight }}
            />
            <div className="flex shrink-0" style={{ width: chartWidth }}>
              {days.map((day, index) => (
                <div
                  key={toDateKey(day)}
                  className={cn(
                    "shrink-0 overflow-hidden border-r border-gray-200 text-center py-1",
                    isWeekend(day) && "bg-gray-50",
                    isSameDay(day, new Date()) && "bg-gray-900 text-white"
                  )}
                  style={{ width: dayWidth, minWidth: dayWidth, maxWidth: dayWidth }}
                >
                  <GanttDayHeader day={day} dayWidth={dayWidth} isFirstInRange={index === 0} />
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <GanttProjectRowsDay
              rows={rows}
              range={range}
              days={days}
              dayWidth={dayWidth}
              chartWidth={chartWidth}
              expandedDeals={expandedDeals}
              toggleDeal={toggleDeal}
              onAddRow={onAddRow}
              onRemoveRow={onRemoveRow}
            />
            {todayOffset !== null && <TodayMarker leftPx={LABEL_WIDTH + todayOffset} />}
          </div>
        </div>
      </div>

      {todayOffset !== null && (
        <p className="px-4 py-2 text-xs text-gray-500 border-t border-gray-200">
          Красная линия — сегодня ({formatDayHeader(new Date())})
        </p>
      )}

      <GanttLegend />
    </div>
  );
}

function ScaledCalendarTimelineView({
  deals,
  customRows,
  scale,
  onAddRow,
  onRemoveRow,
}: {
  deals: Deal[];
  customRows: ProjectTimelineRow[];
  scale: Exclude<CalendarScale, "month">;
  onAddRow: (dealId: string) => void;
  onRemoveRow: (rowId: string) => void;
}) {
  const windowSize = CALENDAR_SCALE_WINDOW_MONTHS[scale];
  const isCalendarYear = scale === "year";
  const rows = useMemo(() => buildGanttRows(deals, customRows), [deals, customRows]);
  const { expandedDeals, toggleDeal } = useExpandedDeals(deals);
  const range = useMemo(() => getTimelineRange(rows), [rows]);
  const allMonthSpans = useMemo(() => getMonthSpans(range), [range]);
  const projectMinYear = range.start.getFullYear();
  const projectMaxYear = range.end.getFullYear();
  const { min: navMinYear, max: navMaxYear } = getCalendarNavigationYearBounds();
  const [windowStart, setWindowStart] = useState(0);
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

  useEffect(() => {
    setWindowStart(0);
    if (scale === "year") {
      setSelectedYear(new Date().getFullYear());
    }
  }, [scale, deals]);

  const maxWindowStart = Math.max(0, allMonthSpans.length - windowSize);
  const clampedWindowStart = Math.min(windowStart, maxWindowStart);
  const visibleMonthSpans = useMemo(() => {
    if (isCalendarYear) {
      return getCalendarYearMonthSpans(selectedYear);
    }
    return allMonthSpans.slice(clampedWindowStart, clampedWindowStart + windowSize);
  }, [allMonthSpans, clampedWindowStart, isCalendarYear, selectedYear, windowSize]);
  const visibleRange = useMemo(() => {
    if (isCalendarYear) {
      return getCalendarYearRange(selectedYear);
    }
    return getRangeFromMonthSpans(visibleMonthSpans) ?? range;
  }, [isCalendarYear, range, selectedYear, visibleMonthSpans]);

  const shiftWindow = (delta: number) => {
    setWindowStart((prev) => Math.min(maxWindowStart, Math.max(0, prev + delta)));
  };

  const shiftYear = (delta: number) => {
    setSelectedYear((prev) => Math.min(navMaxYear, Math.max(navMinYear, prev + delta)));
  };

  const canGoPrev = isCalendarYear ? selectedYear > navMinYear : clampedWindowStart > 0;
  const canGoNext = isCalendarYear ? selectedYear < navMaxYear : clampedWindowStart < maxWindowStart;
  const visiblePeriodLabel = isCalendarYear
    ? `${selectedYear} г.`
    : `${formatDayHeader(visibleRange.start)} — ${formatDayHeader(visibleRange.end)}`;
  const hasProjectInSelectedYear =
    isCalendarYear && selectedYear >= projectMinYear && selectedYear <= projectMaxYear;
  const visibleCountLabel = isCalendarYear
    ? hasProjectInSelectedYear
      ? projectMinYear === projectMaxYear
        ? `Есть этапы проектов в ${projectMinYear} г.`
        : `Есть этапы проектов: ${projectMinYear}—${projectMaxYear} г.`
      : "В этом году нет этапов по текущим проектам"
    : `Показано ${visibleMonthSpans.length} из ${allMonthSpans.length}`;
  const todayPercent = getTodayPercentInRange(visibleRange);

  return (
    <div className="border border-gray-300 bg-white">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-300 bg-gray-50">
        <button
          type="button"
          onClick={() => (isCalendarYear ? shiftYear(-1) : shiftWindow(-1))}
          disabled={!canGoPrev}
          className="p-1 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none"
          aria-label={isCalendarYear ? "Предыдущий год" : "Предыдущие месяцы"}
        >
          {isCalendarYear ? <ChevronsLeft className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
        <div className="text-center min-w-0">
          <p className="text-sm font-semibold capitalize truncate">{visiblePeriodLabel}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">{visibleCountLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => (isCalendarYear ? shiftYear(1) : shiftWindow(1))}
          disabled={!canGoNext}
          className="p-1 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none"
          aria-label={isCalendarYear ? "Следующий год" : "Следующие месяцы"}
        >
          {isCalendarYear ? <ChevronsRight className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      <div>
        <div className="flex border-b border-gray-300">
          <div
            className="shrink-0 border-r border-gray-300 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600"
            style={{ width: LABEL_WIDTH }}
          >
            Проект / этап
          </div>
          <div className="flex flex-1 min-w-0">
            {visibleMonthSpans.map((month) => (
              <div
                key={month.key}
                className="flex-1 border-r border-gray-200 px-2 py-2 text-xs font-semibold capitalize text-center min-w-0"
              >
                {month.label}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <GanttProjectRowsPercent
            rows={rows}
            range={visibleRange}
            visibleMonthSpans={visibleMonthSpans}
            expandedDeals={expandedDeals}
            toggleDeal={toggleDeal}
            onAddRow={onAddRow}
            onRemoveRow={onRemoveRow}
          />
          <div
            className="absolute top-0 bottom-0 pointer-events-none"
            style={{ left: LABEL_WIDTH, right: 0 }}
          >
            {todayPercent !== null && <TodayMarker leftPercent={todayPercent} />}
          </div>
        </div>
      </div>

      {todayPercent !== null && (
        <p className="px-4 py-2 text-xs text-gray-500 border-t border-gray-200">
          Красная линия — сегодня ({formatDayHeader(new Date())})
        </p>
      )}

      <GanttLegend />
    </div>
  );
}

function ProjectCalendarView({
  deals,
  customRows,
  scale,
  onScaleChange,
  onAddRow,
  onRemoveRow,
}: {
  deals: Deal[];
  customRows: ProjectTimelineRow[];
  scale: CalendarScale;
  onScaleChange: (scale: CalendarScale) => void;
  onAddRow: (dealId: string) => void;
  onRemoveRow: (rowId: string) => void;
}) {
  const events = useMemo(() => buildCalendarEvents(deals, customRows), [deals, customRows]);
  const initial = useMemo(() => {
    const firstDeadline = events[0]?.dateKey;
    if (!firstDeadline) return new Date();
    const parsed = new Date(firstDeadline);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [events]);

  const [monthDate, setMonthDate] = useState(() => new Date(initial.getFullYear(), initial.getMonth(), 1));

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const grid = getMonthGrid(year, month);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, typeof events>();
    events.forEach((event) => {
      const list = map.get(event.dateKey) ?? [];
      list.push(event);
      map.set(event.dateKey, list);
    });
    return map;
  }, [events]);

  const shiftMonth = (delta: number) => {
    setMonthDate(new Date(year, month + delta, 1));
  };

  const shiftYear = (delta: number) => {
    setMonthDate(new Date(year + delta, month, 1));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-gray-600 mr-1">Масштаб:</span>
        {CALENDAR_SCALE_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onScaleChange(option.id)}
            className={cn(
              "px-2.5 py-1 text-xs border transition-colors",
              scale === option.id
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-300 bg-white text-gray-700 hover:border-gray-900"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {scale !== "month" ? (
        <ScaledCalendarTimelineView
          deals={deals}
          customRows={customRows}
          scale={scale}
          onAddRow={onAddRow}
          onRemoveRow={onRemoveRow}
        />
      ) : (
        <div className="border border-gray-300 bg-white">
          <div className="flex items-center justify-between px-2 sm:px-4 py-3 border-b border-gray-300">
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => shiftYear(-1)}
                className="p-1 hover:bg-gray-100"
                aria-label="Предыдущий год"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                className="p-1 hover:bg-gray-100"
                aria-label="Предыдущий месяц"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm font-semibold capitalize px-2 text-center">{formatMonthLabel(year, month)}</p>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                className="p-1 hover:bg-gray-100"
                aria-label="Следующий месяц"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => shiftYear(1)}
                className="p-1 hover:bg-gray-100"
                aria-label="Следующий год"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
            {WEEKDAYS.map((day) => (
              <div key={day} className="px-2 py-2 text-xs font-medium text-gray-600 text-center">
                {day}
              </div>
            ))}
          </div>

          <div className="relative">
            {year === new Date().getFullYear() && month === new Date().getMonth() && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
                style={{ left: `calc(${((new Date().getDay() + 6) % 7) * (100 / 7)}% + ${100 / 14}%)` }}
                aria-hidden
              />
            )}

            <div className="grid grid-cols-7">
            {grid.map((day, index) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="min-h-[96px] border-r border-b border-gray-100 bg-gray-50/40"
                  />
                );
              }

              const dateKey = toDateKey(day);
              const dayEvents = eventsByDate.get(dateKey) ?? [];
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={dateKey}
                  className={cn(
                    "min-h-[96px] border-r border-b border-gray-200 p-1.5 align-top",
                    isWeekend(day) && "bg-gray-50/60",
                    isToday && "ring-1 ring-inset ring-gray-900"
                  )}
                >
                  <div className={cn("text-xs font-medium mb-1", isToday && "text-gray-900")}>
                    {day.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map((event) => (
                      <Link
                        key={`${event.dealId}-${event.stage.id}`}
                        href={`/deals/${event.dealId}`}
                        className={cn(
                          "block text-[10px] leading-tight px-1 py-0.5 border truncate hover:underline",
                          stageBarClass(event.stage.status, event.isCustom)
                        )}
                        title={`${event.dealTitle} · ${event.stage.title}`}
                      >
                        {event.stage.title}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
            </div>
          </div>

          {year === new Date().getFullYear() && month === new Date().getMonth() && (
            <p className="px-4 py-2 text-xs text-gray-500 border-t border-gray-200">
              Красная линия — сегодня ({formatDayHeader(new Date())})
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ProjectListView({
  deals,
  customRows,
  onAddRow,
  onRemoveRow,
}: {
  deals: Deal[];
  customRows: ProjectTimelineRow[];
  onAddRow: (dealId: string) => void;
  onRemoveRow: (rowId: string) => void;
}) {
  const { expandedDeals, toggleDeal } = useExpandedDeals(deals);

  return (
    <div className="space-y-3">
      {deals.map((deal) => {
        const isExpanded = expandedDeals.has(deal.id);
        const dealCustomRows = customRows.filter((row) => row.dealId === deal.id);
        const totalRows = deal.stages.length + dealCustomRows.length;

        return (
          <Card key={deal.id} className="overflow-hidden">
            <button
              type="button"
              onClick={() => toggleDeal(deal.id)}
              className="flex w-full items-start gap-2 text-left px-4 pt-4 pb-3 hover:bg-gray-50/80 transition-colors"
              aria-expanded={isExpanded}
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 mt-0.5 text-gray-500 transition-transform",
                  !isExpanded && "-rotate-90"
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <CardTitle className="mb-0">
                    <Link
                      href={`/deals/${deal.id}`}
                      className="hover:underline"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {deal.title}
                    </Link>
                  </CardTitle>
                  {!isExpanded && (
                    <span className="text-xs text-gray-500 shrink-0">
                      {totalRows} {totalRows === 1 ? "строка" : totalRows < 5 ? "строки" : "строк"}
                    </span>
                  )}
                </div>
                <CardDescription className="mt-1 mb-0">{deal.number}</CardDescription>
              </div>
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 space-y-0 border-t border-gray-100">
                {deal.stages.map((stage) => (
                  <Link
                    key={stage.id}
                    href={`/deals/${deal.id}`}
                    className="flex justify-between gap-3 text-sm py-2.5 border-t border-gray-100 first:border-t-0 hover:bg-gray-50/60 -mx-4 px-4 transition-colors"
                  >
                    <span className="inline-flex items-center gap-2 min-w-0 pl-6">
                      <span className={cn("h-2 w-2 shrink-0 border", stageDotClass(stage.status))} />
                      <span className="truncate">{stage.title}</span>
                    </span>
                    <span className="text-gray-600 shrink-0 text-right">
                      до {formatShortDate(stage.deadline)}
                      <span className="hidden sm:inline"> · {STAGE_STATUS_LABELS[stage.status]}</span>
                    </span>
                  </Link>
                ))}

                {dealCustomRows.map((row) => (
                  <div
                    key={row.id}
                    className="flex justify-between gap-3 text-sm py-2.5 border-t border-gray-100 hover:bg-gray-50/60 -mx-4 px-4 transition-colors"
                  >
                    <span className="inline-flex items-center gap-2 min-w-0 pl-6">
                      <span
                        className={cn(
                          "h-2 w-2 shrink-0 border border-dashed",
                          stageDotClass(row.status)
                        )}
                      />
                      <span className="truncate">{row.title}</span>
                      <span className="text-[10px] text-gray-400 shrink-0">доп.</span>
                    </span>
                    <span className="inline-flex items-center gap-2 shrink-0 text-right">
                      <span className="text-gray-600">
                        {formatShortDate(row.startDate)} — {formatShortDate(row.endDate)}
                        <span className="hidden sm:inline"> · {STAGE_STATUS_LABELS[row.status]}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveRow(row.id)}
                        className="p-0.5 text-gray-400 hover:text-red-600"
                        aria-label="Удалить строку"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  </div>
                ))}

                <div className="pt-3 pl-6 border-t border-gray-100">
                  <AddTimelineRowButton onClick={() => onAddRow(deal.id)} />
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

interface ProjectGanttSectionProps {
  deals: Deal[];
  onBrowseRequests?: () => void;
}

function GanttZoomControls({
  zoom,
  onZoomChange,
}: {
  zoom: GanttZoom;
  onZoomChange: (zoom: GanttZoom) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-gray-600 mr-1">Масштаб:</span>
      {GANTT_ZOOM_OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onZoomChange(option.id)}
          className={cn(
            "px-2.5 py-1 text-xs border transition-colors",
            zoom === option.id
              ? "border-gray-900 bg-gray-900 text-white"
              : "border-gray-300 bg-white text-gray-700 hover:border-gray-900"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function ProjectGanttSection({ deals, onBrowseRequests }: ProjectGanttSectionProps) {
  const [view, setView] = useState("gantt");
  const [calendarScale, setCalendarScale] = useState<CalendarScale>("quarter");
  const [ganttZoom, setGanttZoom] = useState<GanttZoom>("compact");
  const [rowModalDealId, setRowModalDealId] = useState<string | null>(null);

  const projectTimelineRows = usePrototypeStore((state) => state.projectTimelineRows);
  const addProjectTimelineRow = usePrototypeStore((state) => state.addProjectTimelineRow);
  const removeProjectTimelineRow = usePrototypeStore((state) => state.removeProjectTimelineRow);

  const rowModalDeal = rowModalDealId
    ? deals.find((deal) => deal.id === rowModalDealId)
    : undefined;

  if (deals.length === 0) {
    return (
      <EmptyState
        title="Активных проектов пока нет"
        description="Откликайтесь на заявки, чтобы увидеть график работ"
        actionLabel="Доступные заявки"
        onAction={onBrowseRequests}
      />
    );
  }

  const dateRange = useMemo(() => {
    const rows = buildGanttRows(deals, projectTimelineRows);
    const range = getTimelineRange(rows);
    return `${formatDayHeader(range.start)} — ${formatDayHeader(range.end)}`;
  }, [deals, projectTimelineRows]);

  const timelineHandlers = {
    onAddRow: (dealId: string) => setRowModalDealId(dealId),
    onRemoveRow: (rowId: string) => removeProjectTimelineRow(rowId),
  };

  return (
    <div className="space-y-4 max-w-full">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-gray-600">
            {deals.length} {deals.length === 1 ? "проект" : deals.length < 5 ? "проекта" : "проектов"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Период: {dateRange}</p>
        </div>
        <Tabs
          tabs={[
            { id: "gantt", label: "Гант" },
            { id: "calendar", label: "Календарь" },
            { id: "list", label: "Список" },
          ]}
          activeTab={view}
          onChange={setView}
        />
      </div>

      {view === "gantt" && (
        <div className="space-y-3">
          <GanttZoomControls zoom={ganttZoom} onZoomChange={setGanttZoom} />
          <GanttChartView
            deals={deals}
            customRows={projectTimelineRows}
            dayWidth={GANTT_ZOOM_WIDTH[ganttZoom]}
            zoom={ganttZoom}
            {...timelineHandlers}
          />
        </div>
      )}
      {view === "calendar" && (
        <ProjectCalendarView
          deals={deals}
          customRows={projectTimelineRows}
          scale={calendarScale}
          onScaleChange={setCalendarScale}
          {...timelineHandlers}
        />
      )}
      {view === "list" && (
        <ProjectListView
          deals={deals}
          customRows={projectTimelineRows}
          {...timelineHandlers}
        />
      )}

      <ProjectTimelineRowModal
        open={rowModalDealId !== null}
        dealId={rowModalDealId}
        dealTitle={rowModalDeal?.title}
        onClose={() => setRowModalDealId(null)}
        onSave={addProjectTimelineRow}
      />
    </div>
  );
}
