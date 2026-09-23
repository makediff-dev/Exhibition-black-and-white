import type { Booking } from "../../data/types/index.ts";

export function rangesOverlap(startA: string, endA: string, startB: string, endB: string) {
  return startA <= endB && startB <= endA;
}

export function isHallOccupied(
  bookings: Booking[],
  hallId: string,
  start: string,
  end: string,
  exceptBookingId?: string
) {
  return bookings.some((booking) => {
    if (booking.hallId !== hallId) return false;
    if (booking.status !== "confirmed") return false;
    if (exceptBookingId && booking.id === exceptBookingId) return false;
    const bookingStart = booking.periodStart ?? booking.date;
    const bookingEnd = booking.periodEnd ?? bookingStart;
    return rangesOverlap(start, end, bookingStart, bookingEnd);
  });
}
