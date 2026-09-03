"use client";

import type { HomeOrderCard } from "@/constants/home-orders";
import type { HomeTileButtonVariant } from "@/constants/home-button-variants";
import { HomeTileCard } from "./home-tile-card";

interface HomeOrderCardProps {
  order: HomeOrderCard;
  onRespond: (order: HomeOrderCard) => void;
  buttonVariant?: HomeTileButtonVariant;
  buttonLabel?: string;
}

export function HomeOrderCardItem({
  order,
  onRespond,
  buttonVariant = "blue",
  buttonLabel = "Откликнуться",
}: HomeOrderCardProps) {
  return (
    <HomeTileCard
      title={order.title}
      imageUrl={order.imageUrl}
      meta={[
        { label: "Бюджет", value: order.budget },
        { label: "Срок", value: order.deadlineLabel },
      ]}
      buttonLabel={buttonLabel}
      onButtonClick={() => onRespond(order)}
      buttonVariant={buttonVariant}
    />
  );
}