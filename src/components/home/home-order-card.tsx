"use client";

import type { HomeOrderCard } from "@/constants/home-orders";
import type { HomeTileButtonVariant } from "@/constants/home-button-variants";
import { HomeTileCard } from "./home-tile-card";

interface HomeOrderCardProps {
  order: HomeOrderCard;
  onRespond: (order: HomeOrderCard) => void;
  buttonVariant?: HomeTileButtonVariant;
  buttonLabel?: string;
  imageUrls?: string[];
  sponsored?: boolean;
}

export function HomeOrderCardItem({
  order,
  onRespond,
  buttonVariant = "primary",
  buttonLabel = "Откликнуться",
  imageUrls,
  sponsored = false,
}: HomeOrderCardProps) {
  return (
    <HomeTileCard
      title={order.title}
      imageUrl={order.imageUrl}
      imageUrls={imageUrls}
      sponsored={sponsored}
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