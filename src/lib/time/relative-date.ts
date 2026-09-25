import { getPrototypeNowDateIso, parseClockInstant } from "./now.ts";

/** Shift a YYYY-MM-DD (or clock ISO) date by whole days without using the browser clock. */
export function shiftIsoDate(isoDate: string, days: number): string {
  const base = isoDate.includes("T") ? isoDate.slice(0, 10) : isoDate;
  const next = parseClockInstant(`${base}T12:00:00+03:00`);
  next.setDate(next.getDate() + days);
  const year = next.getFullYear();
  const month = String(next.getMonth() + 1).padStart(2, "0");
  const day = String(next.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function dateFromPrototypeNow(days: number, nowDate = getPrototypeNowDateIso()): string {
  return shiftIsoDate(nowDate, days);
}

export function inclusiveDayCount(start: string, end: string): number {
  if (!start) return 0;
  const from = parseClockInstant(`${start}T12:00:00+03:00`);
  const to = parseClockInstant(`${(end || start)}T12:00:00+03:00`);
  const diff = Math.round((to.getTime() - from.getTime()) / 86_400_000);
  return Math.max(0, diff) + 1;
}
