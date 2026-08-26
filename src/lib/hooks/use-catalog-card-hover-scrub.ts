"use client";

import { useCallback, useState } from "react";

export function useCatalogCardHoverScrub(slideCount: number) {
  const [scrubRatio, setScrubRatio] = useState<number | null>(null);

  const onMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (slideCount <= 1) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (rect.width <= 0) return;
      const ratio = (event.clientX - rect.left) / rect.width;
      setScrubRatio(Math.max(0, Math.min(1, ratio)));
    },
    [slideCount],
  );

  const onMouseLeave = useCallback(() => {
    setScrubRatio(null);
  }, []);

  return {
    scrubRatio,
    cardHoverHandlers: slideCount > 1 ? { onMouseMove, onMouseLeave } : {},
  };
}
