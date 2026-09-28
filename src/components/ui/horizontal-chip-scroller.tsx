"use client";

import { useCallback, useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./horizontal-chip-scroller.module.css";

interface Props {
  children: ReactNode;
  ariaLabel?: string;
}

export function HorizontalChipScroller({ children, ariaLabel = "Календарь" }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByPage = useCallback((direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * Math.max(180, track.clientWidth * 0.7),
      behavior: "smooth",
    });
  }, []);

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.arrow}
        aria-label="Прокрутить календарь влево"
        onClick={() => scrollByPage(-1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div ref={trackRef} className={styles.track} role="list" aria-label={ariaLabel}>
        {children}
      </div>
      <button
        type="button"
        className={styles.arrow}
        aria-label="Прокрутить календарь вправо"
        onClick={() => scrollByPage(1)}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
