"use client";

import { MapPin } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { CITIES } from "@/constants/categories";
import { usePrototypeStore } from "@/lib/store";

export function CityLocationButton({ className }: { className?: string }) {
  const selectedCity = usePrototypeStore((state) => state.selectedCity);
  const setSelectedCity = usePrototypeStore((state) => state.setSelectedCity);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={className}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Выбрать город: ${selectedCity || "не выбран"}`}
        onClick={() => setOpen(true)}
      >
        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate">{selectedCity || "Город"}</span>
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Выбор города">
        <div className="grid gap-2">
          {CITIES.map((city) => (
            <Button
              key={city}
              variant={city === selectedCity ? "primary" : "outline"}
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                setSelectedCity(city);
                setOpen(false);
              }}
            >
              {city}
            </Button>
          ))}
        </div>
      </Modal>
    </>
  );
}
