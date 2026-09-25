import { formatPrice } from "./formatters.ts";

export function formatVenuePriceRange(priceMin: number, priceMax: number): string {
  if (priceMin <= 0) return "Цена по запросу";
  if (priceMax > priceMin) return `${formatPrice(priceMin)} — ${formatPrice(priceMax)} / кв.м`;
  return `${formatPrice(priceMin)} / кв.м`;
}
