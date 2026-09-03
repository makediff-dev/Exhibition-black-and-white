"use client";

import type { HomeTileButtonVariant } from "@/constants/home-button-variants";
import { HOME_ORDER_CATEGORIES } from "@/constants/home-orders";
import { HomeOrderCardItem } from "./home-order-card";
import { useHomeOrdersContext } from "./home-orders-provider";
import { HomeScrollSection } from "./home-scroll-section";

interface HomeCategoryOrdersSectionProps {
  categoryIndex: number;
  linkHref: string;
  linkLabel: string;
  idSuffix?: string;
  buttonVariant?: HomeTileButtonVariant;
  buttonLabel?: string;
}

export function HomeCategoryOrdersSection({
  categoryIndex,
  linkHref,
  linkLabel,
  idSuffix = "",
  buttonVariant = "blue",
  buttonLabel,
}: HomeCategoryOrdersSectionProps) {
  const { handleRespond } = useHomeOrdersContext();
  const category = HOME_ORDER_CATEGORIES[categoryIndex];
  const resolvedButtonLabel = buttonLabel ?? (linkHref === "/services" ? "Подробнее" : "Откликнуться");

  if (!category) return null;

  return (
    <HomeScrollSection title={category.title} linkHref={linkHref} linkLabel={linkLabel}>
      {category.orders.map((order) => (
        <HomeOrderCardItem
          key={`${categoryIndex}${idSuffix}-${order.id}`}
          order={order}
          onRespond={handleRespond}
          buttonVariant={buttonVariant}
          buttonLabel={resolvedButtonLabel}
        />
      ))}
    </HomeScrollSection>
  );
}