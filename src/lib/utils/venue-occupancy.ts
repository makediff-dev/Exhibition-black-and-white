import type { Booking, VenueHall } from "../../data/types/index.ts";
import { getPrototypeNowIso } from "../time/now.ts";
import { expandIsoDateRange } from "./venue-date-statuses.ts";

export function getPrototypeMonthRange(nowIso = getPrototypeNowIso()) {
  const [year, month] = nowIso.split("-");
  const lastDay = new Date(Number(year), Number(month), 0).getDate();
  return {
    start: `${year}-${month}-01`,
    end: `${year}-${month}-${String(lastDay).padStart(2, "0")}`,
  };
}

function dateInBooking(date: string, booking: Booking): boolean {
  const start = booking.periodStart ?? booking.date;
  const end = booking.periodEnd ?? start;
  return date >= start && date <= end;
}

function bookingArea(booking: Booking, halls: VenueHall[]): number {
  if (booking.bookedAreaSqm && booking.bookedAreaSqm > 0) return booking.bookedAreaSqm;
  const hall = halls.find((item) => item.id === booking.hallId);
  return hall?.area ?? 0;
}

function isInventoryBlocking(booking: Booking) {
  return booking.status === "confirmed";
}

function isPreliminary(booking: Booking) {
  return booking.status === "pending";
}

function areaDaysForStatus(
  venueId: string,
  halls: VenueHall[],
  bookings: Booking[],
  dates: string[],
  match: (booking: Booking) => boolean
) {
  const venueHalls = halls.filter((hall) => hall.venueId === venueId);
  const totalArea = venueHalls.reduce((sum, hall) => sum + hall.area, 0);
  let areaDays = 0;

  for (const date of dates) {
    const dayArea = bookings
      .filter(
        (booking) =>
          booking.venueId === venueId &&
          match(booking) &&
          dateInBooking(date, booking)
      )
      .reduce((sum, booking) => sum + bookingArea(booking, venueHalls), 0);
    areaDays += Math.min(totalArea, dayArea);
  }

  return { totalArea, areaDays };
}

export function getVenueOccupancyBreakdown(
  venueId: string,
  halls: VenueHall[],
  bookings: Booking[],
  periodStart: string,
  periodEnd: string
) {
  const dates = expandIsoDateRange(periodStart, periodEnd);
  const venueHalls = halls.filter((hall) => hall.venueId === venueId);
  const totalArea = venueHalls.reduce((sum, hall) => sum + hall.area, 0);
  const availableAreaDays = totalArea * dates.length;

  if (!totalArea || dates.length === 0) {
    return {
      percent: 0,
      preliminaryPercent: 0,
      periodStart,
      periodEnd,
      occupiedArea: 0,
      freeArea: 0,
      totalArea,
      bookedAreaDays: 0,
      pendingAreaDays: 0,
      availableAreaDays: 0,
    };
  }

  const confirmed = areaDaysForStatus(venueId, halls, bookings, dates, isInventoryBlocking);
  const pending = areaDaysForStatus(venueId, halls, bookings, dates, isPreliminary);
  const percent = Math.round((confirmed.areaDays / availableAreaDays) * 100);
  const preliminaryPercent = Math.round((pending.areaDays / availableAreaDays) * 100);
  const occupiedArea = Math.round(confirmed.areaDays / dates.length);
  const freeArea = Math.max(0, totalArea - occupiedArea);

  return {
    percent,
    preliminaryPercent,
    periodStart,
    periodEnd,
    occupiedArea,
    freeArea,
    totalArea,
    bookedAreaDays: confirmed.areaDays,
    pendingAreaDays: pending.areaDays,
    availableAreaDays,
  };
}

export function getVenueOccupancyPercent(
  venueId: string,
  halls: VenueHall[],
  bookings: Booking[],
  periodStart: string,
  periodEnd: string
) {
  return getVenueOccupancyBreakdown(venueId, halls, bookings, periodStart, periodEnd);
}

export function getVenueOccupancyByDate(
  venueId: string,
  halls: VenueHall[],
  bookings: Booking[],
  periodStart: string,
  periodEnd: string
): Record<string, number> {
  const dates = expandIsoDateRange(periodStart, periodEnd);
  return Object.fromEntries(
    dates.map((date) => [
      date,
      getVenueOccupancyBreakdown(venueId, halls, bookings, date, date).percent,
    ])
  );
}

export const VENUE_OCCUPANCY_EXPLANATION =
  "Загрузка = арендованные кв.м × дни периода / доступные кв.м × дни. Считаются только подтверждённые брони, которые блокируют инвентарь. Отменённые и отклонённые не входят. Ожидающие — отдельная предварительная загрузка.";
