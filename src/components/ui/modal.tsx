"use client";

import { AccountThemeProvider } from "@/components/account/account-theme-provider";
import type { AccountRole } from "@/constants/account-role-themes";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils/cn";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "./button";
import styles from "./modal.module.css";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  accent?: "role" | "teal";
}

export function Modal({ open, onClose, title, children, footer, wide, accent = "role" }: ModalProps) {
  const role = useAuthStore((state) => state.user?.role) as AccountRole | undefined;
  const useTealAccent = accent === "teal";

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const panel = (
    <div className={cn(styles.panel, wide ? styles.panelWide : styles.panelDefault)}>
      <div className={styles.header}>
        <h2 id="modal-title" className="text-base font-semibold">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Закрыть"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className={styles.body}>{children}</div>
      {footer ? (
        <div className={cn(styles.footer, useTealAccent && styles.footerTeal)}>{footer}</div>
      ) : null}
    </div>
  );

  return createPortal(
    <div
      className={cn(styles.overlay, useTealAccent && "register-accent")}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      {role && !useTealAccent ? (
        <AccountThemeProvider role={role} tokensOnly>
          {panel}
        </AccountThemeProvider>
      ) : (
        panel
      )}
    </div>,
    document.body,
  );
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  accent = "role",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  accent?: "role" | "teal";
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      accent={accent}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button
            variant={accent === "teal" ? "teal" : "primary"}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Подтвердить
          </Button>
        </>
      }
    >
      <p className="text-sm text-gray-700">{message}</p>
    </Modal>
  );
}
