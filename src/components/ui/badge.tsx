import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "solid" | "outline" | "dashed";
  icon?: LucideIcon;
  className?: string;
}

export function Badge({ children, variant = "outline", icon: Icon, className }: BadgeProps) {
  const variants = {
    solid: "bg-gray-900 text-white border-gray-900",
    outline: "bg-white text-gray-900 border-gray-900",
    dashed: "bg-gray-50 text-gray-700 border-dashed border-gray-500",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[10px] border px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
}
