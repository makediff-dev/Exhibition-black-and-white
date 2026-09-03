export type HomeTileButtonVariant = "primary" | "blue" | "green" | "purple" | "violet" | "pink";

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
    background: "#0AAEE4",
    hover: "#0893C2",
  },
  violet: {
    background: "#683BD9",
    hover: "#5730C0",
  },
  pink: {
    background: "#ff0096",
    hover: "#e00086",
  },
} as const satisfies Record<
  HomeTileButtonVariant,
  { background: string; hover: string }
>;
