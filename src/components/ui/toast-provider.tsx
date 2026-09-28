"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import styles from "./toast-provider.module.css";

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

export function ToastProvider({ children }: { children: ReactNode }) {
  const role = useAuthStore((state) => state.user?.role);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const current = toasts[0];

  useEffect(() => {
    if (!current) return;
    const timer = window.setTimeout(() => removeToast(current.id), 5000);
    return () => window.clearTimeout(timer);
  }, [current, removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {current ? (
        <div
          className={styles.region}
          role="status"
          aria-live="polite"
          data-role={role || "guest"}
        >
          <p className={styles.message}>{current.message}</p>
          <button
            type="button"
            className={styles.close}
            onClick={() => removeToast(current.id)}
            aria-label="Закрыть уведомление"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
