"use client";

import { cn } from "@/lib/utils/cn";
import { useFocusTrap, useInertSiblings } from "@/lib/hooks/use-focus-trap";
import { useDialogLayer } from "@/components/ui/dialog-layer";
import { X } from "lucide-react";
import { useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./drawer.module.css";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  side?: "left" | "right" | "bottom";
  closeLabel?: string;
  footer?: ReactNode;
  bodyClassName?: string;
  footerClassName?: string;
  belowHeader?: boolean;
  hideChrome?: boolean;
  fullScreen?: boolean;
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = "right",
  closeLabel = "Закрыть меню",
  footer,
  bodyClassName,
  footerClassName,
  belowHeader = false,
  hideChrome = false,
  fullScreen = false,
}: DrawerProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const { isForeground } = useDialogLayer(open);
  const active = open && isForeground;
  useFocusTrap(active, panelRef, onClose);
  useInertSiblings(active, rootRef);

  if (!active || typeof document === "undefined") return null;

  return createPortal(
    <div ref={rootRef} className={styles.root}>
      <div
        className={cn(styles.backdrop, belowHeader && styles.backdropBelowHeader)}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          styles.panel,
          side === "bottom" && styles.panelBottom,
          side === "right" && styles.panelRight,
          side === "left" && styles.panelLeft,
          fullScreen && styles.panelFull,
          belowHeader && styles.panelBelowHeader,
        )}
      >
        {hideChrome ? (
          <h2 id={titleId} className="sr-only">
            {title}
          </h2>
        ) : (
          <div className={styles.header}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className={styles.close}
              aria-label={closeLabel}
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        )}
        <div className={cn(styles.body, bodyClassName)}>{children}</div>
        {footer ? <div className={cn(styles.footer, footerClassName)}>{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
