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

export function useShowMore<T>(items: readonly T[], options: UseShowMoreOptions = {}) {
  const initialCount = options.initialCount ?? 5;
  const step = options.step ?? 5;
  const maxCount = options.showAllCount ?? getDefaultShowAllCount(initialCount);
  const maxExtraCount = Math.max(maxCount - initialCount, 0);
  const [extraCount, setExtraCount] = useState(0);

  const baseItems = useMemo(() => {
    if (items.length === 0) return [];
    return items.slice(0, Math.min(initialCount, items.length));
  }, [items, initialCount]);

  const visibleCount = Math.min(initialCount + extraCount, maxCount);

  const visibleItems = useMemo(
    () =>
      Array.from({ length: visibleCount }, (_, index) => ({
        item: baseItems[index % baseItems.length],
        key: `${index}-${getDuplicateKey(baseItems[index % baseItems.length], index)}`,
        index,
      })),
    [baseItems, visibleCount],
  );

  const canShowMore = extraCount < maxExtraCount;
  const isAllVisible = extraCount >= maxExtraCount;

  const showMore = useCallback(() => {
    setExtraCount((current) => Math.min(current + step, maxExtraCount));
  }, [maxExtraCount, step]);

  const showAll = useCallback(() => {
    setExtraCount(maxExtraCount);
  }, [maxExtraCount]);

  return { visibleItems, canShowMore, isAllVisible, showMore, showAll };
}

function getDuplicateKey(item: unknown, index: number): string {
  if (item && typeof item === "object" && "id" in item && typeof item.id === "string") {
    return `${item.id}-dup-${index}`;
  }

  if (isValidElementLike(item)) {
    return `${String(item.key ?? "node")}-dup-${index}`;
  }

  return `dup-${index}`;
}

function isValidElementLike(item: unknown): item is { key: string | number | null } {
  return Boolean(item && typeof item === "object" && "key" in item);
}
