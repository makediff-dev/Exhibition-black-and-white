"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ContractorCheckSection } from "@/components/contractors/contractor-check-section";
import { ContractorCheckSubscribeSection } from "@/components/contractors/contractor-check-subscribe-section";
import { ContractorDetailSection } from "@/components/contractors/contractor-detail-section";
import { PortfolioDetail } from "@/components/contractors/portfolio-detail";
import { EmptyState } from "@/components/ui/states";
import { SEED_CONTRACTORS } from "@/data/mocks/seed";
import type { UserRole } from "@/data/types";
import {
  getContractorCheckHref,
  getContractorProfileHref,
  parseContractorAccountSlug,
} from "@/lib/utils/contractor-profile-links";

interface Props {
  slug: string;
  role: UserRole;
}

function AccountContractorSectionContent({ slug, role }: Props) {
  const searchParams = useSearchParams();
  const parsed = parseContractorAccountSlug(slug);

  if (!parsed) {
    return <EmptyState title="Раздел не найден" />;
  }

  if (parsed.type === "portfolio") {
    const contractor = SEED_CONTRACTORS.find((entry) => entry.id === parsed.contractorId);
    const item = contractor?.portfolio.find((entry) => entry.id === parsed.itemId);

    if (!contractor || !item) {
      return (
        <EmptyState
          title="Работа не найдена"
          description="Проверьте ссылку или вернитесь к профилю исполнителя"
        />
      );
    }

    return (
      <PortfolioDetail
        item={item}
        backHref={getContractorProfileHref(parsed.contractorId, { role })}
        editable={false}
      />
    );
  }

  if (parsed.type === "check") {
    const contractor = SEED_CONTRACTORS.find((entry) => entry.id === parsed.contractorId);
    if (!contractor) {
      return <EmptyState title="Исполнитель не найден" />;
    }

    return (
      <ContractorCheckSection
        contractorId={parsed.contractorId}
        backFallbackHref={getContractorProfileHref(parsed.contractorId, { role })}
        accountRole={role}
      />
    );
  }

  if (parsed.type === "checkSubscribe") {
    const contractor = SEED_CONTRACTORS.find((entry) => entry.id === parsed.contractorId);
    if (!contractor) {
      return <EmptyState title="Исполнитель не найден" />;
    }

    const fromResponses = searchParams.get("from") === "responses";
    const requestId = searchParams.get("requestId");
    const responseId = searchParams.get("responseId");

    const backFallbackHref =
      fromResponses && requestId
        ? getContractorProfileHref(parsed.contractorId, {
            role,
            from: "responses",
            requestId,
            responseId: responseId ?? undefined,
          })
        : getContractorCheckHref(parsed.contractorId, { role });

    return (
      <ContractorCheckSubscribeSection
        contractorId={parsed.contractorId}
        backFallbackHref={backFallbackHref}
        accountRole={role}
      />
    );
  }

  const fromResponses = searchParams.get("from") === "responses";
  const requestId = searchParams.get("requestId");
  const responseId = searchParams.get("responseId");

  const backFallbackHref =
    fromResponses && requestId
      ? role === "customer"
        ? `/account/customer/responses`
        : `/requests/${requestId}/responses`
      : `/account/${role}`;

  const contractor = SEED_CONTRACTORS.find((entry) => entry.id === parsed.contractorId);
  if (!contractor) {
    return <EmptyState title="Исполнитель не найден" />;
  }

  return (
    <ContractorDetailSection
      contractorId={parsed.contractorId}
      backFallbackHref={backFallbackHref}
      accountRole={role}
      fromResponses={fromResponses}
      requestId={requestId}
      responseId={responseId}
    />
  );
}

export function AccountContractorSection({ slug, role }: Props) {
  return (
    <Suspense fallback={<p className="text-sm text-gray-600">Загрузка...</p>}>
      <AccountContractorSectionContent slug={slug} role={role} />
    </Suspense>
  );
}