"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface BackButtonProps {
  label?: string;
  fallbackHref?: string;
  className?: string;
  onClick?: () => void;
}

export function BackButton({
  label = "Назад",
  fallbackHref,
  className,
  onClick,
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    if (fallbackHref) {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-1 text-sm underline hover:text-gray-900",
        className
      )}
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
