import { cn } from "@/lib/utils/cn";
import { type InputHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s/g, "-");
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-gray-900">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "border border-gray-300 px-3 py-2 text-sm min-h-[100px] resize-y focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-gray-700">{error}</span>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
