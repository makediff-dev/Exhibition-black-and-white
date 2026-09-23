import type { Service } from "@/data/types";

export function isStandardizedPricedService(service: Service): boolean {
  if (service.variants?.some((variant) => variant.price > 0)) {
    return true;
  }
  const format = service.priceFormat.toLowerCase();
  if (format.includes("от")) return false;
  return Number.isFinite(service.price) && service.price > 0;
}
