import { cn } from "@/lib/utils/cn";
import type { ComponentPropsWithoutRef } from "react";

export interface CardProps extends ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
}

export function Card({ children, className, onClick, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "border border-gray-300 bg-white p-4 rounded-[10px]",
        onClick && "cursor-pointer hover:border-gray-900",
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
