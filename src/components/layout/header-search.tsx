"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PLATFORM_SEARCH_LABEL } from "@/constants/search";
import { getSearchSuggestions } from "@/lib/utils/global-search";
import { cn } from "@/lib/utils/cn";
import styles from "./header-search.module.css";

interface HeaderSearchProps {
  className?: string;
  onNavigate?: () => void;
}

export function HeaderSearch({ className, onNavigate }: HeaderSearchProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const inputId = useId();
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
    <form onSubmit={handleSubmit} className={cn(styles.form, className)}>
      <div ref={rootRef} className={styles.root}>
        <div className={styles.searchBar}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/home/header-search-icon.svg" alt="" className={styles.icon} aria-hidden="true" />
          <label className="sr-only" htmlFor={inputId}>
            {PLATFORM_SEARCH_LABEL}
          </label>
          <input
            id={inputId}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Поиск..."
            autoComplete="off"
            aria-label={PLATFORM_SEARCH_LABEL}
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            className={styles.input}
          />
        </div>

        {showDropdown && (
          <div className={styles.dropdown}>
            {suggestions.length === 0 ? (
              <p className={styles.empty}>Ничего не найдено</p>
            ) : (
              <ul className={styles.list} role="listbox">
                {suggestions.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      role="option"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => navigateTo(item.href)}
                      className={styles.option}
                    >
                      <span className={styles.optionLabel}>{item.label}</span>
                      <span className={styles.optionSubtitle}>{item.subtitle}</span>
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