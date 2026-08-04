import type { CartItem, Service } from "@/data/types";

export interface ResolvedCartLine {
  service: Service;
  unitPrice: number;
  lineTitle: string;
}

export function resolveCartLine(item: CartItem, services: Service[]): ResolvedCartLine | null {
  const service = services.find((entry) => entry.id === item.serviceId);
  if (!service) return null;

  const variant = item.variantId
    ? service.variants?.find((entry) => entry.id === item.variantId)
    : undefined;

  const unitPrice = item.unitPrice ?? variant?.price ?? service.price;
  const lineTitle =
    variant || item.variantName
      ? `${service.title} (${variant?.name ?? item.variantName})`
      : service.title;

  return { service, unitPrice, lineTitle };
}
