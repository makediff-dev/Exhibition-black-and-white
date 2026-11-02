"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { HOME_FILTER_PRESETS, type HomeFilterField, type HomeFilterPreset } from "./home-filter-presets";
import styles from "./home-page.module.css";

interface HomeCardsFiltersProps {
  preset?: HomeFilterPreset;
}

export function HomeCardsFilters({ preset = "orders" }: HomeCardsFiltersProps) {
  const fields: HomeFilterField[] = HOME_FILTER_PRESETS[preset];
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const filtersId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if ((event.target as HTMLElement).closest("[data-filters-toggle]")) return;
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selects = (
    <>
      {fields.map((field) => (
        <div
          key={field.id}
          className={cn(styles.filterSelectWrap, field.hug === true && styles.filterSelectWrapHug)}
        >
          {field.hug === true ? (
            <span className={styles.filterSelectSizer} aria-hidden="true">
              {values[field.id] || field.placeholder}
            </span>
          ) : null}
          <select
            className={styles.filterSelect}
            value={values[field.id] ?? ""}
            aria-label={field.placeholder}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              setValues((current) => ({ ...current, [field.id]: event.target.value }))
            }
          >
            <option value="">{field.placeholder}</option>
            {field.options.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <ChevronDown className={styles.filterSelectIcon} aria-hidden="true" />
        </div>
      ))}
    </>
  );

  return (
    <div className={styles.filters}>
      <button
        type="button"
        className={styles.filtersToggle}
        data-filters-toggle=""
        aria-expanded={open}
        aria-controls={filtersId}
        onClick={() => setOpen((value) => !value)}
      >
        <SlidersHorizontal className={styles.filtersToggleIcon} aria-hidden="true" />
        Фильтры
      </button>
      <div id={filtersId} className={styles.filtersRow}>
        {selects}
      </div>
      {open ? (
        <div
          ref={panelRef}
          className={styles.filtersPanel}
          role="dialog"
          aria-modal="false"
          aria-label="Фильтры"
        >
          <div className={styles.filtersPanelHeader}>
            <p className={styles.filtersPanelTitle}>Фильтры</p>
            <button
              type="button"
              className={styles.filtersPanelClose}
              aria-label="Закрыть фильтры"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className={styles.filtersDrawer}>{selects}</div>
        </div>
      ) : null}
    </div>
  );
}
