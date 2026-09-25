import type { Booking, Event, FloorCell, VenueHall } from "../../data/types/index.ts";
import { canBookEvent } from "../state/event-machine.ts";
import { dateFromPrototypeNow, inclusiveDayCount } from "../time/relative-date.ts";

export interface EventStandQuote {
  cellId: string;
  label: string;
  hallName: string;
  planLocation: string;
  widthMeters: number | null;
  lengthMeters: number | null;
  areaSqm: number | null;
  pricePerSqm: number | null;
  totalPrice: number | null;
  taxNote: string;
  powerKw: number | null;
  constraints: string;
  dateFrom: string;
  dateTo: string;
  durationDays: number;
  holdUntil: string;
  cancellationTerms: string;
  confirmActor: string;
  afterSubmit: string;
  occupied: boolean;
  eventCompleted: boolean;
  blockedReason?: string;
}

const DEFAULT_CANCEL =
  "До подтверждения организатором отмена бесплатна. После подтверждения — по регламенту мероприятия.";

function inventoryBlocks(status: Booking["status"]) {
  return status === "confirmed" || status === "pending";
}

export function isStandOccupiedForEvent(
  cell: FloorCell,
  event: Event,
  bookings: Booking[]
): boolean {
  if (cell.status === "booked" || cell.status === "unavailable") return true;
  return bookings.some(
    (booking) =>
      booking.cellId === cell.id &&
      booking.eventId === event.id &&
      inventoryBlocks(booking.status)
  );
}

export function buildEventStandQuote(
  event: Event,
  cell: FloorCell,
  hall: VenueHall | undefined,
  bookings: Booking[],
  nowDate?: string
): EventStandQuote {
  const occupied = isStandOccupiedForEvent(cell, event, bookings);
  const eventCompleted = !canBookEvent(event);
  const areaSqm = cell.areaSqm ?? null;
  const pricePerSqm = cell.pricePerSqm ?? null;
  const totalPrice =
    areaSqm != null && pricePerSqm != null && pricePerSqm > 0 ? areaSqm * pricePerSqm : null;
  const holdUntil = dateFromPrototypeNow(2, nowDate);
  const durationDays = inclusiveDayCount(event.startDate, event.endDate);
  const taxNote = cell.taxNote ?? "";
  const constraints = hall?.constraints ?? "";
  const powerKw = cell.powerKw ?? hall?.powerKw ?? null;

  let blockedReason: string | undefined;
  if (eventCompleted) {
    blockedReason = "Мероприятие завершено. Новое бронирование недоступно.";
  } else if (occupied) {
    blockedReason = "Участок уже занят или недоступен.";
  } else if (totalPrice == null) {
    blockedReason = "Цена участка не рассчитана.";
  } else if (!taxNote.trim() || !constraints.trim() || powerKw == null) {
    blockedReason = "Не заполнены обязательные условия участка.";
  }

  return {
    cellId: cell.id,
    label: cell.label,
    hallName: hall?.name ?? "Зал не указан",
    planLocation: cell.planCoords ?? hall?.planCoords ?? "координаты на плане уточняются",
    widthMeters: cell.widthMeters ?? null,
    lengthMeters: cell.lengthMeters ?? null,
    areaSqm,
    pricePerSqm,
    totalPrice,
    taxNote: taxNote || "не указаны",
    powerKw,
    constraints: constraints || "не указаны",
    dateFrom: event.startDate,
    dateTo: event.endDate,
    durationDays,
    holdUntil,
    cancellationTerms: DEFAULT_CANCEL,
    confirmActor: "Организатор мероприятия в течение 2 рабочих дней",
    afterSubmit:
      "После подтверждения заявка уйдёт организатору, участок удерживается до указанной даты, статус — ожидает подтверждения.",
    occupied,
    eventCompleted,
    blockedReason,
  };
}

export function canSubmitEventStandQuote(quote: EventStandQuote): boolean {
  return !quote.blockedReason;
}
