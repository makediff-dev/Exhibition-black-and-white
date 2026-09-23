/** Fixed prototype clock. Not the browser clock. Audit baseline: 23 Sep 2026. */
export const PROTOTYPE_NOW_ISO = "2026-09-23";

let nowOverride: string | null = null;

export function getPrototypeNowIso(): string {
  return nowOverride ?? PROTOTYPE_NOW_ISO;
}

export function getPrototypeNow(): Date {
  const raw = getPrototypeNowIso();
  if (raw.includes("T")) {
    return new Date(raw.endsWith("Z") ? raw : `${raw}Z`);
  }
  return new Date(`${raw}T12:00:00.000Z`);
}

export function getPrototypeNowDateIso(): string {
  return getPrototypeNowIso().slice(0, 10);
}

export function setPrototypeNowIso(isoDate: string | null) {
  nowOverride = isoDate;
}
