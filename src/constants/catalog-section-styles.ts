export type CatalogSection = "events" | "services" | "contractors" | "venues";

export type CatalogAccentVariant = "teal" | "blue" | "green" | "purple" | "violet" | "pink";

export const CATALOG_SECTION_ACCENT: Record<CatalogSection, CatalogAccentVariant> = {
  events: "teal",
  services: "blue",
  contractors: "violet",
  venues: "pink",
};

export interface CatalogAccentTokens {
  accent: string;
  accentHover: string;
  accentSoft: string;
  buttonVariant: CatalogAccentVariant;
}

export const CATALOG_ACCENT_TOKENS: Record<CatalogAccentVariant, CatalogAccentTokens> = {
  teal: {
    accent: "#28b5b3",
    accentHover: "#1f9696",
    accentSoft: "#eaf8f7",
    buttonVariant: "teal",
  },
  blue: {
    accent: "#2939eb",
    accentHover: "#2230c7",
    accentSoft: "#eef0fe",
    buttonVariant: "blue",
  },
  green: {
    accent: "#00b23d",
    accentHover: "#009a35",
    accentSoft: "#e8f8ee",
    buttonVariant: "green",
  },
  purple: {
    accent: "#0AAEE4",
    accentHover: "#0893C2",
    accentSoft: "#e8f7fd",
    buttonVariant: "purple",
  },
  violet: {
    accent: "#683BD9",
    accentHover: "#5730C0",
    accentSoft: "#f3effc",
    buttonVariant: "violet",
  },
  pink: {
    accent: "#ff0096",
    accentHover: "#e00086",
    accentSoft: "#fff0f8",
    buttonVariant: "pink",
  },
};

export function catalogAccentFromPathname(pathname: string): CatalogAccentVariant | null {
  if (pathname === "/events" || pathname.startsWith("/events/")) {
    return CATALOG_SECTION_ACCENT.events;
  }
  if (pathname === "/services" || pathname.startsWith("/services/")) {
    return CATALOG_SECTION_ACCENT.services;
  }
  if (pathname === "/venues" || pathname.startsWith("/venues/")) {
    return CATALOG_SECTION_ACCENT.venues;
  }
  if (pathname === "/contractors" || pathname.startsWith("/contractors/")) {
    return CATALOG_SECTION_ACCENT.contractors;
  }
  return null;
}
