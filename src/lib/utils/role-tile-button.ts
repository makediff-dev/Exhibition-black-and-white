import type { HomeTileButtonVariant } from "@/constants/home-button-variants";
import type { ButtonVariant } from "@/components/ui/button";
import type { UserRole } from "@/data/types";

export const ROLE_TILE_BUTTON_VARIANT: Record<Exclude<UserRole, null>, HomeTileButtonVariant> = {
  customer: "primary",
  contractor: "purple",
  organizer: "blue",
  venue: "violet",
};

export function toHomeTileButtonVariant(
  variant: ButtonVariant | undefined,
  role?: UserRole,
): HomeTileButtonVariant {
  if (variant === "blue" || variant === "purple" || variant === "violet" || variant === "pink" || variant === "green") {
    return variant;
  }
  if (variant === "teal") return "primary";
  if (role && role in ROLE_TILE_BUTTON_VARIANT) {
    return ROLE_TILE_BUTTON_VARIANT[role];
  }
  return "primary";
}
