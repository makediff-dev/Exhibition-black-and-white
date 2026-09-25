import { getNow, parseClockInstant } from "../time/now.ts";

export type DeadlineRelation = "before" | "on" | "after";

export function compareToDeadline(
  deadline: string | undefined | null,
  now = getNow()
): DeadlineRelation | null {
  if (!deadline) return null;

  const end = deadline.includes("/") ? deadline.split("/")[1] : deadline;
  const deadlineDate = end.includes("T")
    ? parseClockInstant(end)
    : parseClockInstant(`${end.slice(0, 10)}T23:59:59+03:00`);

  if (Number.isNaN(deadlineDate.getTime())) return null;

  const nowMs = now.getTime();
  const endMs = deadlineDate.getTime();
  const nowDay = now.toISOString().slice(0, 10);
  const endDay = deadlineDate.toISOString().slice(0, 10);

  if (!end.includes("T") && nowDay === endDay) return "on";
  if (nowMs < endMs) return nowDay === endDay ? "on" : "before";
  if (nowMs === endMs) return "on";
  return "after";
}

export function isDeadlineReached(
  deadline: string | undefined | null,
  now = getNow()
): boolean {
  return compareToDeadline(deadline, now) === "after";
}

export function isOnOrAfterDeadline(
  deadline: string | undefined | null,
  now = getNow()
): boolean {
  const relation = compareToDeadline(deadline, now);
  return relation === "on" || relation === "after";
}

export function addDaysIso(isoDate: string, days: number): string {
  const date = parseClockInstant(`${isoDate.slice(0, 10)}T12:00:00+03:00`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
