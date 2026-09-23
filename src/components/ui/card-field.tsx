import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

interface CardFieldProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function CardField({ label, children, className }: CardFieldProps) {
  return (
    <p className={cn("text-sm text-left text-gray-500", className)}>
      <span className="font-medium text-gray-900">{label}: </span>
      {children}
    </p>
  );
}
