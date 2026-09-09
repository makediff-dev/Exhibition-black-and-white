"use client";

import { useAccountTheme } from "@/components/account/account-theme-provider";
import { cn } from "@/lib/utils/cn";
import type { ComponentPropsWithoutRef } from "react";
import styles from "./card.module.css";

export interface CardProps extends ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
  /** Enable border hover when the whole card navigates somewhere (link wrapper or onClick). */
  hoverable?: boolean;
  /** Accent border on hover for cards with interactive children inside. */
  borderHover?: boolean;
  /** Remove default padding so media can sit flush to the card edge. */
  flush?: boolean;
}

export function Card({ children, className, onClick, hoverable, borderHover, flush, ...props }: CardProps) {
  const accountTheme = useAccountTheme();
  const isHoverable = hoverable ?? Boolean(onClick);

  return (
    <div
      data-border-hover={borderHover ? "true" : undefined}
      data-card-hoverable={isHoverable ? "true" : undefined}
      className={cn(
        styles.root,
        flush && styles.flush,
        "border border-gray-300 bg-white",
        accountTheme ? "rounded-card" : "rounded-[10px]",
        isHoverable && styles.hoverable,
        borderHover && styles.borderHover,
        className,
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn("text-base font-semibold text-gray-900", className)}>{children}</h3>;
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-sm text-gray-600 mt-1", className)}>{children}</p>;
}
