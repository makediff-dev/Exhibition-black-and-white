import type { CartItem, Service } from "@/data/types";

export const EXTENDED_CHECK_CART_PREFIX = "extended-check-";

export interface ResolvedCartLine {
  service: Service;
  unitPrice: number;
  lineTitle: string;
  isExtendedCheck?: boolean;
}

export function isExtendedCheckCartItem(serviceId: string) {
  return serviceId.startsWith(EXTENDED_CHECK_CART_PREFIX);
}

export function resolveCartLine(item: CartItem, services: Service[]): ResolvedCartLine | null {
  if (isExtendedCheckCartItem(item.serviceId)) {
    return {
      service: {
        id: item.serviceId,
        title: "Расширенная проверка контрагента",
        city: "—",
        contractorId: "platform-checks",
        contractorName: "Проверки исполнителей",
        category: "Проверки",
        price: item.unitPrice ?? 0,
        priceFormat: "фиксированная",
        description: "Расширенная дистанционная проверка партнёрами сервиса",
        terms: "",
        deadline: "",
        rating: 0,
        reviewCount: 0,
      },
      unitPrice: item.unitPrice ?? 0,
      lineTitle: item.variantName ?? "Расширенная проверка контрагента",
      isExtendedCheck: true,
    };
  }

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
