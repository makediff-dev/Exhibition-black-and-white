"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Star } from "lucide-react";
import { ResponseFollowUpActions } from "@/components/responses/response-follow-up-actions";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContractorRegistryBadges } from "@/components/contractors/contractor-registry-badges";
import { PortfolioCard } from "@/components/contractors/portfolio-card";
import { ReviewCard } from "@/components/contractors/review-card";
import { Card, CardTitle } from "@/components/ui/card";
import { SEED_CONTRACTORS, SEED_SERVICES } from "@/data/mocks/seed";
import type { UserRole } from "@/data/types";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import {
  getContractorCheckHref,
  getContractorPortfolioHref,
} from "@/lib/utils/contractor-profile-links";
import { withFromParam } from "@/lib/utils/message-related-links";

const MOCK_REQUISITES: Record<
  string,
  { inn: string; ogrn: string; address: string; director: string }
> = {
  "comp-1": {
    inn: "7702345678",
    ogrn: "1027700234567",
    address: "г. Москва, ул. Строительная, д. 5",
    director: "Петров П.П.",
  },
  "comp-2": {
    inn: "7703456789",
    ogrn: "1027700345678",
    address: "г. Москва, ул. Дизайнерская, д. 12",
    director: "Смирнова А.А.",
  },
  "comp-3": {
    inn: "7801234567",
    ogrn: "1027800123456",
    address: "г. Санкт-Петербург, пр. Медиа, д. 3",
    director: "Кузнецов В.В.",
  },
  "comp-4": {
    inn: "7704567890",
    ogrn: "1027700456789",
    address: "г. Москва, ул. Мебельная, д. 8",
    director: "Новиков Н.Н.",
  },
  "comp-5": {
    inn: "1650123456",
    ogrn: "1021600123456",
    address: "г. Казань, ул. Логистическая, д. 1",
    director: "Фаттахов Р.Р.",
  },
  "comp-6": {
    inn: "7705678901",
    ogrn: "1027700567890",
    address: "г. Москва, ул. Цветочная, д. 4",
    director: "Розова Е.Е.",
  },
  "comp-7": {
    inn: "6658123456",
    ogrn: "1026608123456",
    address: "г. Екатеринбург, ул. Чистая, д. 7",
    director: "Белов И.И.",
  },
  "comp-8": {
    inn: "7706789012",
    ogrn: "1027700678901",
    address: "г. Москва, ул. Кейтеринговая, д. 2",
    director: "Орлова М.М.",
  },
};

interface Props {
  contractorId: string;
  backFallbackHref: string;
  accountRole?: UserRole | null;
  fromResponses?: boolean;
  fromEvent?: boolean;
  requestId?: string | null;
  responseId?: string | null;
}

export function ContractorDetailSection({
  contractorId,
  backFallbackHref,
  accountRole = null,
  fromResponses = false,
  fromEvent = false,
  requestId,
  responseId,
}: Props) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { requests, responses } = usePrototypeStore();
  const from = useSearchParams().get("from");

  const contractor = SEED_CONTRACTORS.find((entry) => entry.id === contractorId);
  if (!contractor) return null;

  const request = requestId ? requests.find((item) => item.id === requestId) : undefined;
  const response = responseId ? responses.find((item) => item.id === responseId) : undefined;

  const showFollowUpActions =
    isAuthenticated &&
    user?.role === "customer" &&
    fromResponses &&
    !!request &&
    !!response &&
    response.contractorId === contractor.id &&
    response.requestId === request.id &&
    request.customerId === user.id &&
    response.status !== "rejected";

  const requisites = MOCK_REQUISITES[contractor.companyId] ?? {
    inn: "0000000000",
    ogrn: "0000000000000",
    address: contractor.city,
    director: "—",
  };

  const services = SEED_SERVICES.filter((service) => service.contractorId === contractor.id);
  const linkRole = accountRole ?? user?.role ?? null;

  return (
    <>
      <BackButton
        fallbackHref={backFallbackHref}
        className="mb-4"
        onClick={from ? () => router.push(backFallbackHref) : undefined}
      />

      {(contractor.verified ||
        contractor.hasProduction ||
        contractor.inRsvya ||
        contractor.inSroVz) && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {contractor.verified && <Badge variant="solid">Проверен</Badge>}
          {contractor.hasProduction && <Badge variant="outline">Своё производство</Badge>}
          <ContractorRegistryBadges inRsvya={contractor.inRsvya} inSroVz={contractor.inSroVz} />
        </div>
      )}

      <h1 className="text-2xl font-bold mb-3">{contractor.name}</h1>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <p className="text-sm text-gray-600 mb-2">
            {contractor.city} · {contractor.geography}
          </p>
          <p className="text-sm text-gray-600 flex items-center gap-1 mb-6">
            <Star className="h-4 w-4 fill-gray-900" />
            {contractor.rating} · {contractor.reviewCount} отзывов
          </p>

          <div className="flex flex-wrap items-center gap-3 mb-8">
            <Link href={`/requests/new?contractorId=${contractor.id}`}>
              <Button variant="primary">Пригласить в заявку</Button>
            </Link>
            <Link
              href={from ? withFromParam(`/services?contractor=${contractor.id}`, from) : `/services?contractor=${contractor.id}`}
            >
              <Button variant="outline">Услуги исполнителя</Button>
            </Link>
          </div>

          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-2">О компании</h2>
              <p className="text-sm text-gray-700">{contractor.description}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {contractor.categories.map((category) => (
                  <span key={category} className="text-xs border border-[#d4d4d4] rounded-[10px] px-2 py-1">
                    {category}
                  </span>
                ))}
              </div>
            </section>

            <section id="portfolio">
              <h2 className="text-lg font-semibold mb-3">Портфолио</h2>
              {contractor.portfolio.length === 0 ? (
                <p className="text-sm text-gray-600">Портфолио пока не добавлено</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                  {contractor.portfolio.map((item) => (
                    <PortfolioCard
                      key={item.id}
                      item={item}
                      href={getContractorPortfolioHref(contractor.id, item.id, linkRole, from)}
                    />
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">Отзывы</h2>
              {contractor.reviews.length === 0 ? (
                <p className="text-sm text-gray-600">Отзывов пока нет</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contractor.reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}
            </section>

            {services.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-3">Услуги</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {services.map((service) => (
                    <Link
                      key={service.id}
                      href={from ? withFromParam(`/services/${service.id}`, from) : `/services/${service.id}`}
                    >
                      <Card hoverable className="h-full">
                        <CardTitle>{service.title}</CardTitle>
                        <p className="text-xs text-gray-600 mt-1">{service.category}</p>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20">
          {showFollowUpActions && (
            <ResponseFollowUpActions
              contractorId={contractor.id}
              requestId={requestId ?? undefined}
              responseId={responseId ?? undefined}
              accountRole={accountRole}
            />
          )}

          <section className="rounded-[10px] border border-[#d4d4d4] bg-white p-4">
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
            <Link
              href={getContractorCheckHref(contractor.id, {
                role: linkRole,
                from: from ?? (linkRole ? "checks" : undefined),
              })}
              className="block w-full mt-4"
            >
              <Button variant="outline" className="w-full" size="sm">
                Проверить контрагента
              </Button>
            </Link>
          </section>
        </aside>
      </div>
    </>
  );
}