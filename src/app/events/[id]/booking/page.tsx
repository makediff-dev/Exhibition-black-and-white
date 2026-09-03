"use client";

import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { CabinetAwareLayout } from "@/components/layout/cabinet-aware-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmModal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast-provider";
import { SEED_EVENTS } from "@/data/mocks/seed";
import type { FloorCell } from "@/data/types";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { cn } from "@/lib/utils/cn";

function cellClass(status: FloorCell["status"], isSelected: boolean) {
  if (isSelected) {
    return "booking-cell-selected cursor-pointer";
  }

  switch (status) {
    case "free":
      return "booking-cell-free bg-white border-gray-300 cursor-pointer";
    case "booked":
      return "bg-gray-400 text-white border-gray-400 cursor-not-allowed";
    case "unavailable":
      return "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed";
    default:
      return "bg-gray-100 border-gray-300";
  }
}

export default function EventBookingPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const id = params.id as string;
  const event = SEED_EVENTS.find((e) => e.id === id);

  const { floorCells, updateFloorCell, addBooking } = usePrototypeStore();
  const { isAuthenticated, user } = useAuthStore();

  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!event) notFound();

  if (!event.bookingAvailable) {
    return (
      <CabinetAwareLayout
        title="Бронирование недоступно"
        description="Для этого мероприятия бронирование площадей не предусмотрено."
        showBack
        backFallbackHref={`/events/${event.id}`}
        activeNavSlug="my-events"
      >
        <Link href={`/events/${event.id}`}>
          <Button>К мероприятию</Button>
        </Link>
      </CabinetAwareLayout>
    );
  }

  const selectedCell = floorCells.find((c) => c.id === selectedCellId);

  const handleCellClick = (cell: FloorCell) => {
    if (cell.status !== "free") return;
    setSelectedCellId(cell.id);
  };

  const handleBook = () => {
    if (!selectedCellId || !selectedCell) return;

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
      cellId: selectedCellId,
      customerId: user.id,
      status: "pending",
      date: new Date().toISOString().split("T")[0],
    });
    updateFloorCell(selectedCellId, "booked");
    setConfirmOpen(false);
    showToast(`Площадь ${selectedCell.label} забронирована`, "success");
    router.push(`/events/${event.id}`);
  };

  return (
    <CabinetAwareLayout
      title="Бронирование площади"
      description={`${event.city} · ${event.venue} · Выберите свободную ячейку на плане`}
      showBack
      backFallbackHref={`/events/${event.id}`}
      activeNavSlug="my-events"
    >
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <div className="mb-6 flex flex-wrap gap-3 text-xs">
            <Badge variant="outline">Свободно</Badge>
            <Badge variant="solid">Выбрано</Badge>
            <Badge variant="dashed">Занято / недоступно</Badge>
          </div>

          <div className="grid max-w-2xl grid-cols-6 gap-2">
            {floorCells.map((cell) => {
              const isSelected = cell.id === selectedCellId;
              return (
                <button
                  key={cell.id}
                  type="button"
                  disabled={cell.status !== "free"}
                  onClick={() => handleCellClick(cell)}
                  className={cn(
                    "booking-cell flex aspect-square items-center justify-center border text-xs font-medium transition-colors",
                    cellClass(cell.status, isSelected),
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
            {selectedCell ? (
              <div className="booking-selection-box p-4">
                <p className="text-sm font-semibold text-gray-900">
                  Выбрана площадь: {selectedCell.label}
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  Зал: Павильон 1 · Статус: свободна
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                Выберите свободную ячейку на плане слева, чтобы продолжить бронирование.
              </p>
            )}

            <Button
              className={cn(
                "w-full !border-[#2939eb] !bg-[#2939eb] !text-white",
                "hover:!border-[#2230c7] hover:!bg-[#2230c7]",
              )}
              disabled={!selectedCellId}
              onClick={() => setConfirmOpen(true)}
            >
              Забронировать
            </Button>
            <Link href={`/events/${event.id}`} className="block">
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
        title="Подтверждение бронирования"
        message={`Забронировать площадь ${selectedCell?.label ?? ""} на мероприятие «${event.title}»?`}
      />
    </CabinetAwareLayout>
  );
}
