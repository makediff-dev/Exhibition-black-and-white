"use client";

import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ShoppingCart, Star } from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast-provider";
import { useCartStore, usePrototypeStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils/formatters";

const MOCK_REVIEWS = [
  { id: "rv1", author: "ООО «Альфа»", rating: 5, text: "Качественное выполнение в срок", date: "2025-12-10" },
  { id: "rv2", author: "ООО «Бета»", rating: 4, text: "Хороший сервис, рекомендуем", date: "2025-11-22" },
];

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const addItem = useCartStore((s) => s.addItem);

  const id = params.id as string;
  const services = usePrototypeStore((s) => s.services);
  const service = services.find((s) => s.id === id);

  const [selectedVariantId, setSelectedVariantId] = useState(service?.variants?.[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);

  if (!service) notFound();

  const selectedVariant = service.variants?.find((v) => v.id === selectedVariantId);
  const unitPrice = selectedVariant?.price ?? service.price;

  const handleAddToCart = () => {
    addItem({
      serviceId: service.id,
      quantity,
      comment: selectedVariant ? `Вариант: ${selectedVariant.name}` : "",
      files: [],
    });
    showToast(`«${service.title}» добавлено в корзину`, "success");
  };

  const handleOrder = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8">
        <Link href="/services" className="text-sm underline mb-4 inline-block">← Все услуги</Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <Badge variant="outline" className="mb-2">{service.category}</Badge>
              <h1 className="text-2xl font-bold mb-2">{service.title}</h1>
              <p className="text-sm text-gray-600">
                <Link href={`/contractors/${service.contractorId}`} className="underline">
                  {service.contractorName}
                </Link>
                {" · "}{service.city}
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 fill-gray-900" />
                {service.rating} · {service.reviewCount} отзывов
              </p>
            </div>

            <section>
              <h2 className="text-lg font-semibold mb-2">Описание</h2>
              <p className="text-sm text-gray-700">{service.description}</p>
            </section>

            <section className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="border border-gray-300 p-4">
                <p className="font-medium mb-1">Условия</p>
                <p className="text-gray-700">{service.terms}</p>
              </div>
              <div className="border border-gray-300 p-4">
                <p className="font-medium mb-1">Срок выполнения</p>
                <p className="text-gray-700">{service.deadline}</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">Отзывы</h2>
              <div className="space-y-3">
                {MOCK_REVIEWS.map((review) => (
                  <div key={review.id} className="border border-gray-300 p-4">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">{review.author}</p>
                      <span className="text-xs text-gray-600">{review.date}</span>
                    </div>
                    <p className="text-xs mt-1">★ {review.rating}</p>
                    <p className="text-sm text-gray-700 mt-2">{review.text}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside>
            <div className="border border-gray-900 p-4 sticky top-20 space-y-4">
              <p className="text-2xl font-bold">
                {service.priceFormat === "от" && !selectedVariant ? "от " : ""}
                {formatPrice(unitPrice)}
                {!selectedVariant && service.priceFormat !== "фиксированная" && service.priceFormat !== "от"
                  ? ` / ${service.priceFormat}`
                  : ""}
              </p>

              {service.variants && service.variants.length > 0 && (
                <Select
                  label="Вариант"
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  options={service.variants.map((v) => ({
                    value: v.id,
                    label: `${v.name} — ${formatPrice(v.price)}`,
                  }))}
                />
              )}

              <Select
                label="Количество"
                value={String(quantity)}
                onChange={(e) => setQuantity(Number(e.target.value))}
                options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }))}
              />

              <p className="text-sm text-gray-600">
                Итого: <span className="font-semibold text-gray-900">{formatPrice(unitPrice * quantity)}</span>
              </p>

              <Button className="w-full" onClick={handleAddToCart}>
                <ShoppingCart className="h-4 w-4" />
                В корзину
              </Button>
              <Button className="w-full" variant="outline" onClick={handleOrder}>
                Оформить заказ
              </Button>
              <Link href={`/requests/new?serviceId=${service.id}`} className="block">
                <Button className="w-full" variant="ghost" size="sm">
                  Создать заявку по услуге
                </Button>
              </Link>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
