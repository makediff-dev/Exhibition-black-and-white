import type { Deal, DealStage, ProjectTimelineRow } from "@/data/types";

export interface GanttStageBar {
  stage: DealStage;
  dealId: string;
  start: Date;
  end: Date;
  isCustom?: boolean;
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

export interface MonthSpan {
  key: string;
  label: string;
  start: Date;
  end: Date;
}

export interface CalendarStageEvent {
  dateKey: string;
  dealId: string;
  dealTitle: string;
  stage: DealStage;
  isCustom?: boolean;
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

function resolveStageBar(stage: DealStage, dealStart: Date): { start: Date; end: Date } {
  const parsedDeadline = parseDateValue(stage.deadline);
  const durationDays = parseDurationDays(stage.deadline) ?? DEFAULT_STAGE_DAYS;

  if (parsedDeadline) {
    const end = parsedDeadline;
    let start = addDays(end, -(durationDays - 1));
    if (start < dealStart) start = dealStart;
    if (start > end) start = addDays(end, -1);
    return { start, end };
  }

  const end = addDays(dealStart, durationDays);
  return { start: dealStart, end };
}

function customRowToBar(row: ProjectTimelineRow): GanttStageBar | null {
  const start = parseDateValue(row.startDate);
  const end = parseDateValue(row.endDate);
  if (!start || !end) return null;

  const safeStart = start <= end ? start : end;
  const safeEnd = end >= start ? end : start;

  return {
    dealId: row.dealId,
    start: safeStart,
    end: safeEnd,
    isCustom: true,
    stage: {
      id: row.id,
      title: row.title,
      description: "",
      price: 0,
      deadline: row.endDate,
      status: row.status,
      files: [],
      comments: [],
    },
  };
}

export function buildGanttRows(
  deals: Deal[],
  customRows: ProjectTimelineRow[] = []
): GanttRow[] {
  return deals.map((deal) => {
    const dealStart = resolveDealStart(deal);

    const stageBars: GanttStageBar[] = deal.stages.map((stage) => {
      const { start, end } = resolveStageBar(stage, dealStart);

      return {
        stage,
        dealId: deal.id,
        start,
        end,
        isCustom: false,
      };
    });

    const customBars = customRows
      .filter((row) => row.dealId === deal.id)
      .map(customRowToBar)
      .filter((bar): bar is GanttStageBar => bar !== null);

    return {
      dealId: deal.id,
      dealTitle: deal.title,
      dealNumber: deal.number,
      bars: [...stageBars, ...customBars],
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

export function getTodayPercentInRange(range: TimelineRange): number | null {
  const today = todayStart();
  if (today < range.start || today > range.end) return null;
  const totalMs = Math.max(1, range.end.getTime() - range.start.getTime());
  return ((today.getTime() - range.start.getTime()) / totalMs) * 100;
}

export function getMonthSpans(range: TimelineRange): MonthSpan[] {
  const spans: MonthSpan[] = [];
  let cursor = new Date(range.start.getFullYear(), range.start.getMonth(), 1);

  while (cursor <= range.end) {
    const monthStart = cursor < range.start ? range.start : cursor;
    const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const end = monthEnd > range.end ? range.end : monthEnd;

    spans.push({
      key: `${cursor.getFullYear()}-${cursor.getMonth()}`,
      label: new Intl.DateTimeFormat("ru-RU", {
        month: "short",
        year: cursor.getMonth() === 0 || spans.length === 0 ? "numeric" : undefined,
      }).format(cursor),
      start: monthStart,
      end,
    });

    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }

  return spans;
}

export function getBarPositionByMonth(
  bar: GanttStageBar,
  range: TimelineRange,
  monthSpans: MonthSpan[],
  columnWidth: number
): { left: number; width: number } {
  const position = getBarPositionInRange(bar, range);
  if (!position) {
    return { left: 0, width: 0 };
  }

  const totalWidth = monthSpans.length * columnWidth;

  return {
    left: (position.leftPercent / 100) * totalWidth,
    width: Math.max((position.widthPercent / 100) * totalWidth, columnWidth * 0.35),
  };
}

export function getCalendarYearMonthSpans(year: number): MonthSpan[] {
  const spans: MonthSpan[] = [];

  for (let month = 0; month < 12; month += 1) {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);

    spans.push({
      key: `${year}-${month}`,
      label: new Intl.DateTimeFormat("ru-RU", {
        month: "short",
        year: month === 0 ? "numeric" : undefined,
      }).format(start),
      start,
      end,
    });
  }

  return spans;
}

export function getCalendarYearRange(year: number): TimelineRange {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const totalDays = Math.round((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;

  return { start, end, totalDays };
}

export function getRangeFromMonthSpans(spans: MonthSpan[]): TimelineRange | null {
  if (spans.length === 0) return null;

  const start = spans[0].start;
  const end = spans[spans.length - 1].end;
  const totalDays = Math.round((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;

  return { start, end, totalDays };
}

export function getBarPositionInRange(
  bar: GanttStageBar,
  range: TimelineRange
): { leftPercent: number; widthPercent: number } | null {
  const rangeStart = range.start.getTime();
  const rangeEnd = range.end.getTime();

  if (bar.end.getTime() < rangeStart || bar.start.getTime() > rangeEnd) {
    return null;
  }

  const clampedStart = Math.max(bar.start.getTime(), rangeStart);
  const clampedEnd = Math.min(bar.end.getTime(), rangeEnd);
  const totalMs = Math.max(1, rangeEnd - rangeStart);
  const leftPercent = ((clampedStart - rangeStart) / totalMs) * 100;
  const widthPercent = ((clampedEnd - clampedStart) / totalMs) * 100;

  return {
    leftPercent,
    widthPercent: Math.max(widthPercent, 1.5),
  };
}

export function buildCalendarEvents(
  deals: Deal[],
  customRows: ProjectTimelineRow[] = []
): CalendarStageEvent[] {
  return buildGanttRows(deals, customRows).flatMap((row) =>
    row.bars.map((bar) => ({
      dateKey: toDateKey(bar.end),
      dealId: row.dealId,
      dealTitle: row.dealTitle,
      stage: bar.stage,
      isCustom: bar.isCustom,
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
