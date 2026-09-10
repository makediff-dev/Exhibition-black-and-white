"use client";

import { notFound, useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CabinetAwareLayout } from "@/components/layout/cabinet-aware-layout";
import { PortfolioDetail } from "@/components/contractors/portfolio-detail";
import { SEED_CONTRACTORS } from "@/data/mocks/seed";
import { useCabinetSession } from "@/lib/hooks/use-cabinet-session";
import { getContractorProfileHref } from "@/lib/utils/contractor-profile-links";

function ContractorPortfolioItemContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const contractorId = params.id as string;
  const itemId = params.itemId as string;
  const from = searchParams.get("from");
  const { accountRole } = useCabinetSession();

  const contractor = SEED_CONTRACTORS.find((entry) => entry.id === contractorId);
  const item = contractor?.portfolio.find((entry) => entry.id === itemId);

  if (!contractor || !item) notFound();

  return (
    <PortfolioDetail
      item={item}
      backHref={getContractorProfileHref(contractorId, {
        role: accountRole,
        from: from ?? undefined,
      })}
      editable={false}
    />
  );
}

export default function ContractorPortfolioItemPage() {
  return (
    <CabinetAwareLayout>
      <Suspense fallback={<p className="text-sm text-gray-600">Загрузка...</p>}>
        <ContractorPortfolioItemContent />
      </Suspense>
    </CabinetAwareLayout>
  );
}
