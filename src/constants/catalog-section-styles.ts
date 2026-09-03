export type CatalogSection = "events" | "services" | "contractors" | "venues";

export type CatalogAccentVariant = "teal" | "blue" | "green" | "purple" | "violet" | "pink";

export const CATALOG_SECTION_ACCENT: Record<CatalogSection, CatalogAccentVariant> = {
  events: "teal",
  services: "teal",
  contractors: "violet",
  venues: "pink",
};
