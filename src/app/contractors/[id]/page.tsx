"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { Star } from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { SEED_CONTRACTORS, SEED_SERVICES } from "@/data/mocks/seed";

const MOCK_REQUISITES: Record<string, { inn: string; ogrn: string; address: string; director: string }> = {
  "comp-1": { inn: "7702345678", ogrn: "1027700234567", address: "г. Москва, ул. Строительная, д. 5", director: "Петров П.П." },
  "comp-2": { inn: "7703456789", ogrn: "1027700345678", address: "г. Москва, ул. Дизайнерская, д. 12", director: "Смирнова А.А." },
  "comp-3": { inn: "7801234567", ogrn: "1027800123456", address: "г. Санкт-Петербург, пр. Медиа, д. 3", director: "Кузнецов В.В." },
  "comp-4": { inn: "7704567890", ogrn: "1027700456789", address: "г. Москва, ул. Мебельная, д. 8", director: "Новиков Н.Н." },
  "comp-5": { inn: "1650123456", ogrn: "1021600123456", address: "г. Казань, ул. Логистическая, д. 1", director: "Фаттахов Р.Р." },
  "comp-6": { inn: "7705678901", ogrn: "1027700567890", address: "г. Москва, ул. Цветочная, д. 4", director: "Розова Е.Е." },
  "comp-7": { inn: "6658123456", ogrn: "1026608123456", address: "г. Екатеринбург, ул. Чистая, д. 7", director: "Белов И.И." },
  "comp-8": { inn: "7706789012", ogrn: "1027700678901", address: "г. Москва, ул. Кейтеринговая, д. 2", director: "Орлова М.М." },
};

export default function ContractorDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const contractor = SEED_CONTRACTORS.find((c) => c.id === id);

  if (!contractor) notFound();

  const requisites = MOCK_REQUISITES[contractor.companyId] ?? {
    inn: "0000000000",
    ogrn: "0000000000000",
    address: contractor.city,
    director: "—",
  };

  const services = SEED_SERVICES.filter((s) => s.contractorId === contractor.id);

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8">
        <Link href="/contractors" className="text-sm underline mb-4 inline-block">← Все исполнители</Link>

        <div className="flex flex-wrap gap-2 mb-3">
          {contractor.verified && <Badge variant="solid">Проверен</Badge>}
          {contractor.hasProduction && <Badge variant="outline">Своё производство</Badge>}
        </div>

        <h1 className="text-2xl font-bold mb-2">{contractor.name}</h1>
        <p className="text-sm text-gray-600 mb-1">{contractor.city} · {contractor.geography}</p>
        <p className="text-sm text-gray-600 flex items-center gap-1 mb-6">
          <Star className="h-4 w-4 fill-gray-900" />
          {contractor.rating} · {contractor.reviewCount} отзывов
        </p>

        <div className="flex flex-wrap gap-2 mb-8">
          <Link href={`/requests/new?contractorId=${contractor.id}`}>
            <Button>Пригласить в заявку</Button>
          </Link>
          <Link href={`/services?contractor=${contractor.id}`}>
            <Button variant="outline">Услуги исполнителя</Button>
          </Link>
          <Link href={`/contractors/${contractor.id}/check`}>
            <Button variant="secondary">Проверка контрагента</Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-2">О компании</h2>
              <p className="text-sm text-gray-700">{contractor.description}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {contractor.categories.map((cat) => (
                  <span key={cat} className="text-xs border border-gray-300 px-2 py-1">{cat}</span>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">Портфолио</h2>
              {contractor.portfolio.length === 0 ? (
                <p className="text-sm text-gray-600">Портфолио пока не добавлено</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {contractor.portfolio.map((item) => (
                    <Card key={item.id}>
                      <CardTitle>{item.title}</CardTitle>
                      <p className="text-xs text-gray-600 mt-1">{item.year}</p>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">Отзывы</h2>
              {contractor.reviews.length === 0 ? (
                <p className="text-sm text-gray-600">Отзывов пока нет</p>
              ) : (
                <div className="space-y-3">
                  {contractor.reviews.map((review) => (
                    <div key={review.id} className="border border-gray-300 p-4">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium">{review.author}</p>
                        <span className="text-xs text-gray-600">{review.date}</span>
                      </div>
                      <p className="text-xs mt-1">★ {review.rating}</p>
                      <p className="text-sm text-gray-700 mt-2">{review.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {services.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-3">Услуги</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {services.map((service) => (
                    <Link key={service.id} href={`/services/${service.id}`}>
                      <Card className="hover:border-gray-900 h-full">
                        <CardTitle>{service.title}</CardTitle>
                        <p className="text-xs text-gray-600 mt-1">{service.category}</p>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside>
            <section className="border border-gray-300 p-4 sticky top-20">
              <h2 className="text-base font-semibold mb-3">Реквизиты</h2>
              <dl className="text-sm space-y-2">
                <div>
                  <dt className="text-gray-600">Наименование</dt>
                  <dd className="font-medium">{contractor.name}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">ИНН</dt>
                  <dd className="font-medium">{requisites.inn}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">ОГРН</dt>
                  <dd className="font-medium">{requisites.ogrn}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Адрес</dt>
                  <dd className="font-medium">{requisites.address}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Руководитель</dt>
                  <dd className="font-medium">{requisites.director}</dd>
                </div>
              </dl>
              <Link href={`/contractors/${contractor.id}/check`} className="block mt-4">
                <Button variant="outline" className="w-full" size="sm">
                  Проверить контрагента →
                </Button>
              </Link>
            </section>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
