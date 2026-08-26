import { cn } from "@/lib/utils/cn";
import { type ButtonHTMLAttributes, forwardRef } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "soft-outline"
  | "ghost"
  | "teal"
  | "blue"
  | "green"
  | "purple"
  | "pink";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const variants: Record<ButtonVariant, string> = {
      primary: "bg-gray-900 text-white hover:bg-gray-800 border border-gray-900",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300",
      outline: "bg-white text-gray-900 hover:bg-gray-50 border border-gray-900",
      "soft-outline": "bg-white text-[#101828] hover:text-[#171717] border border-[#d4d4d4] hover:border-[#171717]",
      ghost: "bg-transparent text-gray-900 hover:bg-gray-100 border-0",
      teal: "bg-[#28b5b3] text-white hover:bg-[#1f9696] border border-[#28b5b3]",
      blue: "bg-[#2939eb] text-white hover:bg-[#2230c7] border border-[#2939eb]",
      green: "bg-[#00b23d] text-white hover:bg-[#009a35] border border-[#00b23d]",
      purple: "bg-[#6f38dd] text-white hover:bg-[#5c2fc0] border border-[#6f38dd]",
      pink: "bg-[#ff0096] text-white hover:bg-[#e00086] border border-[#ff0096]",
    };
    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };
    return (
      <button
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-2 rounded-[10px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
