"use client";

import type { HomeOrderCard } from "@/constants/home-orders";
import type { HomeTileButtonVariant } from "@/constants/home-button-variants";
import { HomeTileCard } from "./home-tile-card";

interface HomeOrderCardProps {
  order: HomeOrderCard;
  onRespond: (order: HomeOrderCard) => void;
  buttonVariant?: HomeTileButtonVariant;
}

export function HomeOrderCardItem({
  order,
  onRespond,
  buttonVariant = "blue",
}: HomeOrderCardProps) {
  return (
    <HomeTileCard
      title={order.title}
      imageUrl={order.imageUrl}
      meta={[
        { label: "Бюджет", value: order.budget },
        { label: "Срок", value: order.deadlineLabel },
      ]}
      buttonLabel="Откликнуться"
      onButtonClick={() => onRespond(order)}
      buttonVariant={buttonVariant}
    />
  );
}
