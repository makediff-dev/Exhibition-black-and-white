"use client";

import { notFound, useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CabinetAwareLayout } from "@/components/layout/cabinet-aware-layout";
import { ContractorDetailSection } from "@/components/contractors/contractor-detail-section";
import { SEED_CONTRACTORS } from "@/data/mocks/seed";

function ContractorDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const fromResponses = searchParams.get("from") === "responses";
  const requestId = searchParams.get("requestId");
  const responseId = searchParams.get("responseId");

  const contractor = SEED_CONTRACTORS.find((entry) => entry.id === id);
  if (!contractor) notFound();

  const backFallbackHref =
    fromResponses && requestId ? `/requests/${requestId}/responses` : "/contractors";

  return (
    <ContractorDetailSection
      contractorId={id}
      backFallbackHref={backFallbackHref}
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