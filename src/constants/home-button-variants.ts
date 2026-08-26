export type HomeTileButtonVariant = "primary" | "blue" | "green" | "purple" | "pink";

export const HOME_TILE_BUTTON_VARIANTS = {
  primary: {
    background: "#28b5b3",
    hover: "#1f9696",
  },
  blue: {
    background: "#2939eb",
    hover: "#2230c7",
  },
  green: {
    background: "#00b23d",
    hover: "#009a35",
  },
  purple: {
    background: "#6f38dd",
    hover: "#5c2fc0",
  },
  pink: {
    background: "#ff0096",
    hover: "#e00086",
  },
} as const satisfies Record<
  HomeTileButtonVariant,
  { background: string; hover: string }
>;
