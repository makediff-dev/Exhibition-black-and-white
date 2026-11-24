"use client";

import { AccountThemeProvider } from "@/components/account/account-theme-provider";
import type { AccountRole } from "@/constants/account-role-themes";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils/cn";
import { X } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useFocusTrap, useInertSiblings } from "@/lib/hooks/use-focus-trap";
import { useDialogLayer } from "@/components/ui/dialog-layer";
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
  variant?: "default" | "contact";
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
  accent = "role",
  variant = "default",
}: ModalProps) {
  const role = useAuthStore((state) => state.user?.role) as AccountRole | undefined;
  const useTealAccent = accent === "teal";
  const isContact = variant === "contact";
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const { isForeground } = useDialogLayer(open);
  const [present, setPresent] = useState(open);
  const [closing, setClosing] = useState(false);
  const active = open && isForeground && !closing;
  useFocusTrap(active, panelRef, onClose);
  useInertSiblings(active, rootRef);

  useEffect(() => {
    if (open) {
      setPresent(true);
      setClosing(false);
      return;
    }
    if (!present) return;
    const isMobileSheet = isContact && window.matchMedia("(max-width: 1180px)").matches;
    if (!isMobileSheet) {
      setPresent(false);
      setClosing(false);
      return;
    }
    setClosing(true);
    const timer = window.setTimeout(() => {
      setPresent(false);
      setClosing(false);
    }, 280);
    return () => window.clearTimeout(timer);
  }, [isContact, open, present]);

  useEffect(() => {
    if (!present || !isContact || typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 1180px)").matches) return;
    document.documentElement.classList.add("how-it-works-sheet-open");
    return () => document.documentElement.classList.remove("how-it-works-sheet-open");
  }, [isContact, present]);

  if (!present || typeof document === "undefined") return null;

  const sizeClass = isContact ? styles.panelContact : wide ? styles.panelWide : styles.panelDefault;
  const panel = (
    <div className={cn(styles.panel, isContact && styles.panelSurfaceContact)} ref={panelRef}>
      <div className={cn(styles.header, isContact && styles.headerContact)}>
        <h2 id={titleId} className={cn(styles.title, isContact && styles.titleContact)}>
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className={cn(styles.closeButton, isContact && styles.closeButtonContact)}
          aria-label="Закрыть"
        >
          {isContact ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt=""
              className={styles.closeIconContact}
              height={24}
              src="/how-it-works/contact-modal-close.svg"
              width={24}
            />
          ) : (
            <X className={styles.closeIcon} />
          )}
        </button>
      </div>
      <div className={cn(styles.body, isContact && styles.bodyContact)}>{children}</div>
      {footer ? (
        <div className={cn(styles.footer, useTealAccent && styles.footerTeal)}>{footer}</div>
      ) : null}
    </div>
  );

  return createPortal(
    <div
      ref={rootRef}
      className={cn(
        styles.overlay,
        isContact && styles.overlayContact,
        closing && styles.overlayContactClosing,
        useTealAccent && "register-accent",
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className={cn(styles.backdrop, isContact && styles.backdropContact)}
        onClick={onClose}
        aria-hidden="true"
      />
      {role && !useTealAccent ? (
        <AccountThemeProvider role={role} tokensOnly className={cn(styles.panelHost, sizeClass)}>
          {panel}
        </AccountThemeProvider>
      ) : (
        <div className={cn(styles.panelHost, sizeClass)}>{panel}</div>
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
