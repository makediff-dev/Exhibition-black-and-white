"use client";

import { useEffect, useId, useRef, useState } from "react";
import { PLATFORM_SEARCH_LABEL } from "@/constants/search";
import { GroupedSearchResults } from "@/components/search/grouped-search-results";
import { cn } from "@/lib/utils/cn";
import styles from "./header-search.module.css";

interface HeaderSearchProps {
  className?: string;
  onNavigate?: () => void;
  compact?: boolean;
}

export function HeaderSearch({ className, onNavigate, compact = false }: HeaderSearchProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const inputId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (search.trim().length >= 2) {
      setOpen(true);
    }
  };

  const showDropdown = open && search.trim().length >= 2;

  if (compact) {
    return (
      <div ref={rootRef} className={cn(styles.compactRoot, className)}>
        <button
          type="button"
          className={styles.compactTrigger}
          aria-label={PLATFORM_SEARCH_LABEL}
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/home/header-search-icon.svg" alt="" className={styles.compactIcon} aria-hidden="true" />
        </button>
        {expanded ? (
          <form onSubmit={handleSubmit} className={styles.compactForm}>
            <div className={styles.searchBar}>
              <label className="sr-only" htmlFor={inputId}>
                {PLATFORM_SEARCH_LABEL}
              </label>
              <input
                id={inputId}
                value={search}
                autoFocus
                onChange={(event) => {
                  setSearch(event.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                placeholder="Поиск..."
                type="search"
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                aria-label={PLATFORM_SEARCH_LABEL}
                className={styles.input}
              />
            </div>
            {showDropdown ? (
              <GroupedSearchResults
                query={search}
                onNavigate={() => {
                  setOpen(false);
                  setExpanded(false);
                  onNavigate?.();
                }}
              />
            ) : null}
          </form>
        ) : null}
      </div>
    );
  }

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
            type="search"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            aria-label={PLATFORM_SEARCH_LABEL}
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            className={styles.input}
          />
        </div>

        {showDropdown ? (
          <GroupedSearchResults
            query={search}
            onNavigate={() => {
              setOpen(false);
              onNavigate?.();
            }}
          />
        ) : null}
      </div>
    </form>
  );
}
