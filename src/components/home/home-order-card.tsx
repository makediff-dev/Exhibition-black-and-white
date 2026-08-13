"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { HomeOrderCard } from "@/constants/home-orders";

interface HomeOrderCardProps {
  order: HomeOrderCard;
  onRespond: (order: HomeOrderCard) => void;
}

export function HomeOrderCardItem({ order, onRespond }: HomeOrderCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardTitle className="text-sm leading-snug">{order.title}</CardTitle>
      <CardDescription className="mt-2 flex-1 text-xs leading-relaxed line-clamp-3">
        {order.description}
      </CardDescription>
      <div className="mt-4 space-y-1 text-xs text-gray-700">
        <p>
          <span className="text-gray-500">Бюджет:</span> {order.budget}
        </p>
        <p>
          <span className="text-gray-500">Срок:</span> {order.deadlineLabel}
        </p>
      </div>
      <Button type="button" className="mt-4 w-full" onClick={() => onRespond(order)}>
        Откликнуться
      </Button>
    </Card>
  );
}
