"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  persistent?: boolean;
  placement?: "top" | "bottom";
}

export function Tooltip({
  content,
  children,
  persistent = false,
  placement = "top",
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!persistent || !open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [persistent, open]);

  const placementClasses =
    placement === "bottom"
      ? "top-full left-0 mt-2"
      : "bottom-full left-1/2 mb-2 -translate-x-1/2";

  const visibilityClasses = persistent
    ? open
      ? "opacity-100 pointer-events-auto"
      : "opacity-0 pointer-events-none"
    : "pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100";

  return (
    <span ref={rootRef} className="relative inline-flex group">
      <span
        className="inline-flex"
        onClick={
          persistent
            ? (event) => {
                event.stopPropagation();
                setOpen((value) => !value);
              }
            : undefined
        }
      >
        {children}
      </span>
      <span
        role="tooltip"
        className={cn(
          "absolute z-20 w-64 border border-gray-300 bg-white p-2 text-xs leading-snug text-gray-600 shadow-sm transition-opacity",
          placementClasses,
          visibilityClasses
        )}
      >
        {content}
      </span>
    </span>
  );
}
