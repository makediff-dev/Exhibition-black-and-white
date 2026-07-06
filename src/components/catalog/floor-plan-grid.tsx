"use client";

import { cn } from "@/lib/utils/cn";
import type { FloorCell } from "@/data/types";

const STATUS_STYLES: Record<FloorCell["status"], { label: string; className: string }> = {
  free: { label: "Свободно", className: "bg-white border-gray-300 hover:border-gray-900 cursor-pointer" },
  selected: { label: "Выбрано", className: "bg-gray-200 border-gray-900 border-2" },
  booked: { label: "Забронировано", className: "bg-gray-400 text-white border-gray-600 cursor-not-allowed" },
  unavailable: { label: "Недоступно", className: "bg-gray-100 border-dashed border-gray-400 cursor-not-allowed opacity-60" },
};

interface Props {
  cells: FloorCell[];
  onCellClick?: (id: string, status: FloorCell["status"]) => void;
  selectedId?: string;
}

export function FloorPlanGrid({ cells, onCellClick, selectedId }: Props) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
      {cells.map((cell) => {
        const style = STATUS_STYLES[cell.status];
        return (
          <button
            key={cell.id}
            type="button"
            disabled={cell.status === "booked" || cell.status === "unavailable"}
            onClick={() => onCellClick?.(cell.id, cell.status)}
            className={cn(
              "aspect-square border flex flex-col items-center justify-center text-xs p-1 transition-colors",
              style.className,
              selectedId === cell.id && "ring-2 ring-gray-900"
            )}
          >
            <span className="font-medium">{cell.label}</span>
            <span className="text-[10px] opacity-70">{style.label}</span>
          </button>
        );
      })}
    </div>
  );
}
