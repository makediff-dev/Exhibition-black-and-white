"use client";

import { useLayoutEffect, useState, type RefObject } from "react";

interface UseFitCardCountOptions {
  minCardWidth?: number;
  fallback?: number;
  max?: number;
}

export function useFitCardCount(
  ref: RefObject<HTMLElement | null>,
  options: UseFitCardCountOptions = {},
) {
  const minCardWidth = options.minCardWidth ?? 220;
  const fallback = options.fallback ?? 5;
  const max = options.max ?? 8;
  const [count, setCount] = useState(fallback);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const update = () => {
      const styles = getComputedStyle(node);
      const gap = Number.parseFloat(styles.columnGap || styles.gap) || 24;
      const width = node.clientWidth;
      if (width <= 0) return;
      const next = Math.min(max, Math.max(1, Math.floor((width + gap) / (minCardWidth + gap))));
      setCount(next);
    };

    const observer = new ResizeObserver(update);
    observer.observe(node);
    update();
    return () => observer.disconnect();
  }, [fallback, max, minCardWidth]);

  return count;
}
