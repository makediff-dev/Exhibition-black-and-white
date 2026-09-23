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

export function getVenueOccupancyPercent(
  venueId: string,
  halls: VenueHall[],
  bookings: Booking[],
  periodStart: string,
  periodEnd: string
) {
  const venueHalls = halls.filter((hall) => hall.venueId === venueId);
  const totalArea = venueHalls.reduce((sum, hall) => sum + hall.area, 0);
  const dates = expandIsoDateRange(periodStart, periodEnd);

  if (!totalArea || dates.length === 0) {
    return { percent: 0, periodStart, periodEnd, occupiedArea: 0, totalArea };
  }

  let occupiedAreaDays = 0;
  for (const date of dates) {
    const bookedHallIds = new Set(
      bookings
        .filter(
          (booking) =>
            booking.venueId === venueId &&
            booking.status === "confirmed" &&
            booking.hallId &&
            dateInBooking(date, booking)
        )
        .map((booking) => booking.hallId as string)
    );
    occupiedAreaDays += venueHalls
      .filter((hall) => bookedHallIds.has(hall.id))
      .reduce((sum, hall) => sum + hall.area, 0);
  }

  const percent = Math.round((occupiedAreaDays / (totalArea * dates.length)) * 100);
  const occupiedArea = Math.round((totalArea * percent) / 100);
  return { percent, periodStart, periodEnd, occupiedArea, totalArea };
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
      getVenueOccupancyPercent(venueId, halls, bookings, date, date).percent,
    ])
  );
}
