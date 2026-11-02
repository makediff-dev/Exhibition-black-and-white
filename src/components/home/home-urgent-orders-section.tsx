"use client";

import { HOME_BLOCK_CARD_THEME } from "@/constants/home-catalog-order";
import { URGENT_HOME_ORDERS } from "@/constants/home-orders";
import { HOME_IMAGES, pickHomeImages } from "@/constants/home-images";
import { HomeOrderCardItem } from "./home-order-card";
import { useHomeOrdersContext } from "./home-orders-provider";
import { HomeScrollSection } from "./home-scroll-section";

export function HomeUrgentOrdersSection() {
  const { handleRespond } = useHomeOrdersContext();

  return (
    <HomeScrollSection title="Срочные заказы" linkHref="/services" linkLabel="Все заказы" filterPreset="orders">
      {URGENT_HOME_ORDERS.map((order, index) => (
        <HomeOrderCardItem
          key={order.id}
          order={order}
          onRespond={handleRespond}
          buttonVariant={HOME_BLOCK_CARD_THEME.urgent.buttonVariant ?? "primary"}
          imageUrls={pickHomeImages(HOME_IMAGES.urgent, index)}
          sponsored={index === 0 || index === 2}
        />
      ))}
    </HomeScrollSection>
  );
}