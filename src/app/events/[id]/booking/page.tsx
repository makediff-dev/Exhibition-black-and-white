"use client";

import Link from "next/link";
import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { CabinetAwareLayout } from "@/components/layout/cabinet-aware-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardField } from "@/components/ui/card-field";
import { ConfirmModal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast-provider";
import { SEED_EVENTS, SEED_HALLS } from "@/data/mocks/seed";
import type { FloorCell } from "@/data/types";
import { buildEventStandQuote, canSubmitEventStandQuote } from "@/lib/domain/booking-quote";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { cn } from "@/lib/utils/cn";
import { formatPrice, formatShortDate } from "@/lib/utils/formatters";
import { getCabinetBackHref, withFromParam } from "@/lib/utils/message-related-links";
import { canBookEvent } from "@/lib/state/event-machine";
import { getPrototypeNowDateIso } from "@/lib/time/now";

function cellClass(status: FloorCell["status"], isSelected: boolean, occupied: boolean) {
  if (isSelected) {
    return "booking-cell-selected cursor-pointer";
  }
  if (occupied || status !== "free") {
    return status === "booked"
      ? "bg-gray-400 text-white border-gray-400 cursor-not-allowed"
      : "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed";
  }
  return "booking-cell-free bg-white border-gray-300 cursor-pointer";
}

export default function EventBookingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const { showToast } = useToast();
  const id = params.id as string;
  const event = SEED_EVENTS.find((e) => e.id === id);

  const { floorCells, bookings, updateFloorCell, addBooking } = usePrototypeStore();
  const { isAuthenticated, user } = useAuthStore();

  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!event) notFound();

  const eventHref = from ? withFromParam(`/events/${event.id}`, from) : `/events/${event.id}`;
  const venueHallIds = useMemo(
    () => new Set(SEED_HALLS.filter((hall) => hall.venueId === event.venueId).map((hall) => hall.id)),
    [event.venueId],
  );
  const planCells = useMemo(
    () => floorCells.filter((cell) => venueHallIds.has(cell.hallId)),
    [floorCells, venueHallIds],
  );

  if (!canBookEvent(event)) {
    return (
      <CabinetAwareLayout
        title="Бронирование недоступно"
        description={
          event.bookingAvailable
            ? "Мероприятие уже завершено. Новое бронирование недоступно."
            : "Для этого мероприятия бронирование площадей не предусмотрено."
        }
        showBack
        backFallbackHref={getCabinetBackHref(from, eventHref, user?.role)}
      >
        <Link href={eventHref}>
          <Button variant="teal">К мероприятию</Button>
        </Link>
      </CabinetAwareLayout>
    );
  }

  const selectedCell = planCells.find((c) => c.id === selectedCellId);
  const selectedHall = selectedCell
    ? SEED_HALLS.find((hall) => hall.id === selectedCell.hallId)
    : undefined;
  const quote = selectedCell
    ? buildEventStandQuote(event, selectedCell, selectedHall, bookings)
    : null;
  const canSubmit = quote ? canSubmitEventStandQuote(quote) : false;

  const handleCellClick = (cell: FloorCell) => {
    const occupied = buildEventStandQuote(
      event,
      cell,
      SEED_HALLS.find((hall) => hall.id === cell.hallId),
      bookings,
    ).occupied;
    if (occupied) return;
    setSelectedCellId(cell.id);
  };

  const handleBook = () => {
    if (!selectedCellId || !selectedCell || !quote || !canSubmit) return;

    if (!isAuthenticated || !user) {
      showToast("Войдите в систему для бронирования", "info");
      router.push("/login");
      return;
    }

    const bookingId = `book-${Date.now()}`;
    addBooking({
      id: bookingId,
      eventId: event.id,
      venueId: event.venueId,
      hallId: selectedCell.hallId,
      cellId: selectedCellId,
      bookedAreaSqm: quote.areaSqm ?? undefined,
      customerId: user.id,
      status: "pending",
      date: getPrototypeNowDateIso(),
      periodType: "event",
      periodStart: event.startDate,
      periodEnd: event.endDate,
      holdUntil: quote.holdUntil,
      cancellationTerms: quote.cancellationTerms,
    });
    updateFloorCell(selectedCellId, "booked");
    setConfirmOpen(false);
    showToast(`Площадь ${selectedCell.label} забронирована`, "success");
    router.push(eventHref);
  };

  return (
    <CabinetAwareLayout
      title="Бронирование площади"
      description={`${event.city} · ${event.venue} · Выберите свободную ячейку на плане`}
      showBack
      backFallbackHref={getCabinetBackHref(from, eventHref, user?.role)}
    >
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <div className="mb-6 flex flex-wrap gap-3 text-xs">
            <Badge variant="outline">Свободно</Badge>
            <Badge variant="solid">Выбрано</Badge>
            <Badge variant="dashed">Занято / недоступно</Badge>
          </div>

          <div className="grid max-w-2xl grid-cols-6 gap-2">
            {planCells.map((cell) => {
              const isSelected = cell.id === selectedCellId;
              const occupied = buildEventStandQuote(
                event,
                cell,
                SEED_HALLS.find((hall) => hall.id === cell.hallId),
                bookings,
              ).occupied;
              return (
                <button
                  key={cell.id}
                  type="button"
                  disabled={occupied}
                  onClick={() => handleCellClick(cell)}
                  className={cn(
                    "booking-cell flex aspect-square items-center justify-center border text-xs font-medium transition-colors",
                    cellClass(cell.status, isSelected, occupied),
                  )}
                  aria-label={`Ячейка ${cell.label}`}
                  aria-pressed={isSelected}
                >
                  {cell.label}
                </button>
              );
            })}
          </div>
        </div>

        <aside>
          <div className="catalog-content-box sticky top-20 space-y-4 p-4">
            {quote ? (
              <div className="space-y-3 rounded-[10px] border border-[#28b5b3] bg-[#eaf8f7] p-4">
                <p className="text-sm font-semibold text-gray-900">
                  Выбрана площадь: {quote.label}
                </p>
                <div className="space-y-[10px] text-xs text-gray-700">
                  <CardField label="Код и расположение на плане">
                    {quote.label} · {quote.planLocation}
                  </CardField>
                  <CardField label="Зал">{quote.hallName}</CardField>
                  <CardField label="Размеры и площадь">
                    {quote.widthMeters ?? "—"}×{quote.lengthMeters ?? "—"} м ·{" "}
                    {quote.areaSqm != null ? `${quote.areaSqm} кв.м` : "не указана"}
                  </CardField>
                  <CardField label="Ставка и итоговая стоимость">
                    {quote.totalPrice != null && quote.pricePerSqm != null
                      ? `${formatPrice(quote.pricePerSqm)} / кв.м · ${formatPrice(quote.totalPrice)}`
                      : "Цена не рассчитана"}
                  </CardField>
                  <CardField label="Налоги и сборы">{quote.taxNote}</CardField>
                  <CardField label="Мощность и ограничения">
                    {quote.powerKw != null ? `${quote.powerKw} кВт` : "—"}. {quote.constraints}
                  </CardField>
                  <CardField label="Даты и длительность">
                    {formatShortDate(quote.dateFrom)} — {formatShortDate(quote.dateTo)} ·{" "}
                    {quote.durationDays} дн.
                  </CardField>
                  <CardField label="Удержание">до {formatShortDate(quote.holdUntil)}</CardField>
                  <CardField label="Отмена">{quote.cancellationTerms}</CardField>
                  <CardField label="Кто подтверждает">{quote.confirmActor}</CardField>
                  <CardField label="После нажатия">{quote.afterSubmit}</CardField>
                </div>
                {quote.blockedReason ? (
                  <p className="text-xs text-gray-700">{quote.blockedReason}</p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                Выберите свободную ячейку на плане слева, чтобы продолжить бронирование.
              </p>
            )}

            <Button
              className="w-full"
              variant="teal"
              disabled={!canSubmit}
              onClick={() => setConfirmOpen(true)}
            >
              Забронировать
            </Button>
            <Link href={eventHref} className="block">
              <Button className="w-full" variant="soft-outline">
                Отмена
              </Button>
            </Link>
          </div>
        </aside>
      </div>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleBook}
        accent="teal"
        title="Подтверждение бронирования"
        message={
          quote
            ? `Забронировать ${quote.label} (${quote.hallName}, ${quote.areaSqm ?? "—"} кв.м, ${
                quote.totalPrice != null ? formatPrice(quote.totalPrice) : "без цены"
              }) на «${event.title}» с ${formatShortDate(quote.dateFrom)} по ${formatShortDate(quote.dateTo)}? ${quote.afterSubmit}`
            : `Забронировать площадь на мероприятие «${event.title}»?`
        }
      />
    </CabinetAwareLayout>
  );
}
