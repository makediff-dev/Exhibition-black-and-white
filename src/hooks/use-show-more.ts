"use client";

import { useCallback, useMemo, useState } from "react";

interface UseShowMoreOptions {
  initialCount?: number;
  step?: number;
  showAllCount?: number;
}

function getDefaultShowAllCount(initialCount: number): number {
  return Math.max(initialCount * 3, 20);
}

function getItemKey(item: unknown, index: number): string {
  if (item && typeof item === "object" && "id" in item && typeof item.id === "string") {
    return `${item.id}-${index}`;
  }

  if (isValidElementLike(item)) {
    return `${String(item.key ?? "node")}-${index}`;
  }

  return `item-${index}`;
}

function isValidElementLike(item: unknown): item is { key: string | number | null } {
  return Boolean(item && typeof item === "object" && "key" in item);
}

export function useShowMore<T>(items: readonly T[], options: UseShowMoreOptions = {}) {
  const initialCount = Math.max(1, options.initialCount ?? 5);
  const step = Math.max(1, options.step ?? 5);
  const hasMoreUniqueItems = items.length > initialCount;
  const maxCount = options.showAllCount ?? (hasMoreUniqueItems ? items.length : getDefaultShowAllCount(initialCount));
  const [extraRows, setExtraRows] = useState(0);
  const visibleCount = Math.min(initialCount + extraRows * step, maxCount);

  const visibleItems = useMemo(() => {
    if (items.length === 0) return [];

    if (hasMoreUniqueItems) {
      return items.slice(0, Math.min(visibleCount, items.length)).map((item, index) => ({
        item,
        key: getItemKey(item, index),
        index,
      }));
    }

    const baseItems = items.slice(0, items.length);
    const count = Math.min(visibleCount, maxCount);

    return Array.from({ length: count }, (_, index) => ({
      item: baseItems[index % baseItems.length],
      key: getItemKey(baseItems[index % baseItems.length], index),
      index,
    }));
  }, [hasMoreUniqueItems, items, maxCount, visibleCount]);

  const effectiveMax = hasMoreUniqueItems ? Math.min(items.length, maxCount) : maxCount;
  const canShowMore = visibleCount < effectiveMax;
  const isAllVisible = visibleCount >= effectiveMax;

  const showMore = useCallback(() => {
    setExtraRows((current) => current + 1);
  }, []);

  const showAll = useCallback(() => {
    const remaining = Math.max(0, effectiveMax - initialCount);
    setExtraRows(Math.ceil(remaining / step));
  }, [effectiveMax, initialCount, step]);

  return { visibleItems, canShowMore, isAllVisible, showMore, showAll };
}
