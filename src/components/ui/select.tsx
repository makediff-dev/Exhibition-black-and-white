import { cn } from "@/lib/utils/cn";
import { ChevronDown } from "lucide-react";
import { type SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s/g, "-");
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-gray-900">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className="w-full appearance-none rounded-[10px] border border-[#d4d4d4] bg-white py-2 pl-3 pr-8 text-sm focus:border-[#171717] focus:outline-none focus:ring-1 focus:ring-[#171717]"
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-500" />
        </div>
        {error && <span className="text-xs text-gray-700">{error}</span>}
      </div>
    );
  }
);
Select.displayName = "Select";
