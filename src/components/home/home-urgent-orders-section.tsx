"use client";

import { URGENT_HOME_ORDERS } from "@/constants/home-orders";
import { HomeOrderCardItem } from "./home-order-card";
import { useHomeOrdersContext } from "./home-orders-provider";
import { HomeScrollSection } from "./home-scroll-section";

export function HomeUrgentOrdersSection() {
  const { handleRespond } = useHomeOrdersContext();

  return (
    <HomeScrollSection title="Срочные заказы" linkHref="/requests" linkLabel="Смотреть все заказы">
      {URGENT_HOME_ORDERS.map((order) => (
        <HomeOrderCardItem key={order.id} order={order} onRespond={handleRespond} buttonVariant="blue" />
      ))}
    </HomeScrollSection>
  );
}
