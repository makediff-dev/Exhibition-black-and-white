export type CatalogSection = "events" | "services" | "contractors" | "venues";

export type CatalogAccentVariant = "teal" | "blue" | "green" | "purple" | "pink";

export const CATALOG_SECTION_ACCENT: Record<CatalogSection, CatalogAccentVariant> = {
  events: "teal",
  services: "green",
  contractors: "purple",
  venues: "pink",
};
