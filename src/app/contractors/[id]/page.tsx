"use client";

import { ContractorDetailSection } from "@/components/contractors/contractor-detail-section";
import { CabinetAwareLayout } from "@/components/layout/cabinet-aware-layout";
import { EmptyState } from "@/components/ui/states";
import { SEED_CONTRACTORS } from "@/data/mocks/seed";
import { useParams } from "next/navigation";

export default function PublicContractorPage() {
  const params = useParams();
  const id = params.id as string;
  const contractor = SEED_CONTRACTORS.find((item) => item.id === id);

  if (!contractor) {
    return (
      <CabinetAwareLayout title="Исполнитель">
        <EmptyState title="Исполнитель не найден" />
      </CabinetAwareLayout>
    );
  }

  return (
    <CabinetAwareLayout title={contractor.name}>
      <ContractorDetailSection contractorId={id} backFallbackHref="/contractors" />
    </CabinetAwareLayout>
  );
}
