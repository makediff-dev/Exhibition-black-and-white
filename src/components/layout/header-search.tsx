"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { getSearchSuggestions } from "@/lib/utils/global-search";
import { cn } from "@/lib/utils/cn";

interface HeaderSearchProps {
  className?: string;
  inputClassName?: string;
  onNavigate?: () => void;
}

export function HeaderSearch({ className, inputClassName, onNavigate }: HeaderSearchProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const suggestions = useMemo(() => getSearchSuggestions(search), [search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigateTo = (href: string) => {
    router.push(href);
    setOpen(false);
    onNavigate?.();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = search.trim();
    if (!trimmed) return;

    if (suggestions.length > 0) {
      navigateTo(suggestions[0].href);
      return;
    }

    router.push(`/events?q=${encodeURIComponent(trimmed)}`);
    setOpen(false);
    onNavigate?.();
  };

  const showDropdown = open && search.trim().length >= 2;

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div ref={rootRef} className="relative w-full">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Поиск..."
          autoComplete="off"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          className={cn(
            "w-full border border-gray-300 pl-8 pr-3 py-1.5 text-sm focus:border-gray-900 focus:outline-none",
            inputClassName,
          )}
        />

        {showDropdown && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 border border-gray-300 bg-white shadow-sm">
            {suggestions.length === 0 ? (
              <p className="px-3 py-2 text-sm text-gray-600">Ничего не найдено</p>
            ) : (
              <ul role="listbox">
                {suggestions.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      role="option"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => navigateTo(item.href)}
                      className="flex w-full flex-col items-start px-3 py-2 text-left hover:bg-gray-50"
                    >
                      <span className="text-sm text-gray-900">{item.label}</span>
                      <span className="text-xs text-gray-600">{item.subtitle}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
