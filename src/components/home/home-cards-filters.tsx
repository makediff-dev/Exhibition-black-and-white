"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { CITIES, EVENT_INDUSTRIES } from "@/constants/categories";
import styles from "./home-page.module.css";

export function HomeCardsFilters() {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState("");
  const [city, setCity] = useState("moscow");
  const [industry, setIndustry] = useState("");
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

  const fields = (
    <>
      <div className={styles.filterSelectWrap}>
        <select
          className={styles.filterSelect}
          value={range}
          aria-label="Выбрать диапазон"
          onChange={(event: ChangeEvent<HTMLSelectElement>) => setRange(event.target.value)}
        >
          <option value="">Выбрать диапазон</option>
          <option value="week">Ближайшая неделя</option>
          <option value="month">Ближайший месяц</option>
          <option value="quarter">Ближайшие 3 месяца</option>
        </select>
        <ChevronDown className={styles.filterSelectIcon} aria-hidden="true" />
      </div>
      <div className={styles.filterSelectWrap}>
        <select
          className={styles.filterSelect}
          value={city}
          aria-label="Город"
          onChange={(event: ChangeEvent<HTMLSelectElement>) => setCity(event.target.value)}
        >
          <option value="moscow">Мероприятия в Москве</option>
          {CITIES.filter((item) => item !== "Москва").map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <ChevronDown className={styles.filterSelectIcon} aria-hidden="true" />
      </div>
      <div className={styles.filterSelectWrap}>
        <select
          className={styles.filterSelect}
          value={industry}
          aria-label="Отрасль"
          onChange={(event: ChangeEvent<HTMLSelectElement>) => setIndustry(event.target.value)}
        >
          <option value="">По отраслям</option>
          {EVENT_INDUSTRIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <ChevronDown className={styles.filterSelectIcon} aria-hidden="true" />
      </div>
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
        {fields}
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
          <div className={styles.filtersDrawer}>{fields}</div>
        </div>
      ) : null}
    </div>
  );
}
