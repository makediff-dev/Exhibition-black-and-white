"use client";

import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";
import { notFound, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, ChevronRight, ShoppingCart, Star, Heart } from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast-provider";
import { useCartStore, useFavoritesStore, usePrototypeStore } from "@/lib/store";
import { formatPrice, formatServicePrice } from "@/lib/utils/formatters";

const MOCK_REVIEWS = [
  { id: "rv1", author: "ООО «Альфа»", rating: 5, text: "Качественное выполнение в срок", date: "2025-12-10" },
  { id: "rv2", author: "ООО «Бета»", rating: 4, text: "Хороший сервис, рекомендуем", date: "2025-11-22" },
];

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const addItem = useCartStore((s) => s.addItem);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) => s.isFavorite);

  const id = params.id as string;
  const services = usePrototypeStore((s) => s.services);
  const service = services.find((s) => s.id === id);

  const [selectedVariantId, setSelectedVariantId] = useState(service?.variants?.[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [photoIndex, setPhotoIndex] = useState(0);

  if (!service) notFound();

  const photoCards = service.photoCards?.filter((card) => card.imageUrl || card.title || card.caption) ?? [];
  const currentPhotoCard = photoCards[photoIndex];

  const selectedVariant = service.variants?.find((v) => v.id === selectedVariantId);
  const unitPrice = selectedVariant?.price ?? service.price;

  const handleToggleFavorite = () => {
    const added = toggleFavorite(service.id);
    showToast(
      added ? `«${service.title}» добавлено в избранное` : `«${service.title}» удалено из избранного`,
      added ? "success" : "info"
    );
  };

  const handleAddToCart = () => {
    addItem({
      serviceId: service.id,
      quantity,
      comment: selectedVariant ? `Вариант: ${selectedVariant.name}` : "",
      files: [],
      variantId: selectedVariant?.id,
      variantName: selectedVariant?.name,
      unitPrice,
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

      <main className="flex-1 mx-auto max-w-site w-full px-4 py-8">
        <BackButton fallbackHref="/services" className="mb-4" />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-start justify-between gap-3">
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
              <button
                type="button"
                onClick={handleToggleFavorite}
                className="shrink-0 text-gray-900 hover:text-gray-600"
                aria-label={isFavorite(service.id) ? "Убрать из избранного" : "В избранное"}
              >
                <Heart className={`h-5 w-5 ${isFavorite(service.id) ? "fill-gray-900" : ""}`} />
              </button>
            </div>

            {photoCards.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">Ключевые характеристики</h2>
                <div className="border border-[#d4d4d4] rounded-[14px] overflow-hidden">
                  <div className="aspect-[16/10] bg-gray-50 relative">
                    {currentPhotoCard?.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={currentPhotoCard.imageUrl}
                        alt={currentPhotoCard.title || service.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-sm text-gray-400">
                        Фото карточки
                      </div>
                    )}
                    {photoCards.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setPhotoIndex((prev) => (prev === 0 ? photoCards.length - 1 : prev - 1))}
                          className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-[10px] border border-[#d4d4d4] bg-white/95"
                          aria-label="Предыдущая карточка"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPhotoIndex((prev) => (prev === photoCards.length - 1 ? 0 : prev + 1))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-[10px] border border-[#d4d4d4] bg-white/95"
                          aria-label="Следующая карточка"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="p-4 border-t border-gray-200">
                    {currentPhotoCard?.title && (
                      <p className="text-sm font-semibold">{currentPhotoCard.title}</p>
                    )}
                    {currentPhotoCard?.caption && (
                      <p className="text-sm text-gray-700 mt-1">{currentPhotoCard.caption}</p>
                    )}
                  </div>
                </div>
                {photoCards.length > 1 && (
                  <div className="grid sm:grid-cols-3 gap-3">
                    {photoCards.map((card, index) => (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => setPhotoIndex(index)}
                        className={`rounded-[10px] border p-3 text-left text-sm ${index === photoIndex ? "border-[#171717]" : "border-[#d4d4d4]"}`}
                      >
                        <p className="font-medium">{card.title || `Карточка ${index + 1}`}</p>
                        {card.caption && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{card.caption}</p>}
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            <section>
              <h2 className="text-lg font-semibold mb-2">Описание</h2>
              <p className="text-sm text-gray-700">{service.description}</p>
            </section>

            <section className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="catalog-content-box p-4">
                <p className="font-medium mb-1">Условия</p>
                <p className="text-gray-700">{service.terms}</p>
                {service.guaranteeRefund && (
                  <p className="text-gray-900 mt-2 text-xs border border-dashed border-gray-400 px-2 py-1 inline-block">
                    Гарантия результата или возврат денежных средств
                  </p>
                )}
              </div>
              <div className="catalog-content-box p-4">
                <p className="font-medium mb-1">Срок выполнения</p>
                <p className="text-gray-700">{service.deadline}</p>
              </div>
              {service.prepaymentPercent !== undefined && (
                <div className="catalog-content-box p-4 sm:col-span-2">
                  <p className="font-medium mb-1">Условия оплаты</p>
                  <p className="text-gray-700">
                    Предоплата {service.prepaymentPercent}%, постоплата {100 - service.prepaymentPercent}%
                  </p>
                </div>
              )}
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">Отзывы</h2>
              <div className="space-y-3">
                {MOCK_REVIEWS.map((review) => (
                  <div key={review.id} className="catalog-content-box p-4">
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
            <div className="catalog-content-box p-4 sticky top-20 space-y-4">
              <p className="text-2xl font-bold">
                {formatServicePrice({
                  price: unitPrice,
                  priceFormat: selectedVariant ? "фиксированная" : service.priceFormat,
                })}
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

              <Button className="w-full" variant="green" onClick={handleAddToCart}>
                <ShoppingCart className="h-4 w-4" />
                В корзину
              </Button>
              <Button className="w-full" variant="soft-outline" onClick={handleOrder}>
                Оформить заказ
              </Button>
              <Link href={`/requests/new?serviceId=${service.id}`} className="block">
                <Button className="w-full" variant="soft-outline" size="sm">
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
