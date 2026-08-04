import type { Deal, DealStage } from "@/data/types";

export interface GanttStageBar {
  stage: DealStage;
  dealId: string;
  start: Date;
  end: Date;
}

export interface GanttRow {
  dealId: string;
  dealTitle: string;
  dealNumber: string;
  bars: GanttStageBar[];
}

export interface TimelineRange {
  start: Date;
  end: Date;
  totalDays: number;
}

export interface CalendarStageEvent {
  dateKey: string;
  dealId: string;
  dealTitle: string;
  stage: DealStage;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DEFAULT_STAGE_DAYS = 7;

function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function todayStart(): Date {
  return startOfDay(new Date());
}

export function parseDateValue(value?: string | null): Date | null {
  if (!value?.trim()) return null;

  const isoMatch = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const parsed = new Date(
      Number(isoMatch[1]),
      Number(isoMatch[2]) - 1,
      Number(isoMatch[3])
    );
    return isValidDate(parsed) ? startOfDay(parsed) : null;
  }

  const dottedMatch = value.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})/);
  if (dottedMatch) {
    const parsed = new Date(
      Number(dottedMatch[3]),
      Number(dottedMatch[2]) - 1,
      Number(dottedMatch[1])
    );
    return isValidDate(parsed) ? startOfDay(parsed) : null;
  }

  const parsed = new Date(value);
  return isValidDate(parsed) ? startOfDay(parsed) : null;
}

function parseDurationDays(value: string): number | null {
  const match = value.match(/(\d+)\s*(?:рабочих\s+)?дн/i);
  if (!match) return null;
  const days = Number(match[1]);
  return Number.isFinite(days) && days > 0 ? days : null;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return startOfDay(result);
}

function resolveDealStart(deal: Deal): Date {
  for (const entry of deal.history) {
    const parsed = parseDateValue(entry.date);
    if (parsed) return parsed;
  }

  for (const stage of deal.stages) {
    const parsed = parseDateValue(stage.deadline);
    if (parsed) return addDays(parsed, -DEFAULT_STAGE_DAYS);
  }

  return todayStart();
}

function resolveStageEnd(
  stage: DealStage,
  start: Date,
  previousEnd: Date | null
): Date {
  const parsedDeadline = parseDateValue(stage.deadline);
  if (parsedDeadline) {
    return parsedDeadline >= start ? parsedDeadline : addDays(start, DEFAULT_STAGE_DAYS);
  }

  const durationDays = parseDurationDays(stage.deadline) ?? DEFAULT_STAGE_DAYS;
  const base = previousEnd ?? start;
  return addDays(base, durationDays);
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatGanttDate(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function formatGanttRange(start: Date, end: Date): string {
  return `${formatGanttDate(start)} — ${formatGanttDate(end)}`;
}

export function buildGanttRows(deals: Deal[]): GanttRow[] {
  return deals.map((deal) => {
    const dealStart = resolveDealStart(deal);
    let previousEnd: Date | null = null;

    const bars: GanttStageBar[] = deal.stages.map((stage, index) => {
      const start =
        index === 0
          ? dealStart
          : previousEnd
            ? addDays(previousEnd, 1)
            : dealStart;
      const end = resolveStageEnd(stage, start, previousEnd);
      const safeStart = start <= end ? start : addDays(end, -Math.min(DEFAULT_STAGE_DAYS, 2));

      previousEnd = end;

      return {
        stage,
        dealId: deal.id,
        start: safeStart,
        end,
      };
    });

    return {
      dealId: deal.id,
      dealTitle: deal.title,
      dealNumber: deal.number,
      bars,
    };
  });
}

export function getTimelineRange(rows: GanttRow[], paddingDays = 4): TimelineRange {
  const today = todayStart();
  let min = today;
  let max = today;

  rows.forEach((row) => {
    row.bars.forEach((bar) => {
      if (!isValidDate(bar.start) || !isValidDate(bar.end)) return;
      if (bar.start < min) min = bar.start;
      if (bar.end > max) max = bar.end;
    });
  });

  const start = addDays(min, -paddingDays);
  const end = addDays(max, paddingDays);
  const totalDays = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / MS_PER_DAY) + 1
  );

  return { start, end, totalDays };
}

export function getDayColumns(range: TimelineRange): Date[] {
  return Array.from({ length: range.totalDays }, (_, index) =>
    addDays(range.start, index)
  );
}

export function getBarPosition(
  bar: GanttStageBar,
  range: TimelineRange,
  dayWidth: number
): { left: number; width: number } {
  const startOffset = Math.max(
    0,
    Math.round((bar.start.getTime() - range.start.getTime()) / MS_PER_DAY)
  );
  const endOffset = Math.min(
    range.totalDays - 1,
    Math.round((bar.end.getTime() - range.start.getTime()) / MS_PER_DAY)
  );
  const spanDays = Math.max(1, endOffset - startOffset + 1);

  return {
    left: startOffset * dayWidth,
    width: spanDays * dayWidth - 4,
  };
}

export function getTodayOffset(range: TimelineRange, dayWidth: number): number | null {
  const today = todayStart();
  if (today < range.start || today > range.end) return null;
  const offset = Math.round((today.getTime() - range.start.getTime()) / MS_PER_DAY);
  return offset * dayWidth + dayWidth / 2;
}

export function buildCalendarEvents(deals: Deal[]): CalendarStageEvent[] {
  return buildGanttRows(deals).flatMap((row) =>
    row.bars.map((bar) => ({
      dateKey: toDateKey(bar.end),
      dealId: row.dealId,
      dealTitle: row.dealTitle,
      stage: bar.stage,
    }))
  );
}

export function getMonthGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const leadingEmpty = (firstDay.getDay() + 6) % 7;
  const cells: (Date | null)[] = Array.from({ length: leadingEmpty }, () => null);

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    cells.push(new Date(year, month, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export function formatMonthLabel(year: number, month: number): string {
  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month, 1));
}

export function formatDayHeader(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function formatWeekdayShort(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", { weekday: "short" }).format(date);
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b);
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}
