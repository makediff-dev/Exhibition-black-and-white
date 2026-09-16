"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useAuthStore } from "@/lib/store";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (message: string, type?: Toast["type"]) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_TITLES: Record<Toast["type"], string> = {
  success: "Готово",
  error: "Ошибка",
  info: "Уведомление",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const role = useAuthStore((state) => state.user?.role);
  const useRoleAccent = Boolean(role);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const current = toasts[0];

  const handleClose = () => {
    if (current) removeToast(current.id);
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <Modal
        open={Boolean(current)}
        onClose={handleClose}
        title={current ? TOAST_TITLES[current.type] : "Уведомление"}
        accent={useRoleAccent ? "role" : "teal"}
        footer={
          <Button type="button" variant={useRoleAccent ? "primary" : "teal"} onClick={handleClose}>
            Закрыть
          </Button>
        }
      >
        <p className="text-sm text-gray-700">{current?.message}</p>
      </Modal>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
