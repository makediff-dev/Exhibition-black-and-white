"use client";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <span className="relative inline-flex group">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 border border-gray-300 bg-white p-2 text-xs leading-snug text-gray-600 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {content}
      </span>
    </span>
  );
}
