/**
 * Interactive control tokens from Figma 30:798.
 * Use these values in every public, catalog, and cabinet surface.
 * Disabled: opacity 50% and cursor not-allowed.
 */

export interface FilledControlColors {
  background: string;
  hover: string;
  border?: string;
}

export type InteractiveCardButtonVariant = "primary" | "blue" | "green" | "purple" | "violet" | "pink";

export const INTERACTIVE_DISABLED_OPACITY = 0.5;

export const INTERACTIVE_CONTROLS = {
  primary: {
    background: "#37bd85",
    hover: "#33ae7a",
    border: "#37bd85",
    color: "#ffffff",
    usage: "Найти, Зарегистрироваться, Разместить заказ",
  },
  secondary: {
    background: "#ffffff",
    hoverBackground: "#f9fafb",
    border: "#dddddd",
    hoverBorder: "#171717",
    color: "#171717",
    usage: "Войти, Подробнее о сервисе, Искать во всех разделах",
  },
  cardContractor: {
    background: "#0aaee4",
    hover: "#0893c2",
    usage: "Подробнее · услуги, исполнители",
  },
  cardCustomer: {
    background: "#28b5b3",
    hover: "#1f9696",
    usage: "Откликнуться · срочные и актуальные заказы",
  },
  cardOrganizer: {
    background: "#2939eb",
    hover: "#2230c7",
    usage: "Откликнуться · мероприятия",
  },
  cardVenue: {
    background: "#683bd9",
    hover: "#5730c0",
    usage: "Подробнее · площадки",
  },
  linkAll: {
    color: "#101828",
    hover: "#364153",
    usage: "Ссылка «Все …» под карточками",
  },
  linkMore: {
    color: "#101828",
    hoverOpacity: 0.7,
    usage: "Узнать подробнее · блок «Для кого подойдёт»",
  },
  filter: {
    background: "#ffffff",
    border: "#dddddd",
    hoverBorder: "#101828",
    color: "#4a5565",
    usage: "Фильтры над карточками",
  },
  cabinet: {
    background: "#ffffff",
    hoverBackground: "#f9fafb",
    border: "#101828",
    color: "#101828",
    usage: "Личный кабинет в шапке",
  },
  ctaSolid: {
    background: "#ffffff",
    hoverOpacity: 0.92,
    color: "#101828",
    usage: "Разместить заказ на градиентном призыве",
  },
  ctaGhost: {
    background: "transparent",
    hoverBackground: "rgba(255,255,255,0.16)",
    border: "rgba(255,255,255,0.85)",
    color: "#ffffff",
    usage: "Стать исполнителем на градиентном призыве",
  },
} as const;

export const INTERACTIVE_CARD_BUTTONS = {
  primary: {
    background: INTERACTIVE_CONTROLS.cardCustomer.background,
    hover: INTERACTIVE_CONTROLS.cardCustomer.hover,
  },
  blue: {
    background: INTERACTIVE_CONTROLS.cardOrganizer.background,
    hover: INTERACTIVE_CONTROLS.cardOrganizer.hover,
  },
  green: {
    background: INTERACTIVE_CONTROLS.primary.background,
    hover: INTERACTIVE_CONTROLS.primary.hover,
  },
  purple: {
    background: INTERACTIVE_CONTROLS.cardContractor.background,
    hover: INTERACTIVE_CONTROLS.cardContractor.hover,
  },
  violet: {
    background: INTERACTIVE_CONTROLS.cardVenue.background,
    hover: INTERACTIVE_CONTROLS.cardVenue.hover,
  },
  pink: {
    background: INTERACTIVE_CONTROLS.cardVenue.background,
    hover: INTERACTIVE_CONTROLS.cardVenue.hover,
  },
} as const satisfies Record<InteractiveCardButtonVariant, FilledControlColors>;
