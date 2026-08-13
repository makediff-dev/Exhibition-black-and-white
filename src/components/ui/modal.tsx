"use client";

import { cn } from "@/lib/utils/cn";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Button } from "./button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}

export function Modal({ open, onClose, title, children, footer, wide }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/50" onClick={onClose} />
      <div className={cn("relative z-10 w-full border border-gray-900 bg-white shadow-lg", wide ? "max-w-2xl" : "max-w-lg")}>
        <div className="flex items-center justify-between border-b border-gray-300 px-4 py-3">
          <h2 className="text-base font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100" aria-label="Закрыть">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-4 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && <div className="border-t border-gray-300 px-4 py-3 flex gap-2 justify-end">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={() => { onConfirm(); onClose(); }}>Подтвердить</Button>
        </>
      }
    >
      <p className="text-sm text-gray-700">{message}</p>
    </Modal>
  );
}
