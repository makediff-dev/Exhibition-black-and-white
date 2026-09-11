"use client";

import { createContext, useContext, useMemo, type CSSProperties, type ReactNode } from "react";
import {
  CATALOG_ACCENT_TOKENS,
  type CatalogAccentTokens,
  type CatalogAccentVariant,
} from "@/constants/catalog-section-styles";
import { cn } from "@/lib/utils/cn";

const CatalogAccentContext = createContext<CatalogAccentTokens | null>(null);

export function useCatalogAccent() {
  return useContext(CatalogAccentContext);
}

export function CatalogAccentProvider({
  accent,
  children,
  className,
}: {
  accent: CatalogAccentVariant;
  children: ReactNode;
  className?: string;
}) {
  const tokens = useMemo(() => CATALOG_ACCENT_TOKENS[accent], [accent]);
  const style = {
    "--catalog-accent": tokens.accent,
    "--catalog-accent-hover": tokens.accentHover,
    "--catalog-accent-soft": tokens.accentSoft,
  } as CSSProperties;

  return (
    <CatalogAccentContext.Provider value={tokens}>
      <div className={cn("catalog-section-accent w-full min-w-0", className)} style={style}>
        {children}
      </div>
    </CatalogAccentContext.Provider>
  );
}
