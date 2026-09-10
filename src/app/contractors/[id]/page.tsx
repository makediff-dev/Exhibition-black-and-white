"use client";

import { notFound, useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CabinetAwareLayout } from "@/components/layout/cabinet-aware-layout";
import { ContractorDetailSection } from "@/components/contractors/contractor-detail-section";
import { SEED_CONTRACTORS } from "@/data/mocks/seed";
import { useCabinetSession } from "@/lib/hooks/use-cabinet-session";
import { getCabinetBackHref } from "@/lib/utils/message-related-links";

function ContractorDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { accountRole } = useCabinetSession();
  const id = params.id as string;
  const from = searchParams.get("from");
  const fromResponses = from === "responses";
  const requestId = searchParams.get("requestId");
  const responseId = searchParams.get("responseId");

  const contractor = SEED_CONTRACTORS.find((entry) => entry.id === id);
  if (!contractor) notFound();

  const backFallbackHref =
    getCabinetBackHref(from, "", accountRole) ||
    (fromResponses && requestId ? `/requests/${requestId}/responses` : "/contractors");

  return (
    <ContractorDetailSection
      contractorId={id}
      backFallbackHref={backFallbackHref}
      accountRole={accountRole}
      fromResponses={fromResponses}
      requestId={requestId}
      responseId={responseId}
    />
  );
}

export default function ContractorDetailPage() {
  return (
    <CabinetAwareLayout>
      <Suspense fallback={<p className="text-sm text-gray-600">Загрузка...</p>}>
        <ContractorDetailContent />
      </Suspense>
    </CabinetAwareLayout>
  );
}