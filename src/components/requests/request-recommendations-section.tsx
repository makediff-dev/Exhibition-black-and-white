"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { GENERAL_REQUEST_RECOMMENDATIONS } from "@/constants/request-order-details";

export function RequestRecommendationsSection() {
  return (
    <section className="mt-10">
      <h2 className="text-base font-bold mb-4">Рекомендации</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {GENERAL_REQUEST_RECOMMENDATIONS.map((item) => (
          <Card key={item.id} className="flex h-full flex-col border-gray-300">
            <CardTitle className="text-sm leading-snug">{item.title}</CardTitle>
            <CardDescription className="mt-2 flex-1">{item.description}</CardDescription>
            <Link href={item.href} className="mt-4">
              <Button size="sm" variant="outline" className="border-gray-300">
                {item.actionLabel}
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}