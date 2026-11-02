"use client";

import { HOME_BLOCK_CARD_THEME } from "@/constants/home-catalog-order";
import { CURRENT_HOME_ORDERS } from "@/constants/home-orders";
import { HOME_IMAGES, pickHomeImages } from "@/constants/home-images";
import { HomeOrderCardItem } from "./home-order-card";
import { useHomeOrdersContext } from "./home-orders-provider";
import { HomeScrollSection } from "./home-scroll-section";

export function HomeCurrentOrdersSection() {
  const { handleRespond } = useHomeOrdersContext();

  return (
    <HomeScrollSection
      title="Актуальные заказы"
      linkHref="/services"
      linkLabel="Все заказы"
      filterPreset="orders"
    >
      {CURRENT_HOME_ORDERS.map((order, index) => (
        <HomeOrderCardItem
          key={order.id}
          order={order}
          onRespond={handleRespond}
          buttonVariant={HOME_BLOCK_CARD_THEME.current.buttonVariant ?? "primary"}
          imageUrls={pickHomeImages(HOME_IMAGES.construction, index)}
          sponsored={index === 1}
        />
      ))}
    </HomeScrollSection>
  );
}
