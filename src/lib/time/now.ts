/** Injected prototype clock. Demo and tests freeze this instant — never the browser clock. */
export const PROTOTYPE_TIMEZONE = "Europe/Moscow";
export const PROTOTYPE_NOW_ISO = "2026-09-24T12:00:00+03:00";

let nowOverride: string | null = null;

export function getNowIso(): string {
  return nowOverride ?? PROTOTYPE_NOW_ISO;
}

export function getNow(): Date {
  return parseClockInstant(getNowIso());
}

export function getPrototypeNowIso(): string {
  return getNowIso();
}

export function getPrototypeNow(): Date {
  return getNow();
}

export function getPrototypeNowDateIso(): string {
  return getNow().toISOString().slice(0, 10);
}

export function setPrototypeNowIso(isoDate: string | null) {
  nowOverride = isoDate;
}

export function parseClockInstant(raw: string): Date {
  if (raw.includes("T")) {
    if (/[zZ]|[+-]\d{2}:\d{2}$/.test(raw)) {
      return new Date(raw);
    }
    return new Date(`${raw}+03:00`);
  }
  return new Date(`${raw}T12:00:00+03:00`);
}
