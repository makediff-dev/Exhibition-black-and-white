"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  searchPlaceholder?: string;
  className?: string;
}

export function SearchableSelect({
  label,
  value,
  onChange,
  options,
  searchPlaceholder = "Поиск...",
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selectId = label?.toLowerCase().replace(/\s/g, "-");

  const selectedLabel = options.find((option) => option.value === value)?.label ?? options[0]?.label;

  const filteredOptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return options;

    return options.filter((option) => option.label.toLowerCase().includes(query));
  }, [options, searchQuery]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open) {
      searchInputRef.current?.focus();
    } else {
      setSearchQuery("");
    }
  }, [open]);

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <div ref={containerRef} className={cn("relative flex flex-col gap-1", className)}>
      {label ? (
        <label htmlFor={selectId} className="text-sm font-medium text-gray-900">
          {label}
        </label>
      ) : null}

      <button
        id={selectId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-[10px] border border-[#d4d4d4] px-3 py-2 text-left text-sm hover:border-[#171717] focus:border-[#171717] focus:outline-none focus:ring-1 focus:ring-[#171717]"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-gray-500" />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-[10px] border border-[#d4d4d4] bg-white shadow-sm">
          <div className="border-b border-gray-200 p-2">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={label ? `${label}: поиск` : searchPlaceholder}
              className="w-full rounded-[10px] border border-[#d4d4d4] px-2 py-1.5 text-sm focus:border-[#171717] focus:outline-none focus:ring-1 focus:ring-[#171717]"
            />
          </div>

          <ul role="listbox" className="max-h-56 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-500">Ничего не найдено</li>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;

                return (
                  <li key={option.value} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={cn(
                        "block w-full px-3 py-2 text-left text-sm hover:bg-gray-100",
                        isSelected && "bg-gray-100 font-medium"
                      )}
                    >
                      {option.label}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}