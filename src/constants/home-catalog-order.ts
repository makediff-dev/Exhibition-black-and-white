import type { HomeTileButtonVariant } from "@/constants/home-button-variants";
import type { UserRole } from "@/data/types";

export type HomeCatalogBlock =
  | "categories"
  | "contractors"
  | "urgent"
  | "current"
  | "events"
  | "venues";

export type HomeBlockCardType = "category" | "order" | "contractor" | "event" | "venue";

interface HomeBlockCardTheme {
  cardType: HomeBlockCardType;
  buttonVariant: HomeTileButtonVariant | null;
}

/**
 * Card type and CTA color follow the Figma 107:1390 legend, not the viewer role:
 * orders → customer teal, services/contractors → contractor cyan,
 * events → organizer blue, venues → venue purple.
 */
export const HOME_BLOCK_CARD_THEME: Record<HomeCatalogBlock, HomeBlockCardTheme> = {
  urgent: { cardType: "order", buttonVariant: "primary" },
  current: { cardType: "order", buttonVariant: "primary" },
  events: { cardType: "event", buttonVariant: "blue" },
  contractors: { cardType: "contractor", buttonVariant: "purple" },
  categories: { cardType: "category", buttonVariant: null },
  venues: { cardType: "venue", buttonVariant: "violet" },
};

/** Homepage catalog block order by current company role (Figma 107:1390). */
export const HOME_CATALOG_ORDER_BY_ROLE: Record<
  Exclude<UserRole, null> | "guest",
  HomeCatalogBlock[]
> = {
  guest: ["categories", "contractors", "urgent", "current", "events", "venues"],
  customer: ["categories", "contractors", "events", "venues", "urgent", "current"],
  contractor: ["urgent", "current", "events", "contractors", "categories", "venues"],
  organizer: ["venues", "contractors", "categories", "events", "urgent", "current"],
  venue: ["events", "contractors", "categories", "urgent", "current", "venues"],
};

export function getHomeCatalogOrder(role: UserRole | undefined): HomeCatalogBlock[] {
  if (!role) return HOME_CATALOG_ORDER_BY_ROLE.guest;
  return HOME_CATALOG_ORDER_BY_ROLE[role];
}
