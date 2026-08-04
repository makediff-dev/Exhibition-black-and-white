"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/states";
import { STAGE_STATUS_LABELS } from "@/constants/statuses";
import type { Deal, DealStage } from "@/data/types";
import { formatShortDate } from "@/lib/utils/formatters";
import {
  buildCalendarEvents,
  buildGanttRows,
  formatDayHeader,
  formatGanttRange,
  formatMonthLabel,
  formatWeekdayShort,
  getBarPosition,
  getDayColumns,
  getMonthGrid,
  getTimelineRange,
  getTodayOffset,
  isSameDay,
  isWeekend,
  toDateKey,
} from "@/lib/utils/gantt-utils";
import { cn } from "@/lib/utils/cn";

const DAY_WIDTH = 32;
const LABEL_WIDTH = 240;
const ROW_HEIGHT = 52;
const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function stageBarClass(status: DealStage["status"]): string {
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
    <div className="flex flex-wrap gap-4 text-xs text-gray-600 mt-4">
      {items.map((item) => (
        <span key={item.status} className="inline-flex items-center gap-1.5">
          <span className={cn("h-2.5 w-2.5 border", stageDotClass(item.status))} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function GanttChartView({ deals }: { deals: Deal[] }) {
  const rows = useMemo(() => buildGanttRows(deals), [deals]);
  const range = useMemo(() => getTimelineRange(rows), [rows]);
  const days = useMemo(() => getDayColumns(range), [range]);
  const chartWidth = range.totalDays * DAY_WIDTH;
  const todayOffset = getTodayOffset(range, DAY_WIDTH);

  const monthSpans = useMemo(() => {
    const spans: { label: string; width: number }[] = [];
    let currentMonth = "";
    let currentWidth = 0;

    days.forEach((day) => {
      const label = new Intl.DateTimeFormat("ru-RU", {
        month: "long",
        year: "numeric",
      }).format(day);

      if (label !== currentMonth) {
        if (currentMonth) {
          spans.push({ label: currentMonth, width: currentWidth });
        }
        currentMonth = label;
        currentWidth = DAY_WIDTH;
      } else {
        currentWidth += DAY_WIDTH;
      }
    });

    if (currentMonth) {
      spans.push({ label: currentMonth, width: currentWidth });
    }

    return spans;
  }, [days]);

  return (
    <div className="border border-gray-300 bg-white">
      <div className="overflow-x-auto">
        <div style={{ minWidth: LABEL_WIDTH + chartWidth }}>
          <div className="flex border-b border-gray-300">
            <div
              className="shrink-0 border-r border-gray-300 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600"
              style={{ width: LABEL_WIDTH }}
            >
              Проект / этап
            </div>
            <div className="flex" style={{ width: chartWidth }}>
              {monthSpans.map((month) => (
                <div
                  key={`${month.label}-${month.width}`}
                  className="border-r border-gray-200 px-2 py-2 text-xs font-semibold capitalize whitespace-nowrap"
                  style={{ width: month.width }}
                >
                  {month.label}
                </div>
              ))}
            </div>
          </div>

          <div className="flex border-b border-gray-300">
            <div
              className="shrink-0 border-r border-gray-300 bg-gray-50"
              style={{ width: LABEL_WIDTH, height: 36 }}
            />
            <div className="flex" style={{ width: chartWidth }}>
              {days.map((day) => (
                <div
                  key={toDateKey(day)}
                  className={cn(
                    "shrink-0 border-r border-gray-200 text-center py-1",
                    isWeekend(day) && "bg-gray-50",
                    isSameDay(day, new Date()) && "bg-gray-900 text-white"
                  )}
                  style={{ width: DAY_WIDTH }}
                >
                  <div className="text-[10px] uppercase leading-none opacity-70">
                    {formatWeekdayShort(day).slice(0, 2)}
                  </div>
                  <div className="text-xs font-medium leading-tight mt-0.5">{day.getDate()}</div>
                </div>
              ))}
            </div>
          </div>

          {rows.map((row) => (
            <div key={row.dealId} className="flex border-b border-gray-200 last:border-b-0">
              <div
                className="shrink-0 border-r border-gray-300 px-3 py-2 bg-white"
                style={{ width: LABEL_WIDTH, minHeight: ROW_HEIGHT }}
              >
                <Link
                  href={`/deals/${row.dealId}`}
                  className="text-sm font-medium hover:underline line-clamp-2"
                >
                  {row.dealTitle}
                </Link>
                <p className="text-[11px] text-gray-500 mt-0.5">{row.dealNumber}</p>
              </div>

              <div
                className="relative"
                style={{ width: chartWidth, minHeight: ROW_HEIGHT }}
              >
                {days.map((day, index) => (
                  <div
                    key={`${row.dealId}-${toDateKey(day)}`}
                    className={cn(
                      "absolute top-0 bottom-0 border-r border-gray-100",
                      isWeekend(day) && "bg-gray-50/70"
                    )}
                    style={{ left: index * DAY_WIDTH, width: DAY_WIDTH }}
                  />
                ))}

                {todayOffset !== null && (
                  <div
                    className="absolute top-0 bottom-0 w-px bg-red-500 z-10 pointer-events-none"
                    style={{ left: todayOffset }}
                  />
                )}

                {row.bars.map((bar) => {
                  const { left, width } = getBarPosition(bar, range, DAY_WIDTH);
                  return (
                    <div
                      key={bar.stage.id}
                      className={cn(
                        "absolute top-2 h-8 border text-[11px] flex items-center px-1.5 overflow-hidden z-[1]",
                        stageBarClass(bar.stage.status)
                      )}
                      style={{ left: left + 2, width: Math.max(width, 48) }}
                      title={`${bar.stage.title}: ${formatGanttRange(bar.start, bar.end)}`}
                    >
                      <span className="truncate font-medium">{bar.stage.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {todayOffset !== null && (
        <p className="px-3 py-2 text-xs text-gray-500 border-t border-gray-200">
          Красная линия — сегодня
        </p>
      )}

      <GanttLegend />
    </div>
  );
}

function ProjectCalendarView({ deals }: { deals: Deal[] }) {
  const events = useMemo(() => buildCalendarEvents(deals), [deals]);
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

  return (
    <div className="border border-gray-300 bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="p-1 hover:bg-gray-100"
          aria-label="Предыдущий месяц"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold capitalize">{formatMonthLabel(year, month)}</p>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="p-1 hover:bg-gray-100"
          aria-label="Следующий месяц"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {WEEKDAYS.map((day) => (
          <div key={day} className="px-2 py-2 text-xs font-medium text-gray-600 text-center">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {grid.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="min-h-[96px] border-r border-b border-gray-100 bg-gray-50/40" />;
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
                      stageBarClass(event.stage.status)
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
  );
}

function ProjectListView({ deals }: { deals: Deal[] }) {
  return (
    <div className="space-y-3">
      {deals.map((deal) => (
        <Link key={deal.id} href={`/deals/${deal.id}`}>
          <Card className="hover:border-gray-900 transition-colors">
            <CardTitle className="mb-2">{deal.title}</CardTitle>
            <CardDescription className="mb-3">{deal.number}</CardDescription>
            <div className="space-y-0">
              {deal.stages.map((stage) => (
                <div
                  key={stage.id}
                  className="flex justify-between gap-3 text-sm py-2 border-t border-gray-100 first:border-t-0"
                >
                  <span className="inline-flex items-center gap-2 min-w-0">
                    <span className={cn("h-2 w-2 shrink-0 border", stageDotClass(stage.status))} />
                    <span className="truncate">{stage.title}</span>
                  </span>
                  <span className="text-gray-600 shrink-0 text-right">
                    до {formatShortDate(stage.deadline)}
                    <span className="hidden sm:inline"> · {STAGE_STATUS_LABELS[stage.status]}</span>
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

interface ProjectGanttSectionProps {
  deals: Deal[];
  onBrowseRequests?: () => void;
}

export function ProjectGanttSection({ deals, onBrowseRequests }: ProjectGanttSectionProps) {
  const [view, setView] = useState("gantt");

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
    const rows = buildGanttRows(deals);
    const range = getTimelineRange(rows);
    return `${formatDayHeader(range.start)} — ${formatDayHeader(range.end)}`;
  }, [deals]);

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

      {view === "gantt" && <GanttChartView deals={deals} />}
      {view === "calendar" && <ProjectCalendarView deals={deals} />}
      {view === "list" && <ProjectListView deals={deals} />}
    </div>
  );
}
