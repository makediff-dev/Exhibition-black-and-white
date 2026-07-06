"use client";

import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmModal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast-provider";
import { SEED_EVENTS } from "@/data/mocks/seed";
import type { FloorCell } from "@/data/types";
import { useAuthStore, usePrototypeStore } from "@/lib/store";

function cellClass(status: FloorCell["status"], isSelected: boolean) {
  if (isSelected) return "bg-gray-900 text-white border-gray-900 cursor-pointer";
  switch (status) {
    case "free":
      return "bg-white border-gray-300 hover:border-gray-900 cursor-pointer";
    case "booked":
      return "bg-gray-400 text-white border-gray-400 cursor-not-allowed";
    case "unavailable":
      return "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed";
    default:
      return "bg-gray-100 border-gray-900";
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
      <div className="flex flex-col min-h-screen">
        <PublicHeader />
        <main className="flex-1 mx-auto max-w-3xl px-4 py-12 text-center">
          <h1 className="text-xl font-bold mb-2">Бронирование недоступно</h1>
          <p className="text-sm text-gray-600 mb-4">Для этого мероприятия бронирование площадей не предусмотрено.</p>
          <Link href={`/events/${event.id}`}><Button>К мероприятию</Button></Link>
        </main>
        <Footer />
      </div>
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
    <div className="flex flex-col min-h-screen">
      <PublicHeader />

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-8">
        <Link href={`/events/${event.id}`} className="text-sm underline mb-4 inline-block">← {event.title}</Link>

        <h1 className="text-2xl font-bold mb-2">Бронирование площади</h1>
        <p className="text-sm text-gray-600 mb-6">
          {event.city} · {event.venue} · Выберите свободную ячейку на плане
        </p>

        <div className="flex flex-wrap gap-3 mb-6 text-xs">
          <Badge variant="outline">Свободно</Badge>
          <Badge variant="solid">Выбрано</Badge>
          <Badge variant="dashed">Занято / недоступно</Badge>
        </div>

        <div className="grid grid-cols-6 gap-2 max-w-lg mb-6">
          {floorCells.map((cell) => {
            const isSelected = cell.id === selectedCellId;
            return (
              <button
                key={cell.id}
                type="button"
                disabled={cell.status !== "free"}
                onClick={() => handleCellClick(cell)}
                className={`aspect-square flex items-center justify-center text-xs border font-medium transition-colors ${cellClass(cell.status, isSelected)}`}
                aria-label={`Ячейка ${cell.label}`}
              >
                {cell.label}
              </button>
            );
          })}
        </div>

        {selectedCell && (
          <div className="border border-gray-900 bg-gray-50 p-4 mb-6">
            <p className="text-sm font-medium">Выбрана площадь: {selectedCell.label}</p>
            <p className="text-xs text-gray-600 mt-1">Зал: Павильон 1 · Статус: свободна</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            disabled={!selectedCellId}
            onClick={() => setConfirmOpen(true)}
          >
            Забронировать
          </Button>
          <Link href={`/events/${event.id}`}>
            <Button variant="outline">Отмена</Button>
          </Link>
        </div>
      </main>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleBook}
        title="Подтверждение бронирования"
        message={`Забронировать площадь ${selectedCell?.label ?? ""} на мероприятие «${event.title}»?`}
      />

      <Footer />
    </div>
  );
}
