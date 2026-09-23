"use client";

import { useAuthStore, resetAllStores, usePrototypeStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Beaker, ChevronDown } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";
import type { UserRole } from "@/data/types";

const DEMO_ROLES: { role: UserRole; label: string }[] = [
  { role: "customer", label: "Заказчик" },
  { role: "contractor", label: "Исполнитель" },
  { role: "venue", label: "Площадка" },
  { role: "organizer", label: "Организатор" },
];

export function DemoMenu() {
  const [open, setOpen] = useState(false);
  const login = useAuthStore((s) => s.login);
  const router = useRouter();
  const { showToast } = useToast();
  const resetToSeed = usePrototypeStore((s) => s.resetToSeed);

  const handleLogin = (role: UserRole) => {
    if (!role) return;
    login(role);
    showToast(`Вход как ${DEMO_ROLES.find((r) => r.role === role)?.label}`);
    router.push(`/account/${role}`);
    setOpen(false);
  };

  const handleReset = () => {
    resetAllStores();
    showToast("Данные сброшены к исходным", "info");
    router.push("/");
    setOpen(false);
  };

  const handleRestore = () => {
    resetToSeed();
    showToast("Статусы сценариев восстановлены", "info");
    setOpen(false);
  };

  return (
    <div className="fixed bottom-4 left-4 z-[90]">
      <div className="border-2 border-dashed border-gray-500 bg-gray-100 shadow-md">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 w-full"
          aria-expanded={open}
          aria-label="Инструмент прототипа: смена демо-роли"
        >
          <Beaker className="h-4 w-4" />
          <span>Демо (инструмент прототипа)</span>
          <ChevronDown className={`h-3 w-3 ml-auto transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="border-t border-dashed border-gray-400 p-2 space-y-1">
            <p className="text-[10px] text-gray-500 px-1 mb-1">Быстрый вход:</p>
            {DEMO_ROLES.map(({ role, label }) => (
              <Button key={role} variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleLogin(role)}>
                {label}
              </Button>
            ))}
            <div className="border-t border-dashed border-gray-300 my-1" />
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleReset}>
              Сбросить mock-данные
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleRestore}>
              Вернуть исходные статусы
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}