"use client";

import { useAuthStore, resetAllStores, usePrototypeStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Beaker, X } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";
import type { UserRole } from "@/data/types";
import styles from "./demo-menu.module.css";

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
    <div className={styles.root}>
      <button
        type="button"
        className={styles.fab}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="demo-prototype-panel"
        aria-label="Инструмент прототипа: смена демо-роли"
      >
        {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Beaker className="h-5 w-5" aria-hidden="true" />}
      </button>
      {open ? (
        <div id="demo-prototype-panel" className={styles.panel}>
          <p className={styles.caption}>Быстрый вход</p>
          {DEMO_ROLES.map(({ role, label }) => (
            <Button key={role} variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleLogin(role)}>
              {label}
            </Button>
          ))}
          <div className={styles.divider} />
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleReset}>
            Сбросить mock-данные
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleRestore}>
            Вернуть исходные статусы
          </Button>
        </div>
      ) : null}
    </div>
  );
}
